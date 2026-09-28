import { io, Socket } from "socket.io-client";
import { getApiBaseUrl } from "./utils";
import { getQueryClient } from "@/providers/QueryProvider";

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (typeof window === "undefined") {
    return null as unknown as Socket;
  }

  const token = localStorage.getItem("token") || "";

  if (!socketInstance) {
    const apiBase = getApiBaseUrl();

    socketInstance = io(apiBase, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      // Re-join user room upon reconnect if token is active
      const refreshedToken = localStorage.getItem("token");
      if (refreshedToken && socketInstance?.auth) {
        socketInstance.auth = { token: refreshedToken };
      }
    });

    socketInstance.on("connect_error", (error) => {
      console.warn("Real-time socket connection notice:", error.message);
    });

    // Central event listeners that automatically invalidate TanStack queries
    socketInstance.on("attendance:marked", () => {
      const qc = getQueryClient();
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["child-attendance"] });
      qc.invalidateQueries({ queryKey: ["parent"] });
    });

    socketInstance.on("homework:assigned", () => {
      const qc = getQueryClient();
      qc.invalidateQueries({ queryKey: ["homework"] });
      qc.invalidateQueries({ queryKey: ["child-homework"] });
    });

    socketInstance.on("notification:created", () => {
      const qc = getQueryClient();
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["parent"] });
    });

    // Chat Message Events
    const handleNewMessage = () => {
      const qc = getQueryClient();
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["unread-count"] });
    };

    socketInstance.on("chat:message:new", handleNewMessage);
    socketInstance.on("message:new", handleNewMessage);
    socketInstance.on("message:received", handleNewMessage);

    socketInstance.on("chat:message:read", () => {
      const qc = getQueryClient();
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["unread-count"] });
    });

    socketInstance.on("chat:unread:updated", () => {
      const qc = getQueryClient();
      qc.invalidateQueries({ queryKey: ["unread-count"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    });

    socketInstance.on("fee:updated", () => {
      const qc = getQueryClient();
      qc.invalidateQueries({ queryKey: ["fees"] });
      qc.invalidateQueries({ queryKey: ["child-fees"] });
    });

    // Admission Enquiry Real-time Events
    const handleAdmissionEnquiryUpdate = () => {
      const qc = getQueryClient();
      qc.invalidateQueries({ queryKey: ["admissions-enquiries"] });
      qc.invalidateQueries({ queryKey: ["admissions"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["admin-kpis"] });
    };

    socketInstance.on("admission:enquiry:new", handleAdmissionEnquiryUpdate);
    socketInstance.on("admission:enquiry:updated", handleAdmissionEnquiryUpdate);
    socketInstance.on("admission:enquiry:status-changed", handleAdmissionEnquiryUpdate);
    socketInstance.on("admission:enquiry:assigned", handleAdmissionEnquiryUpdate);
    socketInstance.on("admission:enquiry:follow-up-created", handleAdmissionEnquiryUpdate);
    socketInstance.on("admission:enquiry:converted", handleAdmissionEnquiryUpdate);
    socketInstance.on("admission:enquiry:closed", handleAdmissionEnquiryUpdate);
    socketInstance.on("admission:new", handleAdmissionEnquiryUpdate);
  } else if (token && socketInstance.auth && (socketInstance.auth as any).token !== token) {
    (socketInstance.auth as any).token = token;
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
  }

  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function joinRoom(room: string): void {
  const socket = getSocket();
  if (socket) {
    if (socket.connected) {
      socket.emit("join_room", room);
      socket.emit("join-room", room);
    } else {
      socket.once("connect", () => {
        socket.emit("join_room", room);
        socket.emit("join-room", room);
      });
    }
  }
}

export function leaveRoom(room: string): void {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit("leave_room", room);
    socket.emit("leave-room", room);
  }
}
