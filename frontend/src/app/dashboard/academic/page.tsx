"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, BookOpen, Clock, Plus, Trash2, Edit2, Users, CheckCircle2, 
  ChevronDown, Check, Sparkles, Building, Layers, RefreshCw, X,
  Filter, LayoutGrid, List as ListIcon, MoreVertical, Eye, Lightbulb, ArrowRight,
  SlidersHorizontal, XCircle, Search, Home, ChevronRight, Shield,
  Atom, Palette, Music, Dumbbell, Laptop, Globe, Star, FileText, GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { getApiBaseUrl } from '@/lib/utils';
import { authFetch } from '@/lib/apiClient';
import { getCurrentAcademicYearFormatted } from '@/lib/date';

// Terms Hero Illustration with Foliage, 3D Stacked Books, Graduation Cap, Calendar Sheet & Cursive Script
function TermsHeroIllustration() {
  return (
    <div className="hidden lg:flex items-center gap-4 relative pr-2 select-none">
      <svg
        width="230"
        height="125"
        viewBox="0 0 230 125"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible drop-shadow-sm"
      >
        <defs>
          <linearGradient id="bookBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0050CB" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="bookCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="bookPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <linearGradient id="calHeaderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <filter id="softShadow" x="-15%" y="-15%" width="130%" height="135%">
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#003E9E" floodOpacity="0.14" />
          </filter>
        </defs>

        {/* Soft Watercolor Foliage in Background */}
        <g opacity="0.65">
          {/* Left floral leaves */}
          <path d="M 28 100 C 14 78 4 58 17 32 C 26 50 31 72 28 100 Z" fill="#BFDBFE" />
          <path d="M 22 68 C 6 56 -3 42 3 28 C 13 36 20 52 22 68 Z" fill="#93C5FD" />
          <path d="M 24 82 C 34 72 44 60 40 45 C 32 55 28 68 24 82 Z" fill="#DBEAFE" />
          {/* Right floral leaves behind calendar */}
          <path d="M 182 100 C 192 80 206 60 196 36 C 185 52 184 72 182 100 Z" fill="#BFDBFE" />
          <path d="M 186 72 C 200 60 210 46 204 32 C 193 40 188 56 186 72 Z" fill="#93C5FD" />
          <path d="M 180 84 C 170 70 162 58 168 44 C 174 56 177 70 180 84 Z" fill="#DBEAFE" />
        </g>

        {/* Calendar Card in Background */}
        <g transform="translate(122, 18)" filter="url(#softShadow)">
          {/* Calendar base card */}
          <rect x="0" y="0" width="60" height="74" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Calendar top header */}
          <path d="M 0 8 Q 0 0 8 0 L 52 0 Q 60 0 60 8 L 60 17 L 0 17 Z" fill="url(#calHeaderGrad)" />
          {/* Binder coils */}
          <rect x="9" y="-3" width="3" height="7" rx="1.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.5" />
          <rect x="22" y="-3" width="3" height="7" rx="1.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.5" />
          <rect x="35" y="-3" width="3" height="7" rx="1.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.5" />
          <rect x="48" y="-3" width="3" height="7" rx="1.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.5" />
          {/* Calendar month grid cells */}
          <g transform="translate(6, 23)">
            {[0, 1, 2, 3].map((row) => (
              <g key={row} transform={`translate(0, ${row * 11})`}>
                {[0, 1, 2, 3, 4].map((col) => {
                  const isChecked = (row === 1 && col === 2) || (row === 2 && col === 3);
                  const isPurple = (row === 0 && col === 3) || (row === 3 && col === 1);
                  return (
                    <rect
                      key={col}
                      x={col * 9.8}
                      y="0"
                      width="7"
                      height="7"
                      rx="2"
                      fill={isChecked ? '#3B82F6' : isPurple ? '#DDD6FE' : '#F1F5F9'}
                    />
                  );
                })}
              </g>
            ))}
          </g>
        </g>

        {/* Stacked Books */}
        <g transform="translate(42, 52)" filter="url(#softShadow)">
          {/* Book 3 (Bottom) */}
          <g transform="translate(0, 32)">
            <path d="M 0 4 Q 0 0 4 0 L 80 0 L 80 14 L 4 14 Q 0 14 0 10 Z" fill="url(#bookPurpleGrad)" />
            <rect x="80" y="2" width="6" height="10" rx="1" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5" />
            <line x1="8" y1="0" x2="8" y2="14" stroke="#A5B4FC" strokeWidth="1" strokeOpacity="0.6" />
          </g>

          {/* Book 2 (Middle) */}
          <g transform="translate(4, 16)">
            <path d="M 0 4 Q 0 0 4 0 L 76 0 L 76 13 L 4 13 Q 0 13 0 9 Z" fill="url(#bookCyanGrad)" />
            <rect x="76" y="2" width="6" height="9" rx="1" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />
            <line x1="8" y1="0" x2="8" y2="13" stroke="#BAE6FD" strokeWidth="1" strokeOpacity="0.7" />
          </g>

          {/* Book 1 (Top) */}
          <g transform="translate(2, 0)">
            <path d="M 0 4 Q 0 0 4 0 L 74 0 L 74 13 L 4 13 Q 0 13 0 9 Z" fill="url(#bookBlueGrad)" />
            <rect x="74" y="2" width="6" height="9" rx="1" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5" />
            <line x1="7" y1="0" x2="7" y2="13" stroke="#93C5FD" strokeWidth="1" strokeOpacity="0.7" />
          </g>
        </g>

        {/* Graduation Mortarboard */}
        <g transform="translate(50, 22)" filter="url(#softShadow)">
          {/* Cap Skullcap */}
          <path d="M 18 17 Q 32 23 46 17 L 46 22 Q 32 28 18 22 Z" fill="#002870" />
          {/* Diamond Top */}
          <path d="M 32 2 L 62 14 L 32 24 L 2 14 Z" fill="#0050CB" stroke="#1D4ED8" strokeWidth="0.8" />
          {/* Highlight facet */}
          <path d="M 32 2 L 62 14 L 32 24 Z" fill="#1E40AF" opacity="0.35" />
          {/* Cap Button */}
          <circle cx="32" cy="13" r="2.5" fill="#60A5FA" />
          {/* Tassel cord */}
          <path d="M 32 13 C 24 13 14 18 12 25 C 10 30 11 36 10 40" fill="none" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
          {/* Tassel brush */}
          <rect x="8" y="38" width="4.5" height="7" rx="1.5" fill="#38BDF8" />
        </g>
      </svg>

      {/* Cursive Handwriting Text matching image */}
      <div className="flex flex-col text-left -ml-1">
        <span 
          style={{ fontFamily: "'Caveat', cursive" }} 
          className="text-[#0050CB] dark:text-[#38BDF8] text-2xl font-bold leading-tight select-none rotate-[-4deg] drop-shadow-xs"
        >
          Better<br />
          Learning<br />
          Together
        </span>
      </div>
    </div>
  );
}

// Institutional Academic Sessions Vector Artwork matching reference image
function SessionsHeroIllustration() {
  return (
    <div className="hidden md:flex items-center relative pr-2 select-none">
      <svg
        width="150"
        height="95"
        viewBox="0 0 150 95"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible drop-shadow-sm"
      >
        <defs>
          <linearGradient id="sessionCalHeader" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <filter id="sessionShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#003E9E" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Soft pastel foliage leaves */}
        <g opacity="0.65">
          <path d="M 16 75 C 6 58 0 42 10 24 C 18 36 22 52 16 75 Z" fill="#BFDBFE" />
          <path d="M 20 52 C 10 42 6 30 14 18 C 21 26 24 38 20 52 Z" fill="#93C5FD" />
          <path d="M 132 75 C 142 58 148 42 138 24 C 130 36 126 52 132 75 Z" fill="#BFDBFE" />
          <path d="M 128 52 C 138 42 142 30 134 18 C 127 26 124 38 128 52 Z" fill="#93C5FD" />
        </g>

        {/* Calendar Base Card */}
        <g transform="translate(42, 10)" filter="url(#sessionShadow)">
          <rect x="0" y="0" width="66" height="74" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Header */}
          <path d="M 0 10 Q 0 0 10 0 L 56 0 Q 66 0 66 10 L 66 18 L 0 18 Z" fill="url(#sessionCalHeader)" />
          {/* Binder coils */}
          <rect x="13" y="-3" width="3" height="7" rx="1.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.5" />
          <rect x="26" y="-3" width="3" height="7" rx="1.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.5" />
          <rect x="39" y="-3" width="3" height="7" rx="1.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.5" />
          <rect x="51" y="-3" width="3" height="7" rx="1.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.5" />
          {/* Calendar grid cells */}
          <g transform="translate(7, 24)">
            {[0, 1, 2, 3].map((row) => (
              <g key={row} transform={`translate(0, ${row * 11})`}>
                {[0, 1, 2, 3, 4].map((col) => {
                  const isBlue = (row === 1 && col === 2) || (row === 2 && col === 3);
                  return (
                    <rect
                      key={col}
                      x={col * 10.5}
                      y="0"
                      width="7.5"
                      height="7.5"
                      rx="2"
                      fill={isBlue ? '#3B82F6' : '#F1F5F9'}
                    />
                  );
                })}
              </g>
            ))}
          </g>
        </g>

        {/* Clock Badge Overlapping at Bottom Right */}
        <g transform="translate(90, 52)" filter="url(#sessionShadow)">
          <circle cx="16" cy="16" r="16" fill="#0050CB" />
          <circle cx="16" cy="16" r="14" fill="#0050CB" stroke="#FFFFFF" strokeWidth="2" />
          {/* Clock hands */}
          <path d="M 16 9 L 16 16 L 21 16" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

// Academic Subjects Hero Vector Artwork matching reference image
function SubjectsHeroIllustration() {
  return (
    <div className="hidden lg:flex items-center gap-3 relative py-1.5 px-3 bg-[#F0F6FE] dark:bg-blue-950/40 rounded-2xl border border-[#DCEBFF] dark:border-blue-900/40 select-none">
      <svg
        width="165"
        height="66"
        viewBox="0 0 165 66"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible drop-shadow-xs"
      >
        <defs>
          <linearGradient id="subjBookBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0050CB" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="subjBookCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="subjBookPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>

        {/* 1. Desk Pen/Pencil Cup on Left */}
        <g transform="translate(10, 14)">
          {/* Ruler */}
          <rect x="7" y="1" width="5" height="24" rx="1" transform="rotate(-15 7 1)" fill="#F59E0B" />
          <line x1="8" y1="5" x2="10" y2="5" stroke="#B45309" strokeWidth="0.8" />
          <line x1="8" y1="10" x2="10" y2="10" stroke="#B45309" strokeWidth="0.8" />
          <line x1="8" y1="15" x2="10" y2="15" stroke="#B45309" strokeWidth="0.8" />
          {/* Pink Pen */}
          <rect x="15" y="0" width="3.5" height="24" rx="1.5" transform="rotate(10 15 0)" fill="#EC4899" />
          <polygon points="15.5,-3 14,0 17,0" fill="#F472B6" />
          {/* Green Pencil */}
          <rect x="11" y="2" width="3" height="22" rx="1" fill="#10B981" />
          <polygon points="12.5,-2 11,2 14,2" fill="#FDE68A" />
          <circle cx="12.5" cy="-1.5" r="0.8" fill="#1E293B" />
          {/* Blue Pen */}
          <rect x="4" y="2" width="3.5" height="23" rx="1" transform="rotate(-8 4 2)" fill="#0284C7" />
          {/* Cup holder */}
          <rect x="2" y="18" width="22" height="26" rx="4" fill="#38BDF8" />
          <rect x="4" y="20" width="18" height="22" rx="3" fill="#0284C7" />
          {/* Cup highlight */}
          <path d="M 5 21 L 8 21 L 8 40 L 5 40 Z" fill="#BAE6FD" opacity="0.4" />
        </g>

        {/* 2. Stacked Books in Middle */}
        <g transform="translate(50, 22)">
          {/* Bottom Book: Purple */}
          <g transform="translate(0, 22)">
            <path d="M 0 3 Q 0 0 3 0 L 52 0 L 52 11 L 3 11 Q 0 11 0 8 Z" fill="url(#subjBookPurple)" />
            <rect x="52" y="1.5" width="4.5" height="8" rx="0.5" fill="#F8FAFC" />
            <line x1="5" y1="0" x2="5" y2="11" stroke="#C4B5FD" strokeWidth="0.8" strokeOpacity="0.7" />
          </g>
          {/* Middle Book: Cyan */}
          <g transform="translate(3, 11)">
            <path d="M 0 3 Q 0 0 3 0 L 48 0 L 48 10 L 3 10 Q 0 10 0 7 Z" fill="url(#subjBookCyan)" />
            <rect x="48" y="1.5" width="4.5" height="7" rx="0.5" fill="#FFFFFF" />
            <line x1="5" y1="0" x2="5" y2="10" stroke="#BAE6FD" strokeWidth="0.8" strokeOpacity="0.7" />
          </g>
          {/* Top Book: Royal Blue */}
          <g transform="translate(1, 0)">
            <path d="M 0 3 Q 0 0 3 0 L 46 0 L 46 10 L 3 10 Q 0 10 0 7 Z" fill="url(#subjBookBlue)" />
            <rect x="46" y="1.5" width="4.5" height="7" rx="0.5" fill="#F8FAFC" />
            <line x1="5" y1="0" x2="5" y2="10" stroke="#93C5FD" strokeWidth="0.8" strokeOpacity="0.7" />
          </g>
        </g>

        {/* 3. Small Potted Succulent Plant on Right */}
        <g transform="translate(122, 21)">
          {/* Succulent Leaves */}
          <path d="M 14 16 C 8 10 9 2 14 0 C 19 2 20 10 14 16 Z" fill="#10B981" />
          <path d="M 14 16 C 4 14 2 6 7 2 C 12 5 13 12 14 16 Z" fill="#34D399" />
          <path d="M 14 16 C 24 14 26 6 21 2 C 16 5 15 12 14 16 Z" fill="#059669" />
          <path d="M 14 16 C 6 18 2 12 5 8 C 9 10 12 14 14 16 Z" fill="#6EE7B7" />
          <path d="M 14 16 C 22 18 26 12 23 8 C 19 10 16 14 14 16 Z" fill="#047857" />
          {/* Pot */}
          <path d="M 6 18 L 22 18 L 19 33 L 9 33 Z" fill="#3B82F6" />
          <rect x="4" y="16" width="20" height="3" rx="1.5" fill="#60A5FA" />
          {/* Pot highlight */}
          <line x1="9" y1="20" x2="11" y2="31" stroke="#93C5FD" strokeWidth="1" strokeLinecap="round" />
        </g>
      </svg>

      {/* Cursive Handwriting Quote matching reference */}
      <div className="flex flex-col text-left pr-2">
        <span
          style={{ fontFamily: "'Caveat', cursive" }}
          className="text-[#0050CB] dark:text-[#38BDF8] text-lg font-bold leading-tight select-none rotate-[-2deg]"
        >
          Better Learning
        </span>
        <span
          style={{ fontFamily: "'Caveat', cursive" }}
          className="text-[#0050CB] dark:text-[#38BDF8] text-lg font-bold leading-tight select-none rotate-[-2deg]"
        >
          Brighter Future&quot;
        </span>
      </div>
    </div>
  );
}

// Subject Card Icon Renderer
function renderSubjectCardIcon(sub: any) {
  const name = sub.name?.toLowerCase() || '';
  if (sub.iconType === 'letters' || name.includes('english')) {
    return (
      <div className="w-11 h-11 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 flex flex-col items-center justify-center shrink-0">
        <span className="text-[13px] font-black text-[#0050CB] leading-none tracking-tight">A</span>
        <span className="text-[10px] font-black text-[#0050CB] leading-none tracking-wider mt-0.5">BC</span>
      </div>
    );
  }
  if (sub.iconType === 'math' || name.includes('math')) {
    return (
      <div className="w-11 h-11 rounded-xl bg-[#F3E8FF] dark:bg-purple-950/60 flex items-center justify-center shrink-0">
        <div className="text-[#9333EA] font-extrabold text-xs tracking-wider leading-none text-center">
          <div>+ -</div>
          <div className="text-[10px] mt-0.5">&times; &divide;</div>
        </div>
      </div>
    );
  }
  if (sub.iconType === 'atom' || (name.includes('science') && !name.includes('computer') && !name.includes('social'))) {
    return (
      <div className="w-11 h-11 rounded-xl bg-[#CCFBF1] dark:bg-teal-950/60 flex items-center justify-center shrink-0">
        <Atom className="w-5 h-5 text-[#0D9488]" />
      </div>
    );
  }
  if (sub.iconType === 'globe' || name.includes('social')) {
    return (
      <div className="w-11 h-11 rounded-xl bg-[#FFEDD5] dark:bg-orange-950/60 flex items-center justify-center shrink-0">
        <Globe className="w-5 h-5 text-[#EA580C]" />
      </div>
    );
  }
  if (sub.iconType === 'palette' || name.includes('art')) {
    return (
      <div className="w-11 h-11 rounded-xl bg-[#FCE7F3] dark:bg-pink-950/60 flex items-center justify-center shrink-0">
        <Palette className="w-5 h-5 text-[#EC4899]" />
      </div>
    );
  }
  if (sub.iconType === 'music' || name.includes('music')) {
    return (
      <div className="w-11 h-11 rounded-xl bg-[#E0F2FE] dark:bg-sky-950/60 flex items-center justify-center shrink-0">
        <Music className="w-5 h-5 text-[#0284C7]" />
      </div>
    );
  }
  if (sub.iconType === 'dumbbell' || name.includes('physical') || name.includes('pe')) {
    return (
      <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
        <Dumbbell className="w-5 h-5 text-[#6366F1]" />
      </div>
    );
  }
  if (sub.iconType === 'laptop' || name.includes('computer')) {
    return (
      <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] dark:bg-amber-950/60 flex items-center justify-center shrink-0">
        <Laptop className="w-5 h-5 text-[#CA8A04]" />
      </div>
    );
  }
  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: sub.iconBg || '#E5EEFF' }}
    >
      <BookOpen className="w-5 h-5" style={{ color: sub.color || '#0050CB' }} />
    </div>
  );
}

function AcademicContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') || 'timetable';

  const [activeTab, setActiveTab] = useState<'timetable' | 'subjects' | 'years' | 'terms'>('timetable');
  
  // Canonical Subjects tailored specifically for Kindergarten (Pre-KG, LKG, UKG)
  const [subjects, setSubjects] = useState<any[]>([
    {
      _id: 'sub-eng',
      name: 'English & Phonics',
      code: 'ENG-EYFS',
      category: 'Core',
      classes: 'PreKG, LKG, UKG',
      type: 'Language & Literacy',
      color: '#0050CB',
      iconBg: '#E5EEFF',
      iconType: 'letters',
      status: 'Active',
      description: 'Jolly Phonics, letter sounds, early vocabulary building, and conversational storytelling.',
    },
    {
      _id: 'sub-math',
      name: 'Early Mathematics & Numeracy',
      code: 'NUM-EYFS',
      category: 'Core',
      classes: 'PreKG, LKG, UKG',
      type: 'Numeracy & Logic',
      color: '#9333EA',
      iconBg: '#F3E8FF',
      iconType: 'math',
      status: 'Active',
      description: 'Number tracing, shape identification, basic counting 1-100, patterns, and size comparison.',
    },
    {
      _id: 'sub-evs',
      name: 'Environmental Studies (EVS)',
      code: 'EVS-EYFS',
      category: 'Core',
      classes: 'PreKG, LKG, UKG',
      type: 'World & Nature',
      color: '#0D9488',
      iconBg: '#CCFBF1',
      iconType: 'atom',
      status: 'Active',
      description: 'Seasons, plants, animals, senses, family, healthy food, and nature exploration.',
    },
    {
      _id: 'sub-art',
      name: 'Art, Craft & Sensory Play',
      code: 'ART-EYFS',
      category: 'Elective',
      classes: 'PreKG, LKG, UKG',
      type: 'Creative Arts',
      color: '#EC4899',
      iconBg: '#FCE7F3',
      iconType: 'palette',
      status: 'Active',
      description: 'Finger painting, clay modeling, paper tearing, origami, and fine-motor sensory coordination.',
    },
    {
      _id: 'sub-rhymes',
      name: 'Rhymes, Music & Storytelling',
      code: 'MUS-EYFS',
      category: 'Core',
      classes: 'PreKG, LKG, UKG',
      type: 'Music & Expression',
      color: '#0284C7',
      iconBg: '#E0F2FE',
      iconType: 'music',
      status: 'Active',
      description: 'Action rhymes, nursery songs, puppet theater, voice modulation, and rhythm imitation.',
    },
    {
      _id: 'sub-pe',
      name: 'Physical & Gross Motor Skills',
      code: 'PE-EYFS',
      category: 'Core',
      classes: 'PreKG, LKG, UKG',
      type: 'Physical Development',
      color: '#6366F1',
      iconBg: '#EEF2FF',
      iconType: 'dumbbell',
      status: 'Active',
      description: 'Balance beams, bean bag toss, free play, dance coordination, and basic indoor yoga.',
    },
    {
      _id: 'sub-gk',
      name: 'General Awareness & Manners',
      code: 'GK-EYFS',
      category: 'Core',
      classes: 'LKG, UKG',
      type: 'Social & Emotional',
      color: '#EA580C',
      iconBg: '#FFEDD5',
      iconType: 'globe',
      status: 'Active',
      description: 'Table manners, greeting elders, road safety awareness, hygiene habits, and emotional empathy.',
    },
    {
      _id: 'sub-lang2',
      name: 'Second Language (Tamil / Hindi)',
      code: 'L2-EYFS',
      category: 'Elective',
      classes: 'LKG, UKG',
      type: 'Regional Language',
      color: '#EAB308',
      iconBg: '#FEF3C7',
      iconType: 'letters',
      status: 'Active',
      description: 'Basic regional language greetings, alphabet identification (Uyir Ezhuthukkal / Swar), and verbal rhymes.',
    },
  ]);

  // Subjects Filter & View States
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [subjectClassFilter, setSubjectClassFilter] = useState('All Classes');
  const [subjectTypeFilter, setSubjectTypeFilter] = useState('All Types');
  const [subjectStatusFilter, setSubjectStatusFilter] = useState('Active');
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState<'All' | 'Core' | 'Elective'>('All');
  const [showSubjectFilterPanel, setShowSubjectFilterPanel] = useState(false);
  const [subjectViewMode, setSubjectViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSubjectForDetails, setSelectedSubjectForDetails] = useState<any | null>(null);
  const [activeSubjectMenuId, setActiveSubjectMenuId] = useState<string | null>(null);

  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([
    {
      _id: 'ay-2025-2026',
      name: '2025 - 2026',
      startDate: '2025-06-01',
      endDate: '2026-05-31',
      isCurrent: true,
      status: 'Active',
      totalClasses: 12,
      totalSections: 36
    }
  ]);
  const [yearSearchQuery, setYearSearchQuery] = useState('');
  const [yearStatusFilter, setYearStatusFilter] = useState<'Active' | 'All'>('Active');
  const [showYearFilterMenu, setShowYearFilterMenu] = useState(false);
  const [activeYearMenuId, setActiveYearMenuId] = useState<string | null>(null);
  const [showAcademicYearSelector, setShowAcademicYearSelector] = useState(false);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [timetables, setTimetables] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '', colorCode: '#0050CB' });

  const [showYearModal, setShowYearModal] = useState(false);
  const [yearForm, setYearForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });

  // Timetable builder state
  const [periods, setPeriods] = useState<any[]>([]);

  // Terms State Matching Reference Design
  const [terms, setTerms] = useState<any[]>([
    { 
      id: 'term-1', 
      name: 'Term 1 (Monsoon)', 
      subBadge: 'Current Term',
      startDate: '2025-04-01', 
      endDate: '2025-08-31', 
      weightage: '30%', 
      status: 'Active',
      color: 'blue'
    },
    { 
      id: 'term-2', 
      name: 'Term 2 (Autumn)', 
      subBadge: 'Upcoming',
      startDate: '2025-09-01', 
      endDate: '2025-12-20', 
      weightage: '35%', 
      status: 'Upcoming',
      color: 'purple'
    },
    { 
      id: 'term-3', 
      name: 'Term 3 (Spring)', 
      subBadge: 'Upcoming',
      startDate: '2026-01-05', 
      endDate: '2026-03-31', 
      weightage: '35%', 
      status: 'Planned',
      color: 'orange'
    },
  ]);

  // Terms Search, Filter & View States
  const [termSearchQuery, setTermSearchQuery] = useState('');
  const [termStatusFilter, setTermStatusFilter] = useState<'All' | 'Active' | 'Upcoming' | 'Planned' | 'Completed'>('All');
  const [showTermFilterMenu, setShowTermFilterMenu] = useState(false);
  const [termViewMode, setTermViewMode] = useState<'list' | 'grid'>('list');
  const [showAddTermModal, setShowAddTermModal] = useState(false);
  const [selectedTermForDetails, setSelectedTermForDetails] = useState<any | null>(null);
  const [activeTermMenuId, setActiveTermMenuId] = useState<string | null>(null);

  const activeYearObj = useMemo(() => {
    return academicYears.find((y) => y.isCurrent) || academicYears[0];
  }, [academicYears]);

  const displayYears = useMemo(() => {
    let list = academicYears;
    if (yearSearchQuery.trim()) {
      const q = yearSearchQuery.toLowerCase();
      list = list.filter((y) => y.name?.toLowerCase().includes(q));
    }
    if (yearStatusFilter === 'Active') {
      const activeList = list.filter((y) => y.isCurrent || y.status === 'Active');
      return activeList.length > 0 ? activeList.slice(0, 1) : list.slice(0, 1);
    }
    return list;
  }, [academicYears, yearSearchQuery, yearStatusFilter]);

  const [termForm, setTermForm] = useState({
    name: '',
    subBadge: 'Upcoming',
    startDate: '',
    endDate: '',
    weightage: '35%',
    status: 'Planned',
    color: 'blue'
  });

  const handleSaveTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termForm.name.trim() || !termForm.startDate || !termForm.endDate) {
      toast.error('Please enter term title, start date and end date');
      return;
    }
    const newTerm = {
      id: `term-${Date.now()}`,
      name: termForm.name.trim(),
      subBadge: termForm.subBadge,
      startDate: termForm.startDate,
      endDate: termForm.endDate,
      weightage: termForm.weightage || '30%',
      status: termForm.status,
      color: termForm.color || 'blue'
    };
    setTerms([...terms, newTerm]);
    setShowAddTermModal(false);
    setTermForm({
      name: '',
      subBadge: 'Upcoming',
      startDate: '',
      endDate: '',
      weightage: '35%',
      status: 'Planned',
      color: 'blue'
    });
    toast.success('Academic term added successfully');
  };

  const handleDeleteTerm = (id: string) => {
    if (!confirm('Are you sure you want to remove this academic term?')) return;
    setTerms(terms.filter(t => t.id !== id));
    if (selectedTermForDetails?.id === id) {
      setSelectedTermForDetails(null);
    }
    setActiveTermMenuId(null);
    toast.success('Academic term deleted');
  };

  const handleSetTermStatus = (id: string, status: string, subBadge?: string) => {
    setTerms(terms.map(t => {
      if (t.id === id) {
        return { ...t, status, subBadge: subBadge || t.subBadge };
      }
      if (status === 'Active' && t.status === 'Active') {
        return { ...t, status: 'Completed', subBadge: 'Completed' };
      }
      return t;
    }));
    setActiveTermMenuId(null);
    toast.success(`Term updated to ${status}`);
  };

  const filteredTerms = useMemo(() => {
    return terms.filter(t => {
      const q = termSearchQuery.toLowerCase();
      const matchesSearch = !q || 
        t.name.toLowerCase().includes(q) ||
        t.startDate.includes(q) ||
        t.endDate.includes(q) ||
        t.status.toLowerCase().includes(q);
      const matchesStatus = termStatusFilter === 'All' || t.status === termStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [terms, termSearchQuery, termStatusFilter]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      const q = subjectSearchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        sub.name?.toLowerCase().includes(q) ||
        sub.code?.toLowerCase().includes(q) ||
        sub.description?.toLowerCase().includes(q) ||
        sub.type?.toLowerCase().includes(q);

      const normalizeClass = (c: string) => (c || '').toLowerCase().replace(/[\s\-_]/g, '');
      const matchesClass =
        subjectClassFilter === 'All Classes' ||
        normalizeClass(sub.classes).includes(normalizeClass(subjectClassFilter));

      const matchesType =
        subjectTypeFilter === 'All Types' ||
        sub.type?.toLowerCase() === subjectTypeFilter.toLowerCase();

      const matchesStatus =
        subjectStatusFilter === 'All' ||
        (subjectStatusFilter === 'Active' && (sub.status === 'Active' || !sub.status));

      const matchesCategory =
        subjectCategoryFilter === 'All' ||
        (sub.category || 'Core') === subjectCategoryFilter;

      return matchesSearch && matchesClass && matchesType && matchesStatus && matchesCategory;
    });
  }, [subjects, subjectSearchQuery, subjectClassFilter, subjectTypeFilter, subjectStatusFilter, subjectCategoryFilter]);

  const subjectStats = useMemo(() => {
    const total = subjects.length || 18;
    const core = subjects.filter(s => (s.category || 'Core') === 'Core').length || 12;
    const elective = subjects.filter(s => s.category === 'Elective').length || 6;
    const active = subjects.filter(s => s.status !== 'Inactive').length || 18;
    return { total, core, elective, active };
  }, [subjects]);

  useEffect(() => {
    if (tabParam === 'subjects' || tabParam === 'years' || tabParam === 'terms' || tabParam === 'timetable') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tab');
        if (t === 'subjects' || t === 'years' || t === 'terms' || t === 'timetable') {
          setActiveTab(t);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (t: 'timetable' | 'subjects' | 'years' | 'terms') => {
    setActiveTab(t);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', t);
      window.history.pushState({}, '', url.toString());
    }
  };

  const apiBase = getApiBaseUrl();

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subRes, classRes, teachRes, yearRes] = await Promise.allSettled([
        authFetch(`${apiBase}/api/academic/subjects`, { headers: getHeaders(), credentials: 'include' }),
        authFetch(`${apiBase}/api/classes`, { headers: getHeaders(), credentials: 'include' }),
        authFetch(`${apiBase}/api/users`, { headers: getHeaders(), credentials: 'include' }),
        authFetch(`${apiBase}/api/academic/years`, { headers: getHeaders(), credentials: 'include' }),
      ]);
      
      if (subRes.status === 'fulfilled' && subRes.value.ok) {
        const subs = await subRes.value.json();
        if (Array.isArray(subs) && subs.length > 0) {
          const enriched = subs.map((sub: any, idx: number) => ({
            ...sub,
            category: sub.category || (idx % 3 === 2 ? 'Elective' : 'Core'),
            classes: sub.classes || 'PreKG, LKG, UKG',
            type: sub.type || 'Academic',
            color: sub.colorCode || sub.color || '#0050CB',
            code: sub.code || `SUB00${idx + 1}`,
            status: sub.status || 'Active',
          }));
          setSubjects(enriched);
        }
      }
      if (classRes.status === 'fulfilled' && classRes.value.ok) {
        const c = await classRes.value.json();
        const list = Array.isArray(c) && c.length > 0 ? c : [
          { _id: 'cls-pkg', name: 'Pre-KG' },
          { _id: 'cls-lkg', name: 'LKG' },
          { _id: 'cls-ukg', name: 'UKG' },
        ];
        setClasses(list);
        if (list.length > 0 && !selectedClass) setSelectedClass(list[0]._id);
      }
      if (teachRes.status === 'fulfilled' && teachRes.value.ok) {
        const u = await teachRes.value.json();
        setTeachers(Array.isArray(u) ? u.filter((user: any) => user.role?.name === 'Teacher' || user.role?.name === 'Admin' || user.role === 'Admin') : []);
      }
      if (yearRes.status === 'fulfilled' && yearRes.value.ok) {
        const y = await yearRes.value.json();
        setAcademicYears(Array.isArray(y) ? y : []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimetable = async () => {
    if (!selectedClass) return;
    try {
      const res = await authFetch(`${apiBase}/api/academic/timetables/${selectedClass}`, { 
        headers: getHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const tt = Array.isArray(data) ? data.find((t: any) => t.dayOfWeek === selectedDay) : null;
        if (tt) {
          setTimetables(tt);
          setPeriods(tt.periods || []);
        } else {
          setTimetables(null);
          setPeriods([]);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable();
    }
  }, [selectedClass, selectedDay]);

  // Save Subject
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authFetch(`${apiBase}/api/academic/subjects`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(subjectForm)
      });
      if (res.ok) {
        toast.success('Subject created successfully');
        setShowSubjectModal(false);
        setSubjectForm({ name: '', description: '', colorCode: '#0050CB' });
        fetchData();
      } else {
        toast.error('Failed to create subject');
      }
    } catch (e) {
      toast.error('Network error creating subject');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Subject
  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subject?')) return;
    try {
      const res = await authFetch(`${apiBase}/api/academic/subjects/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Subject removed');
        fetchData();
      }
    } catch (e) {
      toast.error('Could not remove subject');
    }
  };

  // Save Timetable
  const handleSaveTimetable = async () => {
    setIsSaving(true);
    try {
      const res = await authFetch(`${apiBase}/api/academic/timetables`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          classId: selectedClass,
          dayOfWeek: selectedDay,
          periods
        })
      });
      if (res.ok) {
        toast.success(`Timetable saved for ${selectedDay}!`);
        fetchTimetable();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Timetable conflict or error');
      }
    } catch (e) {
      toast.error('Network error saving timetable');
    } finally {
      setIsSaving(false);
    }
  };

  // Add/Remove Period Blocks
  const addPeriod = () => {
    setPeriods([
      ...periods,
      {
        startTime: '08:30',
        endTime: '09:15',
        subjectId: subjects[0]?._id || '',
        teacherId: teachers[0]?._id || '',
        room: 'Room 101'
      }
    ]);
  };

  const updatePeriod = (index: number, field: string, value: any) => {
    const updated = [...periods];
    updated[index] = { ...updated[index], [field]: value };
    setPeriods(updated);
  };

  const removePeriod = (index: number) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  // Create Academic Year
  const handleSaveYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authFetch(`${apiBase}/api/academic/years`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(yearForm)
      });
      if (res.ok) {
        toast.success('Academic session registered successfully');
        setShowYearModal(false);
        setYearForm({ name: '', startDate: '', endDate: '', isCurrent: false });
        fetchData();
      } else {
        toast.error('Failed to create academic year');
      }
    } catch (e) {
      toast.error('Network error creating academic year');
    } finally {
      setIsSaving(false);
    }
  };

  // Set Active Academic Year
  const handleSetActiveYear = async (id: string) => {
    try {
      const res = await authFetch(`${apiBase}/api/academic/years/${id}/set-current`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Active academic cycle updated');
        fetchData();
      }
    } catch (e) {
      toast.error('Failed to update active year');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-saas pb-24">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/dashboard" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
          Dashboard
        </Link>
        <span className="text-slate-400">&rsaquo;</span>
        <button
          type="button"
          onClick={() => handleTabChange('timetable')}
          className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          Academics
        </button>
        <span className="text-slate-400">&rsaquo;</span>
        <span className="font-bold text-[#000E28] dark:text-white">
          {activeTab === 'years'
            ? 'Classes & Sections'
            : activeTab === 'terms'
            ? 'Terms & Semesters'
            : activeTab === 'subjects'
            ? 'Subjects'
            : 'Timetable Matrix'}
        </span>
      </div>

      {/* Hero Header Card */}
      {activeTab === 'subjects' ? (
        <div className="bg-white dark:bg-[#07152F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden relative">
          <div className="flex items-start gap-4 z-10">
            <div className="w-13 h-13 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0 text-[#0050CB] dark:text-blue-400 shadow-2xs">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-[26px] font-black text-[#000E28] dark:text-white tracking-tight">
                Academic Subjects
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Manage all academic subjects, their details, and curriculum information.
              </p>
            </div>
          </div>

          {/* Right Header Artwork & Add Subject Button */}
          <div className="flex items-center gap-4 self-start lg:self-center">
            <SubjectsHeroIllustration />
            <button
              type="button"
              onClick={() => setShowSubjectModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0050CB] hover:bg-[#003E9E] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Subject</span>
            </button>
          </div>
        </div>
      ) : activeTab === 'years' ? (
        <div className="bg-white dark:bg-[#07152F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
          <div className="flex items-start gap-4 z-10">
            <div className="w-13 h-13 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0 text-[#0050CB] dark:text-blue-400 shadow-2xs">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-[26px] font-black text-[#000E28] dark:text-white tracking-tight">
                Academics &amp; Timetable Command
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Manage classes, sections, subjects, timetable and academic schedules.
              </p>
            </div>
          </div>

          {/* Right Header Controls matching image */}
          <div className="flex items-center gap-3 self-start md:self-center">
            {/* Academic Year Dropdown Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAcademicYearSelector(!showAcademicYearSelector)}
                className="bg-[#E5EEFF] dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-2xs hover:bg-blue-100/60 transition-colors cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-[#0050CB] text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight font-medium">
                    Academic Year
                  </span>
                  <span className="font-bold text-xs text-[#000E28] dark:text-white block leading-tight">
                    {activeYearObj?.name || getCurrentAcademicYearFormatted()}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
              </button>

              {showAcademicYearSelector && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#0A1A3A] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 z-40 space-y-0.5">
                  {academicYears.map((ay) => (
                    <button
                      key={ay._id}
                      type="button"
                      onClick={() => {
                        handleSetActiveYear(ay._id);
                        setShowAcademicYearSelector(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg font-medium flex items-center justify-between transition-colors ${
                        ay.isCurrent
                          ? 'bg-[#0050CB] text-white font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{ay.name}</span>
                      {ay.isCurrent && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* + New Class Button */}
            <Link
              href="/dashboard/classes"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0050CB] hover:bg-[#003E9E] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Class</span>
            </Link>
          </div>
        </div>
      ) : activeTab === 'terms' ? (
        <div className="bg-white dark:bg-[#07152F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
          <div className="flex items-start gap-4 z-10">
            <div className="w-13 h-13 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0 text-[#0050CB] dark:text-blue-400 shadow-2xs">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-[26px] font-black text-[#000E28] dark:text-white tracking-tight">
                Academic Terms &amp; Semesters
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Manage academic years, term dates, and semester schedules.
              </p>
            </div>
          </div>

          {/* 3D Illustration Graphic with Stacked Books, Mortarboard, Calendar & Cursive Note */}
          <TermsHeroIllustration />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#07152F] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
          <div className="flex items-start gap-4 z-10">
            <div className="w-13 h-13 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0 text-[#0050CB] dark:text-blue-400 shadow-2xs">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-[26px] font-black text-[#000E28] dark:text-white tracking-tight">
                Academics &amp; Timetable Command
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Manage instructional routines, subject catalogs, academic years, and semester schedules.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation Bar - Hidden on subjects tab to match the reference layout */}
      {activeTab !== 'subjects' && (
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-px">
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto custom-scrollbar px-1">
            {[
              { id: 'timetable', label: 'Timetable Matrix', icon: LayoutGrid },
              { id: 'subjects', label: 'Subject Management', icon: BookOpen },
              { id: 'years', label: 'Academic Year Setup', icon: Calendar },
              { id: 'terms', label: 'Terms & Semesters', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`flex items-center gap-2 pb-3 pt-1 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-[#0050CB] dark:text-blue-400'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0050CB] dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0050CB] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action button for other tabs */}
          <div className="flex items-center gap-2 pb-2">
            {activeTab === 'years' && (
              <button
                type="button"
                onClick={() => setShowYearModal(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0050CB] hover:bg-[#003E9E] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Academic Year</span>
              </button>
            )}
            <button
              type="button"
              onClick={fetchData}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: TIMETABLES */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          {/* Class & Day Selector */}
          <div className="bg-white dark:bg-[#07152F] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-hidden"
              >
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    Class {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Day of Week</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-hidden"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Periods List */}
          <div className="bg-white dark:bg-[#07152F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0050CB]" />
                  <span>{selectedDay} Bell Schedule ({periods.length} Periods)</span>
                </h3>
                <p className="text-xs text-slate-500">Configure periods, instructors, and room allocation.</p>
              </div>
              <button
                type="button"
                onClick={addPeriod}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#E5EEFF] font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Period</span>
              </button>
            </div>

            {periods.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 space-y-2">
                <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-bold">No periods scheduled for {selectedDay}.</p>
                <button
                  type="button"
                  onClick={addPeriod}
                  className="text-xs font-bold text-[#0050CB] hover:underline"
                >
                  + Add First Period
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {periods.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex flex-col md:flex-row items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#0050CB] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <input
                        type="time"
                        value={p.startTime}
                        onChange={(e) => updatePeriod(idx, 'startTime', e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs font-mono font-bold w-24"
                      />
                      <span className="text-slate-400 text-xs font-bold">to</span>
                      <input
                        type="time"
                        value={p.endTime}
                        onChange={(e) => updatePeriod(idx, 'endTime', e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs font-mono font-bold w-24"
                      />
                    </div>

                    <select
                      value={typeof p.subjectId === 'object' ? p.subjectId?._id : p.subjectId}
                      onChange={(e) => updatePeriod(idx, 'subjectId', e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold flex-1 w-full"
                    >
                      <option value="">Select Subject...</option>
                      {subjects.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={typeof p.teacherId === 'object' ? p.teacherId?._id : p.teacherId || ''}
                      onChange={(e) => updatePeriod(idx, 'teacherId', e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold flex-1 w-full"
                    >
                      <option value="">Assign Teacher...</option>
                      {teachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.firstName} {t.lastName}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Room (e.g. Lab 2)"
                      value={p.room || ''}
                      onChange={(e) => updatePeriod(idx, 'room', e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold w-full md:w-28"
                    />

                    <button
                      type="button"
                      onClick={() => removePeriod(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveTimetable}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#0050CB] hover:bg-[#003E9E] disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {isSaving ? 'Validating Conflicts...' : 'Save Routine'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          {/* 4 Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Subjects */}
            <div className="bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 flex items-center justify-center shrink-0 text-[#0050CB] dark:text-blue-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Subjects</p>
                <h3 className="text-2xl font-black text-[#000E28] dark:text-white">{subjectStats.total}</h3>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-0.5">
                  <span>&uarr;</span>
                  <span>12% from last term</span>
                </div>
              </div>
            </div>

            {/* Core Subjects */}
            <div className="bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] dark:bg-emerald-950/60 flex items-center justify-center shrink-0 text-[#10B981] dark:text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Core Subjects</p>
                <h3 className="text-2xl font-black text-[#000E28] dark:text-white">{subjectStats.core}</h3>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-0.5">
                  <span>&uarr;</span>
                  <span>8% from last term</span>
                </div>
              </div>
            </div>

            {/* Elective Subjects */}
            <div className="bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] dark:bg-purple-950/60 flex items-center justify-center shrink-0 text-[#9333EA] dark:text-purple-400">
                <Star className="w-6 h-6 fill-[#9333EA]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Elective Subjects</p>
                <h3 className="text-2xl font-black text-[#000E28] dark:text-white">{subjectStats.elective}</h3>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-0.5">
                  <span>&uarr;</span>
                  <span>20% from last term</span>
                </div>
              </div>
            </div>

            {/* Active Subjects */}
            <div className="bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] dark:bg-amber-950/60 flex items-center justify-center shrink-0 text-[#D97706] dark:text-amber-400">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Subjects</p>
                <h3 className="text-2xl font-black text-[#000E28] dark:text-white">{subjectStats.active}</h3>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-0.5">
                  <span>&uarr;</span>
                  <span>0% from last term</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Left: Search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subjects by name, code or description..."
                value={subjectSearchQuery}
                onChange={(e) => setSubjectSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#07152F] border border-slate-200/80 dark:border-slate-800 rounded-full text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-hidden focus:border-[#0050CB] focus:ring-1 focus:ring-[#0050CB] shadow-2xs"
              />
              {subjectSearchQuery && (
                <button
                  type="button"
                  onClick={() => setSubjectSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right: Dropdowns, Filter button and View Toggle */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* All Classes Dropdown */}
              <div className="relative">
                <select
                  value={subjectClassFilter}
                  onChange={(e) => setSubjectClassFilter(e.target.value)}
                  className="appearance-none bg-white dark:bg-[#07152F] border border-slate-200/80 dark:border-slate-800 rounded-full px-4 py-2.5 pr-8 text-xs font-bold text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <option value="All Classes">All Classes</option>
                  <option value="PreKG">Pre-KG</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* All Types Dropdown */}
              <div className="relative">
                <select
                  value={subjectTypeFilter}
                  onChange={(e) => setSubjectTypeFilter(e.target.value)}
                  className="appearance-none bg-white dark:bg-[#07152F] border border-slate-200/80 dark:border-slate-800 rounded-full px-4 py-2.5 pr-8 text-xs font-bold text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <option value="All Types">All Types</option>
                  <option value="Language & Literacy">Language & Literacy</option>
                  <option value="Numeracy & Logic">Numeracy & Logic</option>
                  <option value="World & Nature">World & Nature</option>
                  <option value="Creative Arts">Creative Arts</option>
                  <option value="Music & Expression">Music & Expression</option>
                  <option value="Physical Development">Physical Development</option>
                  <option value="Social & Emotional">Social & Emotional</option>
                  <option value="Regional Language">Regional Language</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status: Active Dropdown */}
              <div className="relative">
                <select
                  value={subjectStatusFilter}
                  onChange={(e) => setSubjectStatusFilter(e.target.value)}
                  className="appearance-none bg-white dark:bg-[#07152F] border border-slate-200/80 dark:border-slate-800 rounded-full pl-6 pr-8 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <option value="Active">Status: Active</option>
                  <option value="All">Status: All</option>
                </select>
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setShowSubjectFilterPanel((prev) => !prev)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                  showSubjectFilterPanel || subjectClassFilter !== 'All Classes' || subjectTypeFilter !== 'All Types' || subjectStatusFilter !== 'Active' || subjectCategoryFilter !== 'All'
                    ? 'bg-[#E5EEFF] dark:bg-[#0050CB]/25 border-[#0050CB] text-[#0050CB] dark:text-[#38BDF8]'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#07152F] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Filter className={`w-3.5 h-3.5 ${showSubjectFilterPanel ? 'text-[#0050CB] dark:text-[#38BDF8]' : 'text-slate-400'}`} />
                <span>Filter</span>
                {(subjectClassFilter !== 'All Classes' || subjectTypeFilter !== 'All Types' || subjectStatusFilter !== 'Active' || subjectCategoryFilter !== 'All') && (
                  <span className="w-2 h-2 rounded-full bg-[#0050CB] dark:bg-[#38BDF8] ml-0.5" />
                )}
              </button>

              {/* Grid / List View Toggle */}
              <div className="flex items-center p-1 bg-white dark:bg-[#07152F] border border-slate-200/80 dark:border-slate-800 rounded-full shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSubjectViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    subjectViewMode === 'grid'
                      ? 'bg-[#0050CB] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    subjectViewMode === 'list'
                      ? 'bg-[#0050CB] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Filter Drawer / Panel */}
          {showSubjectFilterPanel && (
            <div className="bg-white dark:bg-[#07152F] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-150 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#0050CB]" />
                  <h4 className="font-bold text-xs text-[#000E28] dark:text-white uppercase tracking-wider">Advanced Subject Filters</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubjectClassFilter('All Classes');
                      setSubjectTypeFilter('All Types');
                      setSubjectStatusFilter('Active');
                      setSubjectCategoryFilter('All');
                      setSubjectSearchQuery('');
                      toast.success('All filters reset');
                    }}
                    className="text-xs text-[#0050CB] dark:text-[#38BDF8] font-bold hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubjectFilterPanel(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Class */}
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1.5">Class / Grade Level</label>
                  <select
                    value={subjectClassFilter}
                    onChange={(e) => setSubjectClassFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold outline-hidden"
                  >
                    <option value="All Classes">All Classes (PreKG, LKG, UKG)</option>
                    <option value="PreKG">Pre-KG</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                  </select>
                </div>

                {/* Category: Core vs Elective */}
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1.5">Curriculum Category</label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    {(['All', 'Core', 'Elective'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSubjectCategoryFilter(cat)}
                        className={`py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          subjectCategoryFilter === cat
                            ? 'bg-[#0050CB] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discipline Type */}
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1.5">Discipline Type</label>
                  <select
                    value={subjectTypeFilter}
                    onChange={(e) => setSubjectTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold outline-hidden"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Language & Literacy">Language & Literacy</option>
                    <option value="Numeracy & Logic">Numeracy & Logic</option>
                    <option value="World & Nature">World & Nature</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Music & Expression">Music & Expression</option>
                    <option value="Physical Development">Physical Development</option>
                    <option value="Social & Emotional">Social & Emotional</option>
                    <option value="Regional Language">Regional Language</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1.5">Curriculum Status</label>
                  <select
                    value={subjectStatusFilter}
                    onChange={(e) => setSubjectStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold outline-hidden"
                  >
                    <option value="Active">Active Subjects</option>
                    <option value="All">All Statuses</option>
                  </select>
                </div>
              </div>

              {/* Quick filter summary chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <span className="font-bold text-slate-400">Quick Classes:</span>
                {['All Classes', 'PreKG', 'LKG', 'UKG'].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSubjectClassFilter(cls)}
                    className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      subjectClassFilter === cls
                        ? 'bg-[#0050CB] text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cls === 'All Classes' ? 'All Classes' : cls === 'PreKG' ? 'Pre-KG' : cls}
                  </button>
                ))}
                <span className="ml-auto font-medium text-slate-500">
                  Showing <strong className="text-[#0050CB] dark:text-[#38BDF8]">{filteredSubjects.length}</strong> of {subjects.length} subjects
                </span>
              </div>
            </div>
          )}

          {/* Subjects Cards / Table */}
          {filteredSubjects.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-bold text-slate-600 dark:text-slate-300">No subjects matching filter criteria</p>
              <button
                type="button"
                onClick={() => {
                  setSubjectSearchQuery('');
                  setSubjectClassFilter('All Classes');
                  setSubjectTypeFilter('All Types');
                  setSubjectStatusFilter('Active');
                }}
                className="mt-2 text-xs font-bold text-[#0050CB] hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : subjectViewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
              {filteredSubjects.map((sub) => (
                <div
                  key={sub._id}
                  className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  {/* Left Vertical Accent Bar matching reference */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                    style={{ backgroundColor: sub.color || '#0050CB' }}
                  />

                  <div className="p-5 pl-5.5 flex-1 flex flex-col justify-between">
                    {/* Top Row: Icon + Name/Code + Core/Elective Pill */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {renderSubjectCardIcon(sub)}
                          <div>
                            <h4 className="font-bold text-sm text-[#000E28] dark:text-white tracking-tight">
                              {sub.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              Code: {sub.code || 'SUB001'}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                            (sub.category || 'Core') === 'Core'
                              ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                              : 'bg-[#F3E8FF] text-[#9333EA] border border-[#E9D5FF]'
                          }`}
                        >
                          {sub.category || 'Core'}
                        </span>
                      </div>

                      {/* Middle Details: Classes & Type */}
                      <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-[11px] font-medium">Classes: {sub.classes || 'PreKG, LKG, UKG'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-[11px] font-medium">Type: {sub.type || 'Academic'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: View Details & 3 dots Menu */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedSubjectForDetails(sub)}
                        className="text-[#0050CB] dark:text-blue-400 text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>View Details</span>
                        <span className="text-sm font-bold">&rarr;</span>
                      </button>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSubjectMenuId(activeSubjectMenuId === sub._id ? null : sub._id);
                          }}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeSubjectMenuId === sub._id && (
                          <div className="absolute right-0 bottom-full mb-1 w-36 bg-white dark:bg-[#0A1A3A] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 z-30 space-y-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSubjectForDetails(sub);
                                setActiveSubjectMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleDeleteSubject(sub._id);
                                setActiveSubjectMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Assigned Classes</th>
                      <th className="py-3 px-4">Discipline Type</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredSubjects.map((sub) => (
                      <tr key={sub._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#000E28] dark:text-white flex items-center gap-3">
                          {renderSubjectCardIcon(sub)}
                          <span>{sub.name}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-500">{sub.code || 'SUB001'}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              (sub.category || 'Core') === 'Core'
                                ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                                : 'bg-[#F3E8FF] text-[#9333EA] border border-[#E9D5FF]'
                            }`}
                          >
                            {sub.category || 'Core'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">{sub.classes || 'PreKG, LKG, UKG'}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">{sub.type || 'Academic'}</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSubjectForDetails(sub)}
                            className="text-[#0050CB] hover:underline font-bold text-xs cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubject(sub._id)}
                            className="text-rose-500 hover:text-rose-700 font-medium text-xs cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom Guidance Banner matching reference */}
          <div className="bg-[#F0F6FE] dark:bg-blue-950/20 border border-[#DCEBFF] dark:border-blue-900/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center text-[#0050CB] dark:text-blue-400 shrink-0 shadow-2xs">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#000E28] dark:text-white">
                  Need to manage syllabus or curriculum?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Go to Curriculum section to set up subject syllabus, chapters and learning outcomes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toast('Curriculum module is integrated with academic plan', { icon: '📘' })}
              className="text-[#0050CB] dark:text-blue-400 text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap self-start sm:self-center"
            >
              <span>Go to Curriculum</span>
              <span className="text-sm font-bold">&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: ACADEMIC YEARS */}
      {activeTab === 'years' && (
        <div className="space-y-6">
          {/* Institutional Academic Sessions Banner Card */}
          <div className="bg-[#F0F6FE] dark:bg-blue-950/20 border border-[#DCEBFF] dark:border-blue-900/40 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-2xs border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-[#0050CB] dark:text-blue-400 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#000E28] dark:text-white">
                  Institutional Academic Sessions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure session timelines, term dates, and designate the active school calendar.
                </p>
              </div>
            </div>

            {/* Right 3D Vector illustration */}
            <SessionsHeroIllustration />
          </div>

          {/* Main Card Container */}
          <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-6">
            {/* Header inside Main Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#000E28] dark:text-white">
                    Academic Years
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage academic years and their status.
                  </p>
                </div>
              </div>

              {/* Right Filter & Search */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search academic year..."
                    value={yearSearchQuery}
                    onChange={(e) => setYearSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-[#0050CB] focus:ring-1 focus:ring-[#0050CB] text-slate-800 dark:text-slate-100 w-48 placeholder:text-slate-400 font-medium"
                  />
                  {yearSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setYearSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Filter Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowYearFilterMenu(!showYearFilterMenu)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      yearStatusFilter !== 'All'
                        ? 'border-[#0050CB] text-[#0050CB] bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter</span>
                  </button>

                  {showYearFilterMenu && (
                    <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#0A1A3A] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 z-30 space-y-0.5">
                      {(['Active', 'All'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setYearStatusFilter(status);
                            setShowYearFilterMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                            yearStatusFilter === status
                              ? 'bg-[#0050CB] text-white font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pill Toggles: Active | All */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setYearStatusFilter('Active')}
                    className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      yearStatusFilter === 'Active'
                        ? 'bg-[#0050CB] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setYearStatusFilter('All')}
                    className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      yearStatusFilter === 'All'
                        ? 'bg-[#0050CB] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
            </div>

            {/* 2-Column Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Add New Academic Year (Dashed card) */}
              <div className="border-2 border-dashed border-blue-200 dark:border-blue-900/60 bg-[#F9FBFF] dark:bg-blue-950/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[230px]">
                <button
                  type="button"
                  onClick={() => setShowYearModal(true)}
                  className="w-12 h-12 rounded-full bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-400 flex items-center justify-center shadow-xs hover:scale-105 transition-transform cursor-pointer"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
                <div>
                  <h4 className="font-bold text-sm text-[#000E28] dark:text-white">
                    Add New Academic Year
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] mt-0.5">
                    Create a new academic year and set up the calendar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowYearModal(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-1.5 border border-[#0050CB] text-[#0050CB] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-full text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Year</span>
                </button>
              </div>

              {/* Card 2: Active Academic Year Card */}
              {displayYears.map((yr) => {
                const formattedDateRange = `${new Date(yr.startDate).toLocaleDateString('en-GB')} - ${new Date(yr.endDate).toLocaleDateString('en-GB')}`;

                return (
                  <div
                    key={yr._id}
                    className="border border-emerald-200/80 dark:border-emerald-900/60 bg-white dark:bg-[#07152F] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-base text-[#000E28] dark:text-white leading-tight">
                              {yr.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formattedDateRange}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 relative">
                          <span className="bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-400 text-xs font-semibold px-3 py-0.5 rounded-full">
                            Active
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveYearMenuId(activeYearMenuId === yr._id ? null : yr._id)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeYearMenuId === yr._id && (
                            <div className="absolute right-0 top-8 w-44 bg-white dark:bg-[#0A1A3A] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 z-30 space-y-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveYearMenuId(null);
                                  handleTabChange('terms');
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium flex items-center gap-2"
                              >
                                <Layers className="w-3.5 h-3.5" />
                                <span>Manage Terms</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveYearMenuId(null);
                                  toast.success(`Academic Year ${yr.name} is active`);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg font-medium flex items-center gap-2"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Default Calendar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Inset Stats Box */}
                      <div className="bg-[#F8FAFC] dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 grid grid-cols-3 gap-2 mt-6">
                        <div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Total Classes</span>
                          </div>
                          <p className="font-black text-sm text-[#000E28] dark:text-white mt-1">
                            {yr.totalClasses || 12}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>Total Sections</span>
                          </div>
                          <p className="font-black text-sm text-[#000E28] dark:text-white mt-1">
                            {yr.totalSections || 36}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Shield className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Status</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Tips Banner */}
          <div className="bg-[#F0F6FE] dark:bg-blue-950/20 border border-[#DCEBFF] dark:border-blue-900/40 rounded-2xl p-4 flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 shadow-2xs text-[#0050CB] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-[#000E28] dark:text-white">
                  Quick Tips
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  You can manage multiple academic years, set term dates, and configure the academic calendar for each year.
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[#0050CB] dark:text-blue-400 shrink-0" />
          </div>
        </div>
      )}

      {/* TAB 4: TERMS & SEMESTERS */}
      {activeTab === 'terms' && (
        <div className="space-y-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Terms */}
            <div className="bg-white dark:bg-[#07152F] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs relative flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Terms</p>
                  <h3 className="text-2xl font-black text-[#000E28] dark:text-white mt-1">3</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#EBF3FF] dark:bg-blue-950/60 flex items-center justify-center text-[#0050CB] dark:text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span>&uarr; 100% from last year</span>
              </div>
            </div>

            {/* Card 2: Active Terms */}
            <div className="bg-[#FAFFFC] dark:bg-[#07192A] rounded-2xl p-5 border border-emerald-200/70 dark:border-emerald-900/50 shadow-xs relative flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Terms</p>
                  <h3 className="text-2xl font-black text-[#000E28] dark:text-white mt-1">1</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#DCFCE7] dark:bg-emerald-950/70 flex items-center justify-center text-[#16A34A] dark:text-emerald-400">
                  <Check className="w-5 h-5 stroke-[2.8]" />
                </div>
              </div>
              <div className="mt-3.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span>&uarr; 100% from last year</span>
              </div>
            </div>

            {/* Card 3: Upcoming Terms */}
            <div className="bg-[#FAF8FF] dark:bg-[#11132B] rounded-2xl p-5 border border-purple-100 dark:border-purple-900/40 shadow-xs relative flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Upcoming Terms</p>
                  <h3 className="text-2xl font-black text-[#000E28] dark:text-white mt-1">0</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#F3E8FF] dark:bg-purple-950/70 flex items-center justify-center text-[#9333EA] dark:text-purple-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3.5 flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <span>&rarr; No change</span>
              </div>
            </div>

            {/* Card 4: Completed Terms */}
            <div className="bg-[#FFF8F8] dark:bg-[#1C0F18] rounded-2xl p-5 border border-rose-100 dark:border-rose-950/50 shadow-xs relative flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed Terms</p>
                  <h3 className="text-2xl font-black text-[#000E28] dark:text-white mt-1">2</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FEE2E2] dark:bg-rose-950/70 flex items-center justify-center text-[#EF4444] dark:text-rose-400">
                  <X className="w-5 h-5 stroke-[2.8]" />
                </div>
              </div>
              <div className="mt-3.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span>&uarr; 100% from last year</span>
              </div>
            </div>
          </div>

          {/* Main Card Container */}
          <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-5">
            {/* Header inside Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-[#000E28] dark:text-white">
                Academic Terms &amp; Semesters
              </h2>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search terms, semesters..."
                    value={termSearchQuery}
                    onChange={(e) => setTermSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-[#0050CB] focus:ring-1 focus:ring-[#0050CB] text-slate-800 dark:text-slate-100 w-52 placeholder:text-slate-400 font-medium"
                  />
                  {termSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTermSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Filter Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTermFilterMenu(!showTermFilterMenu)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      termStatusFilter !== 'All'
                        ? 'border-[#0050CB] text-[#0050CB] bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter</span>
                    {termStatusFilter !== 'All' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0050CB]" />
                    )}
                  </button>

                  {showTermFilterMenu && (
                    <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#0A1A3A] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 z-30 space-y-0.5">
                      {(['All', 'Active', 'Upcoming', 'Planned', 'Completed'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setTermStatusFilter(status);
                            setShowTermFilterMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                            termStatusFilter === status
                              ? 'bg-[#0050CB] text-white font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {status === 'All' ? 'All Statuses' : status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* + Add Term Button */}
                <button
                  type="button"
                  onClick={() => setShowAddTermModal(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0050CB] hover:bg-[#003E9E] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Term</span>
                </button>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setTermViewMode('grid')}
                    className={`p-1.5 transition-colors cursor-pointer ${
                      termViewMode === 'grid'
                        ? 'text-[#0050CB] bg-blue-50 dark:bg-blue-950/40'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTermViewMode('list')}
                    className={`p-1.5 transition-colors cursor-pointer ${
                      termViewMode === 'list'
                        ? 'text-[#0050CB] bg-blue-50 dark:bg-blue-950/40'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="List View"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* List / Grid of Terms */}
            {termViewMode === 'list' ? (
              <div className="space-y-3">
                {filteredTerms.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">
                    No academic terms match your filter or search criteria.
                  </div>
                ) : (
                  filteredTerms.map((term, idx) => {
                    const isSelectedOrActive = term.status === 'Active' || idx === 0;

                    // Color theme helpers matching image
                    const isPurple = term.color === 'purple' || term.name.includes('Term 2') || term.name.includes('Autumn');
                    const isOrange = term.color === 'orange' || term.name.includes('Term 3') || term.name.includes('Spring');

                    const iconBg = isPurple
                      ? 'bg-[#F3E8FF] dark:bg-purple-950/60 text-[#9333EA] dark:text-purple-400'
                      : isOrange
                      ? 'bg-[#FFEDD5] dark:bg-amber-950/60 text-[#EA580C] dark:text-amber-400'
                      : 'bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-400';

                    const badgeColor = isPurple
                      ? 'bg-[#F3E8FF] text-[#9333EA] dark:bg-purple-950 dark:text-purple-300'
                      : isOrange
                      ? 'bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-[#E5EEFF] text-[#0050CB] dark:bg-blue-950 dark:text-blue-300';

                    const statusBadgeClass =
                      term.status === 'Active'
                        ? 'bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-400'
                        : term.status === 'Upcoming'
                        ? 'bg-[#E0F2FE] text-[#0284C7] dark:bg-sky-950/60 dark:text-sky-300'
                        : term.status === 'Planned'
                        ? 'bg-[#F1F5F9] text-[#64748B] dark:bg-slate-800 dark:text-slate-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

                    return (
                      <div
                        key={term.id}
                        className={`rounded-2xl p-4 transition-all duration-150 ${
                          isSelectedOrActive
                            ? 'border border-[#93C5FD] dark:border-blue-900/80 bg-white dark:bg-[#07152F] shadow-xs'
                            : 'border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#07152F]'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Left: Icon & Term Name */}
                          <div className="flex items-center gap-3.5 min-w-[200px]">
                            <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-[#000E28] dark:text-white leading-tight">
                                {term.name}
                              </h4>
                              {term.subBadge && (
                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${badgeColor}`}>
                                  {term.subBadge}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Column 2: Schedule */}
                          <div className="min-w-[190px]">
                            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Schedule</span>
                            </div>
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                              - &nbsp;{term.startDate} &rarr; {term.endDate}
                            </p>
                          </div>

                          {/* Column 3: Grade Weightage */}
                          <div className="min-w-[140px]">
                            <p className="text-[11px] font-medium text-slate-400">
                              % Grade Weightage
                            </p>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                              {term.weightage}
                            </p>
                          </div>

                          {/* Column 4: Status Badge */}
                          <div className="min-w-[90px]">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass}`}>
                              {term.status}
                            </span>
                          </div>

                          {/* Column 5: Action Buttons */}
                          <div className="flex items-center gap-2 relative">
                            <button
                              type="button"
                              onClick={() => setSelectedTermForDetails(term)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>View Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveTermMenuId(activeTermMenuId === term.id ? null : term.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeTermMenuId === term.id && (
                              <div className="absolute right-0 top-9 w-44 bg-white dark:bg-[#0A1A3A] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 z-30 space-y-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTermForDetails(term);
                                    setActiveTermMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium flex items-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Breakdown</span>
                                </button>
                                {term.status !== 'Active' && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetTermStatus(term.id, 'Active', 'Current Term')}
                                    className="w-full text-left px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg font-medium flex items-center gap-2"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Set as Active Term</span>
                                  </button>
                                )}
                                {term.status !== 'Completed' && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetTermStatus(term.id, 'Completed', 'Completed')}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium flex items-center gap-2"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Mark Completed</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTerm(term.id)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-medium flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Term</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredTerms.map((term) => {
                  const isPurple = term.color === 'purple' || term.name.includes('Term 2') || term.name.includes('Autumn');
                  const isOrange = term.color === 'orange' || term.name.includes('Term 3') || term.name.includes('Spring');

                  const iconBg = isPurple
                    ? 'bg-[#F3E8FF] dark:bg-purple-950/60 text-[#9333EA] dark:text-purple-400'
                    : isOrange
                    ? 'bg-[#FFEDD5] dark:bg-amber-950/60 text-[#EA580C] dark:text-amber-400'
                    : 'bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-400';

                  const badgeColor = isPurple
                    ? 'bg-[#F3E8FF] text-[#9333EA] dark:bg-purple-950 dark:text-purple-300'
                    : isOrange
                    ? 'bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-[#E5EEFF] text-[#0050CB] dark:bg-blue-950 dark:text-blue-300';

                  return (
                    <div
                      key={term.id}
                      className="bg-white dark:bg-[#07152F] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#000E28] dark:text-white leading-tight">
                              {term.name}
                            </h4>
                            {term.subBadge && (
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${badgeColor}`}>
                                {term.subBadge}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            term.status === 'Active'
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : term.status === 'Upcoming'
                              ? 'bg-[#E0F2FE] text-[#0284C7]'
                              : 'bg-[#F1F5F9] text-[#64748B]'
                          }`}
                        >
                          {term.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between">
                          <span>Schedule:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {term.startDate} &rarr; {term.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Weightage:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {term.weightage}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setSelectedTermForDetails(term)}
                          className="flex items-center gap-1.5 text-xs font-bold text-[#0050CB] hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTerm(term.id)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Tips Banner */}
            <div className="bg-[#F0F6FE] dark:bg-blue-950/20 border border-[#DCEBFF] dark:border-blue-900/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 shadow-2xs text-[#0050CB] dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-[#000E28] dark:text-white">
                    Quick Tips
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Keep your academic terms and semester dates updated for smooth academic operations and accurate reporting.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.success('Academic terms provide the scheduling foundation for attendance, examinations, and grade cards.')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0050CB] dark:text-blue-400 hover:underline shrink-0 cursor-pointer self-start sm:self-center"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBJECT */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-800 dark:text-slate-100">Catalog New Subject</h3>
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Title *</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Mathematics, Physical Sciences"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  placeholder="Curricular scope"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Theme Color Tag</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-9 w-9 rounded-xl border-none cursor-pointer"
                    value={subjectForm.colorCode}
                    onChange={(e) => setSubjectForm({ ...subjectForm, colorCode: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono text-xs font-bold"
                    value={subjectForm.colorCode}
                    onChange={(e) => setSubjectForm({ ...subjectForm, colorCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#0050CB] hover:bg-[#003E9E] text-white font-bold rounded-xl shadow-md"
                >
                  {isSaving ? 'Saving...' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ACADEMIC YEAR */}
      {showYearModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-800 dark:text-slate-100">Register Academic Year</h3>
              <button
                type="button"
                onClick={() => setShowYearModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveYear} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Session Label *</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                  value={yearForm.name}
                  onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                  placeholder="e.g. AY 2026 - 2027"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                    value={yearForm.startDate}
                    onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Date *</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                    value={yearForm.endDate}
                    onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={yearForm.isCurrent}
                  onChange={(e) => setYearForm({ ...yearForm, isCurrent: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0050CB]"
                />
                <span>Set as active session immediately</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowYearModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#0050CB] hover:bg-[#003E9E] text-white font-bold rounded-xl shadow-md"
                >
                  {isSaving ? 'Creating...' : 'Register Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TERM */}
      {showAddTermModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E5EEFF] dark:bg-blue-950/60 text-[#0050CB] dark:text-blue-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-800 dark:text-slate-100">Add Academic Term</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTermModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTerm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Term Title *</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden focus:border-[#0050CB] focus:ring-1 focus:ring-[#0050CB]"
                  value={termForm.name}
                  onChange={(e) => setTermForm({ ...termForm, name: e.target.value })}
                  placeholder="e.g. Term 4 (Winter)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sub-Badge Label</label>
                  <select
                    value={termForm.subBadge}
                    onChange={(e) => setTermForm({ ...termForm, subBadge: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                  >
                    <option value="Current Term">Current Term</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Planned">Planned</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Term Status</label>
                  <select
                    value={termForm.status}
                    onChange={(e) => setTermForm({ ...termForm, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Planned">Planned</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                    value={termForm.startDate}
                    onChange={(e) => setTermForm({ ...termForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Date *</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                    value={termForm.endDate}
                    onChange={(e) => setTermForm({ ...termForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grade Weightage</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                    value={termForm.weightage}
                    onChange={(e) => setTermForm({ ...termForm, weightage: e.target.value })}
                    placeholder="e.g. 30% or 35%"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Theme Accent</label>
                  <select
                    value={termForm.color}
                    onChange={(e) => setTermForm({ ...termForm, color: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-hidden"
                  >
                    <option value="blue">Royal Blue</option>
                    <option value="purple">Lavender Purple</option>
                    <option value="orange">Autumn Orange</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTermModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0050CB] hover:bg-[#003E9E] text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Add Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW TERM DETAILS */}
      {selectedTermForDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-5">
            {/* Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  selectedTermForDetails.color === 'purple' || selectedTermForDetails.name.includes('Term 2')
                    ? 'bg-[#F3E8FF] text-[#9333EA]'
                    : selectedTermForDetails.color === 'orange' || selectedTermForDetails.name.includes('Term 3')
                    ? 'bg-[#FFEDD5] text-[#EA580C]'
                    : 'bg-[#E5EEFF] text-[#0050CB]'
                }`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-800 dark:text-slate-100 leading-tight">
                    {selectedTermForDetails.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedTermForDetails.subBadge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {selectedTermForDetails.subBadge}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedTermForDetails.status === 'Active'
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : selectedTermForDetails.status === 'Upcoming'
                        ? 'bg-[#E0F2FE] text-[#0284C7]'
                        : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}>
                      {selectedTermForDetails.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTermForDetails(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Schedule & Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 space-y-3 text-xs border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Start Date:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">
                  {selectedTermForDetails.startDate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">End Date:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">
                  {selectedTermForDetails.endDate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Grade Assessment Weight:</span>
                <span className="font-bold text-[#0050CB] dark:text-blue-400">
                  {selectedTermForDetails.weightage}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-[#0050CB] h-full rounded-full transition-all"
                  style={{ width: selectedTermForDetails.weightage || '30%' }}
                />
              </div>
            </div>

            {/* Guidelines */}
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-[#0050CB] shrink-0 mt-0.5" />
              <p>
                Student attendance records, period timetables, and quarterly examination marksheets will be mapped to this academic term interval.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleDeleteTerm(selectedTermForDetails.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <div className="flex items-center gap-2">
                {selectedTermForDetails.status !== 'Active' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSetTermStatus(selectedTermForDetails.id, 'Active', 'Current Term');
                      setSelectedTermForDetails(null);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Activate Term
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedTermForDetails(null)}
                  className="px-4 py-1.5 bg-[#0050CB] hover:bg-[#003E9E] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBJECT DETAILS */}
      {selectedSubjectForDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#07152F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                {renderSubjectCardIcon(selectedSubjectForDetails)}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-[#000E28] dark:text-white">
                      {selectedSubjectForDetails.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (selectedSubjectForDetails.category || 'Core') === 'Core'
                          ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                          : 'bg-[#F3E8FF] text-[#9333EA] border border-[#E9D5FF]'
                      }`}
                    >
                      {selectedSubjectForDetails.category || 'Core'}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-slate-400 mt-0.5">
                    Code: {selectedSubjectForDetails.code || 'SUB001'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubjectForDetails(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-medium leading-relaxed">
                {selectedSubjectForDetails.description || 'Core academic curriculum aligned with standard institutional syllabus.'}
              </p>
            </div>

            {/* Specification Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Eligible Classes</span>
                <span className="font-bold text-[#000E28] dark:text-white flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#0050CB]" />
                  <span>{selectedSubjectForDetails.classes || 'PreKG, LKG, UKG'}</span>
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Discipline Type</span>
                <span className="font-bold text-[#000E28] dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0050CB]" />
                  <span>{selectedSubjectForDetails.type || 'Academic'}</span>
                </span>
              </div>
            </div>

            {/* Curricular Status Banner */}
            <div className="p-3 bg-[#E5EEFF] dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 rounded-xl text-xs text-[#0050CB] dark:text-blue-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Curriculum Status: Active</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  Timetable matrix slots, periodic assessments, and gradebooks are configured for this subject.
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  handleDeleteSubject(selectedSubjectForDetails._id);
                  setSelectedSubjectForDetails(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.success('Curriculum syllabus verified');
                    setSelectedSubjectForDetails(null);
                  }}
                  className="px-4 py-2 bg-[#0050CB] hover:bg-[#003E9E] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AcademicPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-[#0050CB] border-t-transparent rounded-full animate-spin" />
        <span>Loading Academic Command...</span>
      </div>
    }>
      <AcademicContent />
    </Suspense>
  );
}
