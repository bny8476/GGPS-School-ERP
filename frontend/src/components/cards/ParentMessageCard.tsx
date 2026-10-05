"use client";

import React from "react";
import { MessageSquare, Phone, ArrowRight } from "lucide-react";
import PremiumCard from "./PremiumCard";
import AppImage from "@/components/ui/AppImage";

export interface ParentMessageCardProps {
  id: string;
  parentName: string;
  parentLabel: string;
  childName: string;
  rollNo: string;
  phone: string;
  avatar?: string;
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
  onSendMessage: () => void;
  className?: string;
}

export default function ParentMessageCard({
  parentName,
  parentLabel,
  childName,
  rollNo,
  phone,
  avatar,
  lastMessage,
  time,
  unreadCount = 0,
  onSendMessage,
  className = "",
}: ParentMessageCardProps) {
  return (
    <PremiumCard
      variant="interactive"
      className={`p-4 sm:p-5 flex flex-col justify-between group ${className}`}
      onClick={onSendMessage}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <AppImage
              src={avatar}
              alt={parentName}
              fallbackType="avatar"
              name={parentName}
              className="w-12 h-12 rounded-[14px] object-cover ring-1 ring-rose-200 dark:ring-rose-800/40 shrink-0"
            />

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {parentLabel}
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white leading-tight group-hover:text-[#3157D5] dark:group-hover:text-blue-400 transition-colors">
                {parentName}
              </h4>
              <p className="text-xs text-[#3157D5] dark:text-blue-400 font-medium mt-0.5">
                Child: {childName} (Roll {rollNo})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSendMessage();
            }}
            className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#F04438] flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
            title="Chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>

        {lastMessage && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
            &ldquo;{lastMessage}&rdquo;
          </p>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
          <Phone className="w-3 h-3 text-slate-400" />
          <span>{phone}</span>
        </div>

        {time && <span className="text-[11px] text-slate-400">{time}</span>}
      </div>
    </PremiumCard>
  );
}
