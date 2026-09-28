"use client";

import React, { Suspense } from "react";
import AdminEnquiriesManager from "@/components/admin/AdminEnquiriesManager";

export default function AdminEnquiriesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading admissions enquiries workspace...</div>}>
      <AdminEnquiriesManager />
    </Suspense>
  );
}
