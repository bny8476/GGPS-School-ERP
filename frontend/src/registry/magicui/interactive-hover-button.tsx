import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ children, className, href, onClick, ...props }, ref) => {
  const content = (
    <>
      <div className="flex items-center justify-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[#0050CB] transition-all duration-300 group-hover:scale-[100.8]" />
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0 font-bold">
          {children}
        </span>
      </div>
      <div className="text-white absolute top-0 left-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100 font-bold">
        <span>{children}</span>
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </div>
    </>
  );

  const baseClasses = cn(
    "group relative inline-flex items-center justify-center w-auto cursor-pointer overflow-hidden rounded-full border border-[#0050CB]/30 dark:border-slate-700 bg-white dark:bg-[#001438] h-9 px-4 sm:px-5 text-center font-bold text-xs sm:text-sm text-[#000E28] dark:text-white transition-all duration-300 shadow-xs hover:border-[#0050CB] hover:shadow-md select-none",
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";
export default InteractiveHoverButton;
