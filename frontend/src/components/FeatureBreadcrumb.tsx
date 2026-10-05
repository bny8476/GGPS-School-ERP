"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface FeatureBreadcrumbProps {
  currentPage: string;
}

export default function FeatureBreadcrumb({ currentPage }: FeatureBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
      <ol className="flex items-center flex-wrap gap-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-[#0050CB] dark:hover:text-[#38BDF8] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>
        <li className="flex items-center text-slate-300 dark:text-slate-600">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>
        <li>
          <Link
            href="/features"
            className="hover:text-[#0050CB] dark:hover:text-[#38BDF8] transition-colors"
          >
            Features
          </Link>
        </li>
        <li className="flex items-center text-slate-300 dark:text-slate-600">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>
        <li className="text-[#0050CB] dark:text-[#38BDF8] font-bold truncate max-w-[200px] sm:max-w-none" aria-current="page">
          {currentPage}
        </li>
      </ol>
    </nav>
  );
}
