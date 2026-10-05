"use client";

import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import AppImage from './AppImage';

/* ==========================================================================
   1. BASE CARD PRIMITIVES
   ========================================================================== */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  variant?: 'default' | 'flat' | 'gradient' | 'goldAccent' | 'bordered';
  children: React.ReactNode;
  className?: string;
}

export function Card({
  hoverable = true,
  variant = 'default',
  children,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = "group rounded-[24px] sm:rounded-[28px] p-6 transition-all duration-200";
  
  const variantStyles = {
    default: "bg-white dark:bg-[#07152F] border border-slate-200/80 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100",
    flat: "bg-slate-50 dark:bg-[#0B1F3A]/60 border border-slate-200/60 dark:border-slate-800/80 text-slate-900 dark:text-slate-100",
    gradient: "bg-gradient-to-br from-[#07152F] via-[#0B1F3A] to-[#0757D5] border border-white/15 shadow-xl text-white",
    goldAccent: "bg-white dark:bg-[#07152F] border border-[#C9A227]/30 dark:border-[#C9A227]/40 shadow-md text-slate-900 dark:text-slate-100 ring-1 ring-[#C9A227]/20",
    bordered: "bg-transparent border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100",
  };

  const hoverStyles = hoverable ? "hover-card-elevation" : "";

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col space-y-1 mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-base sm:text-lg font-black tracking-tight text-[#07152F] dark:text-white transition-colors duration-200 group-hover:text-[#0050CB] dark:group-hover:text-[#38BDF8] ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed transition-colors duration-200 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 ${className}`}>
      {children}
    </div>
  );
}

/* ==========================================================================
   2. STATISTIC / KPI CARD TEMPLATE
   ========================================================================== */

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  subtitle?: string;
  badgeText?: string;
  iconBgColor?: string;
  iconTextColor?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  badgeText,
  iconBgColor = "bg-[#E5EEFF] dark:bg-[#0757D5]/20",
  iconTextColor = "text-[#0757D5] dark:text-[#2F80ED]",
  className = "",
  onClick,
}: StatCardProps) {
  // Parse numerical value for count-up animation if possible
  const renderValue = () => {
    if (typeof value === 'number') {
      return <AnimatedNumber to={value} />;
    }
    if (typeof value === 'string') {
      const match = value.match(/^([^0-9.-]*)([0-9,.]+)([^0-9.]*)$/);
      if (match) {
        const prefix = match[1] || '';
        const numStr = match[2].replace(/,/g, '');
        const suffix = match[3] || '';
        const num = parseFloat(numStr);
        if (!isNaN(num)) {
          const hasDecimals = match[2].includes('.');
          const decimals = hasDecimals ? match[2].split('.')[1].length : 0;
          return <AnimatedNumber to={num} prefix={prefix} suffix={suffix} decimals={decimals} />;
        }
      }
    }
    return value;
  };

  return (
    <Card 
      className={`flex flex-col justify-between h-full ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl ${iconBgColor} ${iconTextColor} flex items-center justify-center shadow-xs shrink-0 transition-transform duration-200 group-hover:scale-105`}>
            <Icon className="w-6 h-6" strokeWidth={2.2} />
          </div>
          {badgeText && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#E5EEFF] dark:bg-[#0757D5]/20 text-[#0757D5] dark:text-[#2F80ED] border border-blue-200/50 dark:border-[#0757D5]/40 transition-transform group-hover:scale-105">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0757D5] dark:bg-[#2F80ED] animate-pulse" />
              {badgeText}
            </span>
          )}
        </div>

        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          {title}
        </p>
        
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-3xl sm:text-4xl font-black text-[#07152F] dark:text-white tracking-tight">
            {renderValue()}
          </h3>
          {trend && (
            <span className={`text-xs font-bold inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full ${
              trend.isPositive !== false
                ? "text-[#12B76A] bg-emerald-50 dark:bg-emerald-950/40"
                : "text-[#EF4444] bg-rose-50 dark:bg-rose-950/40"
            }`}>
              {trend.isPositive !== false ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend.value}
            </span>
          )}
        </div>
      </div>

      {subtitle && (
        <CardFooter className="mt-4 pt-3.5">
          <span className="font-semibold text-slate-500 dark:text-slate-400">{subtitle}</span>
        </CardFooter>
      )}
    </Card>
  );
}

/* ==========================================================================
   3. PROFILE CARD TEMPLATE (Student / Teacher / Parent)
   ========================================================================== */

export interface ProfileCardProps {
  name: string;
  roleOrGrade: string;
  idOrSubtext?: string;
  avatarUrl?: string;
  initials?: string;
  statusBadge?: {
    text: string;
    type?: 'success' | 'warning' | 'info' | 'primary';
  };
  metadata?: Array<{ label: string; value: string | number }>;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  className?: string;
}

export function ProfileCard({
  name,
  roleOrGrade,
  idOrSubtext,
  avatarUrl,
  initials,
  statusBadge,
  metadata = [],
  primaryActionText = "View Record",
  onPrimaryAction,
  className = "",
}: ProfileCardProps) {
  const getBadgeStyle = (type = 'primary') => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-[#12B76A] border-emerald-200 dark:border-emerald-800/60';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/40 text-[#F59E0B] border-amber-200 dark:border-amber-800/60';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950/40 text-[#2F80ED] border-blue-200 dark:border-blue-800/60';
      default:
        return 'bg-[#E5EEFF] dark:bg-[#0757D5]/20 text-[#0757D5] dark:text-[#2F80ED] border-blue-200 dark:border-blue-800/60';
    }
  };

  return (
    <Card className={`flex flex-col justify-between h-full ${className}`}>
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <AppImage
              src={avatarUrl}
              alt={name}
              fallbackType="avatar"
              name={name}
              initials={initials}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#0757D5]/20 shrink-0"
            />
            <div>
              <h3 className="font-black text-sm sm:text-base text-[#07152F] dark:text-white leading-tight">
                {name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                {roleOrGrade}
              </p>
              {idOrSubtext && (
                <p className="text-[11px] text-[#0757D5] dark:text-[#2F80ED] font-mono font-bold mt-0.5">
                  {idOrSubtext}
                </p>
              )}
            </div>
          </div>

          {statusBadge && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getBadgeStyle(statusBadge.type)}`}>
              {statusBadge.text}
            </span>
          )}
        </div>

        {metadata.length > 0 && (
          <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-2xl bg-slate-50 dark:bg-[#0B1F3A]/60 border border-slate-100 dark:border-slate-800/80">
            {metadata.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.label}</p>
                <p className="text-xs font-black text-[#07152F] dark:text-slate-200">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {onPrimaryAction && (
        <button
          onClick={onPrimaryAction}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0757D5] hover:text-white dark:hover:bg-[#0757D5] text-xs font-bold text-[#07152F] dark:text-slate-200 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer hover-button-micro"
        >
          <span>{primaryActionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </Card>
  );
}

/* ==========================================================================
   4. ACTION CARD TEMPLATE
   ========================================================================== */

export interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  badgeText?: string;
  className?: string;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  badgeText,
  className = "",
}: ActionCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer group flex flex-col justify-between h-full hover:border-[#0757D5]/40 dark:hover:border-blue-500/40 ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#E5EEFF] dark:bg-[#0757D5]/20 text-[#0757D5] dark:text-[#2F80ED] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200">
            <Icon className="w-5 h-5" strokeWidth={2.2} />
          </div>
          {badgeText && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full">
              {badgeText}
            </span>
          )}
        </div>

        <h4 className="text-sm sm:text-base font-black text-[#07152F] dark:text-white tracking-tight group-hover:text-[#0757D5] dark:group-hover:text-[#2F80ED] transition-colors">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 flex items-center gap-1 text-xs font-bold text-[#0757D5] dark:text-[#2F80ED] group-hover:translate-x-1 transition-transform">
        <span>Continue</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Card>
  );
}

/* ==========================================================================
   5. EMPTY STATE CARD TEMPLATE
   ========================================================================== */

export interface EmptyStateCardProps {
  title?: string;
  description?: string;
  icon?: React.ElementType | string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyStateCard({
  title = "No Records Found",
  description = "There are currently no items available to display.",
  icon = "📚",
  actionText,
  onAction,
  className = "",
}: EmptyStateCardProps) {
  const isEmoji = typeof icon === 'string';
  const IconComponent = !isEmoji ? (icon as React.ElementType) : null;

  return (
    <Card className={`text-center py-10 px-6 flex flex-col items-center justify-center ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#0B1F3A] border border-slate-200/80 dark:border-slate-800 flex items-center justify-center mb-4 text-2xl shadow-xs">
        {isEmoji ? icon : IconComponent && <IconComponent className="w-7 h-7 text-slate-400" />}
      </div>
      <h4 className="text-base font-black text-[#07152F] dark:text-white tracking-tight">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed font-medium">
        {description}
      </p>
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-2.5 rounded-full bg-[#0757D5] hover:bg-[#1469E8] text-white text-xs font-bold transition-all shadow-md cursor-pointer hover-button-micro"
        >
          {actionText}
        </button>
      )}
    </Card>
  );
}

/* ==========================================================================
   6. ERROR CARD TEMPLATE
   ========================================================================== */

export interface ErrorCardProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorCard({
  title = "Unable to Load Data",
  description = "A problem occurred while communicating with the server. Please check your network connection.",
  onRetry,
  className = "",
}: ErrorCardProps) {
  return (
    <Card className={`border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 text-center py-8 px-6 flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-[#EF4444] flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-black text-rose-900 dark:text-rose-200">{title}</h4>
      <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mt-1 font-medium">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 rounded-full bg-[#EF4444] hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </Card>
  );
}

/* ==========================================================================
   7. SKELETON LOADING CARD TEMPLATE
   ========================================================================== */

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <Card className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl shimmer-skeleton" />
        <div className="w-20 h-5 rounded-full shimmer-skeleton" />
      </div>
      <div className="space-y-2">
        <div className="w-28 h-3.5 rounded-md shimmer-skeleton" />
        <div className="w-36 h-8 rounded-lg shimmer-skeleton" />
      </div>
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="w-24 h-3 rounded-md shimmer-skeleton" />
        <div className="w-16 h-3 rounded-md shimmer-skeleton" />
      </div>
    </Card>
  );
}
