"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Home, ChevronRight, Calendar, ChevronDown, Check, Download, Printer,
  Clock, MapPin, User, Calculator, BookOpen, Sprout, Palette, 
  Languages, Activity, CheckCircle2, Zap, FileText, TrendingUp, 
  UploadCloud, AlertCircle, Lightbulb, Info, CheckCircle, Apple, 
  UtensilsCrossed, Coffee
} from "lucide-react";
import toast from "react-hot-toast";
import { useParent } from "@/context/ParentContext";
import { downloadFile } from "@/lib/fileDownload";
import { exportToCSV, printDocument } from "@/lib/exportUtils";
import { getCurrentAcademicYearFormatted, getAcademicYearDisplayOptions } from "@/lib/date";

interface TimetablePeriod {
  periodNum?: number;
  periodLabel?: string;
  isBreak?: boolean;
  breakType?: "snack" | "lunch";
  time: string;
  subject: string;
  topic: string;
  room: string;
  teacher?: string;
  status: "Completed" | "Ongoing" | "Upcoming" | "Missed";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
}

// Dynamically generate date for the current week's Monday-Friday in Asia/Kolkata
function getWeekDayDateStr(dayOffset: number): string {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);
  
  const targetDate = new Date(monday);
  targetDate.setDate(monday.getDate() + dayOffset);
  
  return targetDate.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export default function TimetablePage() {
  const { selectedChild, selectChild, children = [] } = useParent();
  const [selectedDay, setSelectedDay] = useState<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday">("Monday");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(() => getCurrentAcademicYearFormatted());
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState<boolean>(false);
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState<boolean>(false);

  const child = selectedChild || {
    _id: "child-1",
    firstName: "Aarav",
    lastName: "Sharma",
    grade: "LKG",
    section: "Section A",
    rollNumber: "LKG-014",
    studentPhoto: "/aarav-profile-avatar.png",
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

  // Schedules by day with Break & Lunch hours
  const scheduleData: Record<typeof days[number], { dateStr: string; periods: TimetablePeriod[] }> = {
    Monday: {
      dateStr: getWeekDayDateStr(0),
      periods: [
        {
          periodNum: 1,
          periodLabel: "1st",
          time: "08:30 AM – 09:15 AM",
          subject: "Mathematics",
          topic: "Numbers 1-20",
          room: "Classroom 102",
          teacher: "Ms. Ananya Roy",
          status: "Completed",
          icon: Calculator,
          iconBg: "bg-[#EAF2FF] dark:bg-blue-900/30",
          iconColor: "text-[#0050CB] dark:text-[#38BDF8]",
          badgeBg: "bg-[#EBF3FF] dark:bg-blue-950/40",
          badgeColor: "text-[#0050CB] dark:text-[#38BDF8]"
        },
        {
          periodNum: 2,
          periodLabel: "2nd",
          time: "09:15 AM – 10:00 AM",
          subject: "English",
          topic: "Letter Sounds & Blends",
          room: "Classroom 102",
          teacher: "Ms. Ananya Roy",
          status: "Completed",
          icon: BookOpen,
          iconBg: "bg-[#FDF2F8] dark:bg-pink-950/30",
          iconColor: "text-[#DB2777] dark:text-pink-400",
          badgeBg: "bg-[#F3EEFF] dark:bg-purple-950/40",
          badgeColor: "text-[#7E3AF2] dark:text-purple-400"
        },
        {
          isBreak: true,
          breakType: "snack",
          time: "10:00 AM – 10:15 AM",
          subject: "Morning Snack Break",
          topic: "Healthy fruit snack, milk & hydration",
          room: "Play Quad / Cafeteria",
          status: "Completed",
          icon: Apple,
          iconBg: "bg-[#FEF3C7] dark:bg-amber-950/30",
          iconColor: "text-[#D97706] dark:text-amber-400",
          badgeBg: "bg-[#FEF3C7] dark:bg-amber-950/40",
          badgeColor: "text-[#D97706] dark:text-amber-400"
        },
        {
          periodNum: 3,
          periodLabel: "3rd",
          time: "10:15 AM – 11:00 AM",
          subject: "EVS",
          topic: "My Family",
          room: "Classroom 102",
          teacher: "Ms. Ananya Roy",
          status: "Completed",
          icon: Sprout,
          iconBg: "bg-[#DEF7EC] dark:bg-emerald-950/30",
          iconColor: "text-[#0E9F6E] dark:text-emerald-400",
          badgeBg: "bg-[#EDFDF5] dark:bg-emerald-950/40",
          badgeColor: "text-[#0E9F6E] dark:text-emerald-400"
        },
        {
          periodNum: 4,
          periodLabel: "4th",
          time: "11:00 AM – 11:45 AM",
          subject: "Art & Craft",
          topic: "Paper Collage",
          room: "Art Room",
          teacher: "Mr. Deepak Sen",
          status: "Completed",
          icon: Palette,
          iconBg: "bg-[#FEF3C7] dark:bg-amber-950/30",
          iconColor: "text-[#D97706] dark:text-amber-400",
          badgeBg: "bg-[#FEF5EA] dark:bg-amber-950/40",
          badgeColor: "text-[#D97706] dark:text-amber-400"
        },
        {
          isBreak: true,
          breakType: "lunch",
          time: "11:45 AM – 12:30 PM",
          subject: "Nutritious Lunch Break",
          topic: "Warm balanced meal & dining etiquette",
          room: "Main Dining Hall",
          status: "Completed",
          icon: UtensilsCrossed,
          iconBg: "bg-[#FFF7ED] dark:bg-orange-950/30",
          iconColor: "text-[#EA580C] dark:text-orange-400",
          badgeBg: "bg-[#FFEDD5] dark:bg-orange-950/40",
          badgeColor: "text-[#EA580C] dark:text-orange-400"
        },
        {
          periodNum: 5,
          periodLabel: "5th",
          time: "12:30 PM – 01:15 PM",
          subject: "Hindi",
          topic: "वर्णमाला (स्वर)",
          room: "Classroom 102",
          teacher: "Mrs. Kavita Singh",
          status: "Ongoing",
          icon: Languages,
          iconBg: "bg-[#F3E8FF] dark:bg-purple-950/30",
          iconColor: "text-[#9333EA] dark:text-purple-400",
          badgeBg: "bg-[#F3EEFF] dark:bg-purple-950/40",
          badgeColor: "text-[#7E3AF2] dark:text-purple-400"
        },
        {
          periodNum: 6,
          periodLabel: "6th",
          time: "01:15 PM – 02:00 PM",
          subject: "Story Time",
          topic: "The Clever Crow",
          room: "Library",
          teacher: "Ms. Pooja Mehra",
          status: "Upcoming",
          icon: BookOpen,
          iconBg: "bg-[#E0F2FE] dark:bg-sky-950/30",
          iconColor: "text-[#0284C7] dark:text-sky-400",
          badgeBg: "bg-[#E6FFFA] dark:bg-teal-950/40",
          badgeColor: "text-[#047481] dark:text-teal-400"
        },
        {
          periodNum: 7,
          periodLabel: "7th",
          time: "02:00 PM – 02:45 PM",
          subject: "Physical Education",
          topic: "Outdoor Games",
          room: "Playground",
          teacher: "Coach Vikram",
          status: "Upcoming",
          icon: Activity,
          iconBg: "bg-[#FFE4E6] dark:bg-rose-950/30",
          iconColor: "text-[#E11D48] dark:text-rose-400",
          badgeBg: "bg-[#FFE4E6] dark:bg-rose-950/40",
          badgeColor: "text-[#E11D48] dark:text-rose-400"
        }
      ]
    },
    Tuesday: {
      dateStr: getWeekDayDateStr(1),
      periods: [
        {
          periodNum: 1,
          periodLabel: "1st",
          time: "08:30 AM – 09:15 AM",
          subject: "Morning Circle & News Share",
          topic: "Show & Tell with Objects",
          room: "Classroom 102",
          teacher: "Ms. Ananya Roy",
          status: "Completed",
          icon: BookOpen,
          iconBg: "bg-[#EAF2FF] dark:bg-blue-900/30",
          iconColor: "text-[#0050CB] dark:text-[#38BDF8]",
          badgeBg: "bg-[#EBF3FF] dark:bg-blue-950/40",
          badgeColor: "text-[#0050CB] dark:text-[#38BDF8]"
        },
        {
          periodNum: 2,
          periodLabel: "2nd",
          time: "09:15 AM – 10:00 AM",
          subject: "Numeracy & Shapes",
          topic: "Circles, Squares & Triangles",
          room: "Classroom 102",
          teacher: "Ms. Ananya Roy",
          status: "Completed",
          icon: Calculator,
          iconBg: "bg-[#DEF7EC] dark:bg-emerald-950/30",
          iconColor: "text-[#0E9F6E] dark:text-emerald-400",
          badgeBg: "bg-[#EDFDF5] dark:bg-emerald-950/40",
          badgeColor: "text-[#0E9F6E] dark:text-emerald-400"
        },
        {
          isBreak: true,
          breakType: "snack",
          time: "10:00 AM – 10:15 AM",
          subject: "Morning Snack Break",
          topic: "Fresh fruits, cookies & water",
          room: "Cafeteria Quad",
          status: "Completed",
          icon: Apple,
          iconBg: "bg-[#FEF3C7] dark:bg-amber-950/30",
          iconColor: "text-[#D97706] dark:text-amber-400",
          badgeBg: "bg-[#FEF3C7] dark:bg-amber-950/40",
          badgeColor: "text-[#D97706] dark:text-amber-400"
        },
        {
          periodNum: 3,
          periodLabel: "3rd",
          time: "10:15 AM – 11:00 AM",
          subject: "Gross Motor Play",
          topic: "Tunnel Crawl & Beanbag Toss",
          room: "Play Gym",
          teacher: "Coach Vikram",
          status: "Completed",
          icon: Activity,
          iconBg: "bg-[#FFE4E6] dark:bg-rose-950/30",
          iconColor: "text-[#E11D48] dark:text-rose-400",
          badgeBg: "bg-[#FFE4E6] dark:bg-rose-950/40",
          badgeColor: "text-[#E11D48] dark:text-rose-400"
        },
        {
          periodNum: 4,
          periodLabel: "4th",
          time: "11:00 AM – 11:45 AM",
          subject: "Water & Sensory Play",
          topic: "Measuring Cups & Damp Sand",
          room: "Sensory Hub",
          teacher: "Ms. Ananya Roy",
          status: "Completed",
          icon: Sprout,
          iconBg: "bg-[#E0F2FE] dark:bg-sky-950/30",
          iconColor: "text-[#0284C7] dark:text-sky-400",
          badgeBg: "bg-[#E6FFFA] dark:bg-teal-950/40",
          badgeColor: "text-[#047481] dark:text-teal-400"
        },
        {
          isBreak: true,
          breakType: "lunch",
          time: "11:45 AM – 12:30 PM",
          subject: "Nutritious Lunch Break",
          topic: "Warm meals, salad & table cleanup",
          room: "Main Dining Hall",
          status: "Ongoing",
          icon: UtensilsCrossed,
          iconBg: "bg-[#FFF7ED] dark:bg-orange-950/30",
          iconColor: "text-[#EA580C] dark:text-orange-400",
          badgeBg: "bg-[#FFEDD5] dark:bg-orange-950/40",
          badgeColor: "text-[#EA580C] dark:text-orange-400"
        },
        {
          periodNum: 5,
          periodLabel: "5th",
          time: "12:30 PM – 01:15 PM",
          subject: "Colouring & Expression",
          topic: "Big Crayon Drawing",
          room: "Art Room",
          teacher: "Mr. Deepak Sen",
          status: "Upcoming",
          icon: Palette,
          iconBg: "bg-[#F3E8FF] dark:bg-purple-950/30",
          iconColor: "text-[#9333EA] dark:text-purple-400",
          badgeBg: "bg-[#F3EEFF] dark:bg-purple-950/40",
          badgeColor: "text-[#7E3AF2] dark:text-purple-400"
        },
        {
          periodNum: 6,
          periodLabel: "6th",
          time: "01:15 PM – 02:00 PM",
          subject: "Quiet Story Hour",
          topic: "Picture Books & Wonder Corner",
          room: "Library",
          teacher: "Ms. Pooja Mehra",
          status: "Upcoming",
          icon: BookOpen,
          iconBg: "bg-[#E0F2FE] dark:bg-sky-950/30",
          iconColor: "text-[#0284C7] dark:text-sky-400",
          badgeBg: "bg-[#E6FFFA] dark:bg-teal-950/40",
          badgeColor: "text-[#047481] dark:text-teal-400"
        },
        {
          periodNum: 7,
          periodLabel: "7th",
          time: "02:00 PM – 02:30 PM",
          subject: "Dismissal & Pickup",
          topic: "Orderly Dispersal",
          room: "Main Gate",
          teacher: "Class Care Team",
          status: "Upcoming",
          icon: CheckCircle2,
          iconBg: "bg-[#DEF7EC] dark:bg-emerald-950/30",
          iconColor: "text-[#0E9F6E] dark:text-emerald-400",
          badgeBg: "bg-[#EDFDF5] dark:bg-emerald-950/40",
          badgeColor: "text-[#0E9F6E] dark:text-emerald-400"
        }
      ]
    },
    Wednesday: {
      dateStr: getWeekDayDateStr(2),
      periods: [
        {
          periodNum: 1,
          periodLabel: "1st",
          time: "08:30 AM – 09:15 AM",
          subject: "Circle Time & Nursery Rhymes",
          topic: "Finger Plays with Gestures",
          room: "Classroom 102",
          teacher: "Ms. Ananya Roy",
          status: "Completed",
          icon: BookOpen,
          iconBg: "bg-[#EAF2FF] dark:bg-blue-900/30",
          iconColor: "text-[#0050CB] dark:text-[#38BDF8]",
          badgeBg: "bg-[#EBF3FF] dark:bg-blue-950/40",
          badgeColor: "text-[#0050CB] dark:text-[#38BDF8]"
        },
        {
          periodNum: 2,
          periodLabel: "2nd",
          time: "09:15 AM – 10:00 AM",
          subject: "Phonics & Tracing",
          topic: "Sandpaper Letters",
          room: "Classroom 102",
          teacher: "Ms. Ananya Roy",
          status: "Completed",
          icon: BookOpen,
          iconBg: "bg-[#FDF2F8] dark:bg-pink-950/30",
          iconColor: "text-[#DB2777] dark:text-pink-400",
          badgeBg: "bg-[#F3EEFF] dark:bg-purple-950/40",
          badgeColor: "text-[#7E3AF2] dark:text-purple-400"
        },
        {
          isBreak: true,
          breakType: "snack",
          time: "10:00 AM – 10:15 AM",
          subject: "Morning Snack Break",
          topic: "Healthy fruit snack & hydration",
          room: "Play Quad / Cafeteria",
          status: "Completed",
          icon: Apple,
          iconBg: "bg-[#FEF3C7] dark:bg-amber-950/30",
          iconColor: "text-[#D97706] dark:text-amber-400",
          badgeBg: "bg-[#FEF3C7] dark:bg-amber-950/40",
          badgeColor: "text-[#D97706] dark:text-amber-400"
        },
        {
          periodNum: 3,
          periodLabel: "3rd",
          time: "10:15 AM – 11:00 AM",
          subject: "Yoga & Mindfulness",
          topic: "Animal Stretch Poses",
          room: "Zen Studio",
          teacher: "Mrs. Shalini",
          status: "Ongoing",
          icon: Activity,
          iconBg: "bg-[#DEF7EC] dark:bg-emerald-950/30",
          iconColor: "text-[#0E9F6E] dark:text-emerald-400",
          badgeBg: "bg-[#EDFDF5] dark:bg-emerald-950/40",
          badgeColor: "text-[#0E9F6E] dark:text-emerald-400"
        },
        {
          periodNum: 4,
          periodLabel: "4th",
          time: "11:00 AM – 11:45 AM",
          subject: "Little Scientists Observation",
          topic: "Sink or Float Water Experiment",
          room: "Science Lab",
          teacher: "Mr. Rajesh Kumar",
          status: "Upcoming",
          icon: Sprout,
          iconBg: "bg-[#E0F2FE] dark:bg-sky-950/30",
          iconColor: "text-[#0284C7] dark:text-sky-400",
          badgeBg: "bg-[#E6FFFA] dark:bg-teal-950/40",
          badgeColor: "text-[#047481] dark:text-teal-400"
        },
        {
          isBreak: true,
          breakType: "lunch",
          time: "11:45 AM – 12:30 PM",
          subject: "Nutritious Lunch Break",
          topic: "Warm meal, dining manners & social chat",
          room: "Dining Hall",
          status: "Upcoming",
          icon: UtensilsCrossed,
          iconBg: "bg-[#FFF7ED] dark:bg-orange-950/30",
          iconColor: "text-[#EA580C] dark:text-orange-400",
          badgeBg: "bg-[#FFEDD5] dark:bg-orange-950/40",
          badgeColor: "text-[#EA580C] dark:text-orange-400"
        },
        {
          periodNum: 5,
          periodLabel: "5th",
          time: "12:30 PM – 01:15 PM",
          subject: "Building Blocks & Puzzles",
          topic: "Mega Bloks & Geometry",
          room: "Activity Wing",
          teacher: "Ms. Ananya Roy",
          status: "Upcoming",
          icon: Calculator,
          iconBg: "bg-[#F3E8FF] dark:bg-purple-950/30",
          iconColor: "text-[#9333EA] dark:text-purple-400",
          badgeBg: "bg-[#F3EEFF] dark:bg-purple-950/40",
          badgeColor: "text-[#7E3AF2] dark:text-purple-400"
        },
        {
          periodNum: 6,
          periodLabel: "6th",
          time: "01:15 PM – 02:00 PM",
          subject: "Music & Rhythmic Clapping",
          topic: "Percussion & Rhymes",
          room: "Music Room",
          teacher: "Mrs. Shalini",
          status: "Upcoming",
          icon: Zap,
          iconBg: "bg-[#DEF7EC] dark:bg-emerald-950/30",
          iconColor: "text-[#0E9F6E] dark:text-emerald-400",
          badgeBg: "bg-[#EDFDF5] dark:bg-emerald-950/40",
          badgeColor: "text-[#0E9F6E] dark:text-emerald-400"
        },
        {
          periodNum: 7,
          periodLabel: "7th",
          time: "02:00 PM – 02:30 PM",
          subject: "Dismissal & Pickup",
          topic: "Class Dispersal",
          room: "Main Gate",
          teacher: "Class Care Team",
          status: "Upcoming",
          icon: CheckCircle2,
          iconBg: "bg-[#DEF7EC] dark:bg-emerald-950/30",
          iconColor: "text-[#0E9F6E] dark:text-emerald-400",
          badgeBg: "bg-[#EDFDF5] dark:bg-emerald-950/40",
          badgeColor: "text-[#0E9F6E] dark:text-emerald-400"
        }
      ]
    },
    Thursday: {
      dateStr: getWeekDayDateStr(3),
      periods: [
        {
          periodNum: 1,
          periodLabel: "1st",
          time: "08:30 AM – 09:15 AM",
          subject: "Circle Time & Calendar Talk",
          topic: "Days of the Week & Weather",
          room: "Classroom 102",
          teacher: "Ms. Ananya Roy",
          status: "Completed",
          icon: BookOpen,
          iconBg: "bg-[#EAF2FF] dark:bg-blue-900/30",
          iconColor: "text-[#0050CB] dark:text-[#38BDF8]",
          badgeBg: "bg-[#EBF3FF] dark:bg-blue-950/40",
          badgeColor: "text-[#0050CB] dark:text-[#38BDF8]"
        },
        {
          periodNum: 2,
          periodLabel: "2nd",
          time: "09:15 AM – 10:00 AM",
          subject: "Numbers & Quantities",
          topic: "Teddy Bear Counters",
          room: "Classroom 102",
          teacher: "Ms. Ananya Roy",
          status: "Completed",
          icon: Calculator,
          iconBg: "bg-[#DEF7EC] dark:bg-emerald-950/30",
          iconColor: "text-[#0E9F6E] dark:text-emerald-400",
          badgeBg: "bg-[#EDFDF5] dark:bg-emerald-950/40",
          badgeColor: "text-[#0E9F6E] dark:text-emerald-400"
        },
        {
          isBreak: true,
          breakType: "snack",
          time: "10:00 AM – 10:15 AM",
          subject: "Morning Snack Break",
          topic: "Fruit slices & hydration break",
          room: "Play Quad / Cafeteria",
          status: "Completed",
          icon: Apple,
          iconBg: "bg-[#FEF3C7] dark:bg-amber-950/30",
          iconColor: "text-[#D97706] dark:text-amber-400",
          badgeBg: "bg-[#FEF3C7] dark:bg-amber-950/40",
          badgeColor: "text-[#D97706] dark:text-amber-400"
        },
        {
          periodNum: 3,
          periodLabel: "3rd",
          time: "10:15 AM – 11:00 AM",
          subject: "Theatre & Puppet Roleplay",
          topic: "Goldilocks Story Play",
          room: "Drama Studio",
          teacher: "Ms. Pooja Mehra",
          status: "Ongoing",
          icon: Palette,
          iconBg: "bg-[#FEF3C7] dark:bg-amber-950/30",
          iconColor: "text-[#D97706] dark:text-amber-400",
          badgeBg: "bg-[#FEF5EA] dark:bg-amber-950/40",
          badgeColor: "text-[#D97706] dark:text-amber-400"
        },
        {
          periodNum: 4,
          periodLabel: "4th",
          time: "11:00 AM – 11:45 AM",
          subject: "Fine Motor Skills",
          topic: "Safety Scissor Snipping & Paper",
          room: "Art Room",
          teacher: "Mr. Deepak Sen",
          status: "Upcoming",
          icon: Sprout,
          iconBg: "bg-[#FDF2F8] dark:bg-pink-950/30",
          iconColor: "text-[#DB2777] dark:text-pink-400",
          badgeBg: "bg-[#F3EEFF] dark:bg-purple-950/40",
          badgeColor: "text-[#7E3AF2] dark:text-purple-400"
        },
        {
          isBreak: true,
          breakType: "lunch",
          time: "11:45 AM – 12:30 PM",
          subject: "Nutritious Lunch Break",
          topic: "Warm meals & hygiene routines",
          room: "Dining Hall",
          status: "Upcoming",
          icon: UtensilsCrossed,
          iconBg: "bg-[#FFF7ED] dark:bg-orange-950/30",
          iconColor: "text-[#EA580C] dark:text-orange-400",
          badgeBg: "bg-[#FFEDD5] dark:bg-orange-950/40",
          badgeColor: "text-[#EA580C] dark:text-orange-400"
        },
        {
          periodNum: 5,
          periodLabel: "5th",
          time: "12:30 PM – 01:15 PM",
          subject: "Sensory Nature Play",
          topic: "Tactile Soil & Leaf Grouping",
          room: "Courtyard Garden",
          teacher: "Ms. Ananya Roy",
          status: "Upcoming",
          icon: Sprout,
          iconBg: "bg-[#DEF7EC] dark:bg-emerald-950/30",
          iconColor: "text-[#0E9F6E] dark:text-emerald-400",
          badgeBg: "bg-[#EDFDF5] dark:bg-emerald-950/40",
          badgeColor: "text-[#0E9F6E] dark:text-emerald-400"
        },
        {
          periodNum: 6,
          periodLabel: "6th",
          time: "01:15 PM – 02:00 PM",
          subject: "Outdoor Tricycle Track",
          topic: "Pedal Motor & Traffic Signs",
          room: "Quad Track",
          teacher: "Coach Vikram",
          status: "Upcoming",
          icon: Activity,
          iconBg: "bg-[#FFE4E6] dark:bg-rose-950/30",
          iconColor: "text-[#E11D48] dark:text-rose-400",
          badgeBg: "bg-[#FFE4E6] dark:bg-rose-950/40",
          badgeColor: "text-[#E11D48] dark:text-rose-400"
        },
        {
          periodNum: 7,
          periodLabel: "7th",
          time: "02:00 PM – 02:30 PM",
          subject: "Dismissal & Pickup",
          topic: "Student Dispersal",
          room: "Main Gate",
          teacher: "Class Care Team",
          status: "Upcoming",
          icon: CheckCircle2,
          iconBg: "bg-[#DEF7EC] dark:bg-emerald-950/30",
          iconColor: "text-[#0E9F6E] dark:text-emerald-400",
          badgeBg: "bg-[#EDFDF5] dark:bg-emerald-950/40",
          badgeColor: "text-[#0E9F6E] dark:text-emerald-400"
        }
      ]
    },
    Friday: {
      dateStr: getWeekDayDateStr(4),
      periods: [
        {
          periodNum: 1,
          periodLabel: "1st",
          time: "08:30 AM – 09:15 AM",
          subject: "Morning Assembly & Circle",
          topic: "National Anthem & Hymn",
          room: "Auditorium",
          teacher: "Ms. Ananya Roy",
          status: "Completed",
          icon: BookOpen,
          iconBg: "bg-[#EAF2FF] dark:bg-blue-900/30",
          iconColor: "text-[#0050CB] dark:text-[#38BDF8]",
          badgeBg: "bg-[#EBF3FF] dark:bg-blue-950/40",
          badgeColor: "text-[#0050CB] dark:text-[#38BDF8]"
        },
        {
          periodNum: 2,
          periodLabel: "2nd",
          time: "09:15 AM – 10:00 AM",
          subject: "Numbers & Counting",
          topic: "Tactile Beads & Sorting",
          room: "Classroom 102",
          teacher: "Ms. Ananya Roy",
          status: "Completed",
          icon: Calculator,
          iconBg: "bg-[#DEF7EC] dark:bg-emerald-950/30",
          iconColor: "text-[#0E9F6E] dark:text-emerald-400",
          badgeBg: "bg-[#EDFDF5] dark:bg-emerald-950/40",
          badgeColor: "text-[#0E9F6E] dark:text-emerald-400"
        },
        {
          isBreak: true,
          breakType: "snack",
          time: "10:00 AM – 10:15 AM",
          subject: "Morning Snack Break",
          topic: "Nutritious snack, fruit & water",
          room: "Cafeteria Quad",
          status: "Completed",
          icon: Apple,
          iconBg: "bg-[#FEF3C7] dark:bg-amber-950/30",
          iconColor: "text-[#D97706] dark:text-amber-400",
          badgeBg: "bg-[#FEF3C7] dark:bg-amber-950/40",
          badgeColor: "text-[#D97706] dark:text-amber-400"
        },
        {
          periodNum: 3,
          periodLabel: "3rd",
          time: "10:15 AM – 11:00 AM",
          subject: "Creative Arts & Crafts",
          topic: "Clay Modeling & Animals",
          room: "Art Studio",
          teacher: "Mr. Deepak Sen",
          status: "Completed",
          icon: Palette,
          iconBg: "bg-[#FEF3C7] dark:bg-amber-950/30",
          iconColor: "text-[#D97706] dark:text-amber-400",
          badgeBg: "bg-[#FEF5EA] dark:bg-amber-950/40",
          badgeColor: "text-[#D97706] dark:text-amber-400"
        },
        {
          periodNum: 4,
          periodLabel: "4th",
          time: "11:00 AM – 11:45 AM",
          subject: "Story & Rhymes",
          topic: "Puppet Theatre & Storytelling",
          room: "Interactive Library",
          teacher: "Ms. Pooja Mehra",
          status: "Ongoing",
          icon: BookOpen,
          iconBg: "bg-[#E0F2FE] dark:bg-sky-950/30",
          iconColor: "text-[#0284C7] dark:text-sky-400",
          badgeBg: "bg-[#E6FFFA] dark:bg-teal-950/40",
          badgeColor: "text-[#047481] dark:text-teal-400"
        },
        {
          isBreak: true,
          breakType: "lunch",
          time: "11:45 AM – 12:30 PM",
          subject: "Nutritious Lunch Break",
          topic: "Dining manners & hot healthy meals",
          room: "Dining Hall",
          status: "Upcoming",
          icon: UtensilsCrossed,
          iconBg: "bg-[#FFF7ED] dark:bg-orange-950/30",
          iconColor: "text-[#EA580C] dark:text-orange-400",
          badgeBg: "bg-[#FFEDD5] dark:bg-orange-950/40",
          badgeColor: "text-[#EA580C] dark:text-orange-400"
        },
        {
          periodNum: 5,
          periodLabel: "5th",
          time: "12:30 PM – 01:15 PM",
          subject: "Quiet Reading & Free Play",
          topic: "Picture Books & Wonder Corner",
          room: "Classroom 102",
          teacher: "Ms. Ananya Roy",
          status: "Upcoming",
          icon: BookOpen,
          iconBg: "bg-[#E0F2FE] dark:bg-sky-950/30",
          iconColor: "text-[#0284C7] dark:text-sky-400",
          badgeBg: "bg-[#E6FFFA] dark:bg-teal-950/40",
          badgeColor: "text-[#047481] dark:text-teal-400"
        },
        {
          periodNum: 6,
          periodLabel: "6th",
          time: "01:15 PM – 02:00 PM",
          subject: "Physical Play & Motor Gym",
          topic: "Parachute Play & Relays",
          room: "Outdoor Turf",
          teacher: "Coach Vikram",
          status: "Upcoming",
          icon: Activity,
          iconBg: "bg-[#FFE4E6] dark:bg-rose-950/30",
          iconColor: "text-[#E11D48] dark:text-rose-400",
          badgeBg: "bg-[#FFE4E6] dark:bg-rose-950/40",
          badgeColor: "text-[#E11D48] dark:text-rose-400"
        },
        {
          periodNum: 7,
          periodLabel: "7th",
          time: "02:15 PM – 02:30 PM",
          subject: "Dismissal & Pickup",
          topic: "Afternoon Student Dispersal",
          room: "Main Gate",
          teacher: "Class Care Team",
          status: "Upcoming",
          icon: CheckCircle2,
          iconBg: "bg-[#DEF7EC] dark:bg-emerald-950/30",
          iconColor: "text-[#0E9F6E] dark:text-emerald-400",
          badgeBg: "bg-[#EDFDF5] dark:bg-emerald-950/40",
          badgeColor: "text-[#0E9F6E] dark:text-emerald-400"
        }
      ]
    }
  };

  const activeDayData = scheduleData[selectedDay];
  const activePeriods = activeDayData.periods;
  const academicPeriods = useMemo(() => activePeriods.filter(p => !p.isBreak), [activePeriods]);
  const breakPeriods = useMemo(() => activePeriods.filter(p => p.isBreak), [activePeriods]);

  // Compute counts for Today's Summary (counting academic classes)
  const summaryCounts = useMemo(() => {
    let completed = 0;
    let ongoing = 0;
    let missed = 0;
    let upcoming = 0;

    academicPeriods.forEach((p) => {
      if (p.status === "Completed") completed++;
      else if (p.status === "Ongoing") ongoing++;
      else if (p.status === "Missed") missed++;
      else if (p.status === "Upcoming") upcoming++;
    });

    return { completed, ongoing, missed, upcoming };
  }, [academicPeriods]);

  const handleExportScheduleCSV = () => {
    const rows = academicPeriods.map((p) => ({
      Period: p.periodLabel || 'Period',
      Time: p.time,
      Subject: p.subject,
      Topic: p.topic,
      Room: p.room,
      Teacher: p.teacher || 'Class Faculty',
      Status: p.status,
    }));
    exportToCSV(rows, `GGPS_Timetable_${child.firstName}_${selectedDay}_${selectedAcademicYear.replace(/\s+/g, '_')}`);
  };

  const handlePrintTimetable = () => {
    printDocument('printable-timetable-container', `GGPS School Timetable - ${child.firstName} (${selectedDay})`);
  };

  return (
    <div className="space-y-5 pb-16 font-sans">
      
      {/* 1. Breadcrumb Top Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/parent" className="hover:text-[#0050CB] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
        <span className="text-slate-800 dark:text-slate-200 font-bold">
          Timetable
        </span>
      </div>

      {/* 2. Hero Banner */}
      <div className="relative rounded-[26px] bg-gradient-to-r from-[#EBF3FF] via-[#E8F1FE] to-[#DDEBFF] dark:from-[#091E42] dark:via-[#0A2554] dark:to-[#091E42] border border-[#CDE1FF] dark:border-blue-900/40 p-6 sm:p-7 shadow-xs">
        
        {/* Subtle cloud and glow elements (clipped inside inner container) */}
        <div className="absolute inset-0 rounded-[26px] overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/40 dark:bg-blue-500/10 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-1/4 w-56 h-36 bg-blue-100/40 dark:bg-blue-400/5 rounded-full blur-xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Left Title & Description */}
          <div className="flex items-start sm:items-center gap-4 max-w-xl">
            {/* Calendar Icon Square Box */}
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#0050CB] flex items-center justify-center text-white shadow-md shadow-[#0050CB]/25 shrink-0">
              <div className="relative">
                <Calendar className="w-7 h-7 stroke-[2.2]" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-[28px] font-black text-[#000E28] dark:text-white tracking-tight leading-tight">
                My Child&apos;s Timetable
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed max-w-lg">
                View your child&apos;s weekly class schedule, subject-wise timetable, break and lunch hours, and stay updated with their daily routine.
              </p>
            </div>
          </div>

          {/* Right: Academic Year Pill Dropdown (Aligned & unclipped) */}
          <div className="self-start md:self-auto shrink-0 relative z-30 w-48">
            <button
              type="button"
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#07142F] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between hover:border-[#0050CB]/40 shadow-2xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#0050CB] shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-medium block leading-none">
                    Academic Year
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                    {selectedAcademicYear}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-1 transition-transform ${isYearDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isYearDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsYearDropdownOpen(false)} 
                />
                <div className="absolute left-0 right-0 mt-2 w-full rounded-2xl bg-white dark:bg-[#07142F] border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                  {getAcademicYearDisplayOptions().map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setSelectedAcademicYear(yr);
                        setIsYearDropdownOpen(false);
                        toast.success(`Academic Year: ${yr}`);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors ${
                        selectedAcademicYear === yr ? "text-[#0050CB] font-bold bg-blue-50/50 dark:bg-blue-900/20" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{yr}</span>
                      {selectedAcademicYear === yr && <Check className="w-3.5 h-3.5 text-[#0050CB]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>

      </div>

      {/* 3. Sub-Header Controls Bar (Floating White Card) */}
      <div className="bg-white dark:bg-[#07142F] rounded-2xl p-2.5 sm:p-3 border border-slate-100 dark:border-white/10 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Student Selector Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsChildDropdownOpen(!isChildDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200/60 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 dark:bg-slate-800 relative shrink-0">
              <Image
                src={child.studentPhoto || "/aarav-profile-avatar.png"}
                alt={child.firstName}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <div className="text-left leading-tight">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                {child.firstName} {child.lastName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                {child.grade} - {child.section}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {isChildDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsChildDropdownOpen(false)} 
              />
              <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#07142F] border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40">
                {children && children.length > 0 ? (
                  children.map((c: any) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => {
                        selectChild(c._id);
                        setIsChildDropdownOpen(false);
                        toast.success(`Viewing schedule for ${c.firstName}`);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center gap-2.5 ${
                        child._id === c._id ? "text-[#0050CB] font-bold bg-blue-50/50 dark:bg-blue-900/20" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 relative shrink-0">
                        <Image
                          src={c.studentPhoto || "/aarav-profile-avatar.png"}
                          alt={c.firstName}
                          fill
                          sizes="24px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold">{c.firstName} {c.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{c.grade} - {c.section}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-500">
                    {child.firstName} {child.lastName}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Middle: Day Selector Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          {days.map((d) => {
            const isActive = selectedDay === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setSelectedDay(d);
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#0050CB] text-white shadow-md shadow-[#0050CB]/25"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{d}</span>
                {d === "Monday" && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive ? "bg-white/20 text-white" : "bg-blue-50 text-[#0050CB] dark:bg-blue-900/30"
                  }`}>
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Print & Export Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintTimetable}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#0050CB]/50 text-slate-700 dark:text-slate-200 hover:text-[#0050CB] bg-white dark:bg-[#07142F] text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-blue-50/40 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Routine</span>
          </button>
          <button
            type="button"
            onClick={handleExportScheduleCSV}
            className="px-3.5 py-2 rounded-xl bg-[#0050CB] hover:bg-[#003EA3] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Schedule</span>
          </button>
        </div>

      </div>

      {/* 4. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Period Timeline (approx 66% width) */}
        <div id="printable-timetable-container" className="lg:col-span-8 bg-white dark:bg-[#07142F] rounded-3xl p-5 sm:p-7 border border-slate-100 dark:border-white/10 shadow-xs space-y-4">
          
          {/* Top Title Bar of Timetable */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0050CB] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#000E28] dark:text-white">
                {activeDayData.dateStr}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-[#EBF3FF] dark:bg-blue-950/40 text-[#0050CB] dark:text-[#38BDF8] text-[11px] font-bold px-3 py-1 rounded-full">
                {academicPeriods.length} Periods • {breakPeriods.length} Breaks
              </span>
            </div>
          </div>

          {/* Periods & Breaks List */}
          <div className="space-y-2.5">
            {activePeriods.map((period, index) => {
              const Icon = period.icon;

              // Break / Lunch Special Row Card
              if (period.isBreak) {
                const isLunch = period.breakType === "lunch";
                return (
                  <div
                    key={`break-${index}`}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLunch 
                        ? "bg-[#FFF9F5] dark:bg-orange-950/15 border-orange-200/80 dark:border-orange-900/30 hover:border-orange-300" 
                        : "bg-[#FFFDF5] dark:bg-amber-950/15 border-amber-200/80 dark:border-amber-900/30 hover:border-amber-300"
                    }`}
                  >
                    {/* Left: Break Label Badge + Time */}
                    <div className="flex items-center gap-3 shrink-0 sm:w-44">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${period.badgeBg} ${period.badgeColor}`}>
                        {isLunch ? "Lunch" : "Break"}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {period.time}
                        </p>
                        <p className={`text-[10px] font-semibold ${isLunch ? "text-orange-600 dark:text-orange-400" : "text-amber-600 dark:text-amber-400"}`}>
                          {isLunch ? "45 mins" : "15 mins"}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Break Icon + Title & Description */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${period.iconBg} ${period.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-extrabold text-[#000E28] dark:text-white leading-tight truncate">
                          {period.subject}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                          {period.topic}
                        </p>
                      </div>
                    </div>

                    {/* Right-Middle: Location */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0 sm:w-32">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isLunch ? "text-orange-500" : "text-amber-500"}`} />
                      <span className="truncate">{period.room}</span>
                    </div>

                    {/* Right: Status Pill (Exact match with class periods) */}
                    <div className="shrink-0 sm:w-28 flex items-center justify-start sm:justify-end">
                      {period.status === "Completed" && (
                        <span className="w-[108px] h-7 bg-[#EAFBF3] dark:bg-emerald-950/40 text-[#0E9F6E] dark:text-emerald-400 border border-[#BFF1D6] dark:border-emerald-800/40 text-xs font-bold rounded-full flex items-center justify-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 fill-[#0E9F6E] text-white stroke-[2] shrink-0" />
                          <span>Completed</span>
                        </span>
                      )}

                      {period.status === "Ongoing" && (
                        <span className="w-[108px] h-7 bg-[#FEF3C7] dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 border border-[#FDE68A] dark:border-amber-800/40 text-xs font-bold rounded-full flex items-center justify-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                          <span>Ongoing</span>
                        </span>
                      )}

                      {period.status === "Upcoming" && (
                        <span className="w-[108px] h-7 bg-[#EFF6FF] dark:bg-blue-950/40 text-[#3B82F6] dark:text-blue-400 border border-[#DBEAFE] dark:border-blue-800/40 text-xs font-bold rounded-full flex items-center justify-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                          <span>Upcoming</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              // Standard Academic Class Period
              return (
                <div
                  key={`period-${period.periodNum}`}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0A1A3A]/40 hover:bg-slate-50/80 dark:hover:bg-[#0A1A3A]/80 border border-slate-100/90 dark:border-white/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Left: Number Badge + Time */}
                  <div className="flex items-center gap-3 shrink-0 sm:w-44">
                    {/* Period Number Badge */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${period.badgeBg} ${period.badgeColor}`}>
                      {period.periodNum}
                    </div>

                    {/* Time & Period Label */}
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {period.time}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {period.periodLabel}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Subject Icon Box + Subject Title & Topic */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${period.iconBg} ${period.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-[#000E28] dark:text-white leading-tight truncate">
                        {period.subject}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                        {period.topic}
                      </p>
                    </div>
                  </div>

                  {/* Right-Middle: Room */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0 sm:w-32">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{period.room}</span>
                  </div>

                  {/* Right: Status Pill (Uniform width & perfectly column-aligned) */}
                  <div className="shrink-0 sm:w-28 flex items-center justify-start sm:justify-end">
                    {period.status === "Completed" && (
                      <span className="w-[108px] h-7 bg-[#EAFBF3] dark:bg-emerald-950/40 text-[#0E9F6E] dark:text-emerald-400 border border-[#BFF1D6] dark:border-emerald-800/40 text-xs font-bold rounded-full flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 fill-[#0E9F6E] text-white stroke-[2] shrink-0" />
                        <span>Completed</span>
                      </span>
                    )}

                    {period.status === "Ongoing" && (
                      <span className="w-[108px] h-7 bg-[#FEF3C7] dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 border border-[#FDE68A] dark:border-amber-800/40 text-xs font-bold rounded-full flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        <span>Ongoing</span>
                      </span>
                    )}

                    {period.status === "Upcoming" && (
                      <span className="w-[108px] h-7 bg-[#EFF6FF] dark:bg-blue-950/40 text-[#3B82F6] dark:text-blue-400 border border-[#DBEAFE] dark:border-blue-800/40 text-xs font-bold rounded-full flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        <span>Upcoming</span>
                      </span>
                    )}

                    {period.status === "Missed" && (
                      <span className="w-[108px] h-7 bg-[#FAF5FF] dark:bg-purple-950/40 text-[#7E3AF2] dark:text-purple-400 border border-[#E9D5FF] dark:border-purple-800/40 text-xs font-bold rounded-full flex items-center justify-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        <span>Missed</span>
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Bottom Note Alert */}
          <div className="rounded-2xl bg-[#F0F6FF] dark:bg-blue-950/20 border border-[#D9E8FF] dark:border-blue-900/30 p-3.5 flex items-center gap-2.5 text-xs text-[#1E429F] dark:text-blue-300 font-medium">
            <Info className="w-4 h-4 text-[#0050CB] dark:text-[#38BDF8] shrink-0" />
            <span>
              <strong>Note:</strong> Morning snack break is 15 mins (10:00 AM – 10:15 AM) and Lunch break is 45 mins (11:45 AM – 12:30 PM). Timetable may be subject to change per school activities.
            </span>
          </div>

        </div>

        {/* Right Column: Widgets (approx 34% width) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Today's Summary */}
          <div className="bg-white dark:bg-[#07142F] rounded-3xl p-5 border border-slate-100 dark:border-white/10 shadow-xs space-y-4">
            
            <div className="flex items-center gap-2 pb-1">
              <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0050CB] flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-extrabold text-[#000E28] dark:text-white">
                Today&apos;s Summary
              </h3>
            </div>

            {/* 4 Stat Tiles in 4-column row */}
            <div className="grid grid-cols-4 gap-2">
              
              {/* Completed */}
              <div className="bg-[#F0FDF4] dark:bg-emerald-950/20 border border-[#DCFCE7] dark:border-emerald-900/30 rounded-2xl p-2.5 text-center flex flex-col items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-1">
                  <Check className="w-3 h-3 text-[#0E9F6E]" />
                </div>
                <span className="text-base font-black text-slate-800 dark:text-white leading-tight">
                  {summaryCounts.completed}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  Completed
                </span>
              </div>

              {/* Ongoing */}
              <div className="bg-[#FEFCE8] dark:bg-amber-950/20 border border-[#FEF08A] dark:border-amber-900/30 rounded-2xl p-2.5 text-center flex flex-col items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-1">
                  <Clock className="w-3 h-3 text-[#D97706]" />
                </div>
                <span className="text-base font-black text-slate-800 dark:text-white leading-tight">
                  {summaryCounts.ongoing}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  Ongoing
                </span>
              </div>

              {/* Missed */}
              <div className="bg-[#FAF5FF] dark:bg-purple-950/20 border border-[#F3E8FF] dark:border-purple-900/30 rounded-2xl p-2.5 text-center flex flex-col items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-1">
                  <AlertCircle className="w-3 h-3 text-[#7E3AF2]" />
                </div>
                <span className="text-base font-black text-slate-800 dark:text-white leading-tight">
                  {summaryCounts.missed}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  Missed
                </span>
              </div>

              {/* Upcoming */}
              <div className="bg-[#EFF6FF] dark:bg-blue-950/20 border border-[#DBEAFE] dark:border-blue-900/30 rounded-2xl p-2.5 text-center flex flex-col items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-1">
                  <Calendar className="w-3 h-3 text-[#3B82F6]" />
                </div>
                <span className="text-base font-black text-slate-800 dark:text-white leading-tight">
                  {summaryCounts.upcoming}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  Upcoming
                </span>
              </div>

            </div>

          </div>

          {/* Card 2: Quick Actions */}
          <div className="bg-white dark:bg-[#07142F] rounded-3xl p-5 border border-slate-100 dark:border-white/10 shadow-xs space-y-3.5">
            
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0050CB] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 fill-[#0050CB] text-[#0050CB]" />
                </div>
                <h3 className="text-sm font-extrabold text-[#000E28] dark:text-white">
                  Quick Actions
                </h3>
              </div>

              <Link
                href="/parent/assessments"
                className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 6 Actions Grid (2 columns) */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* 1. Download Report Card */}
              <button
                type="button"
                onClick={async () => {
                  const targetId = child._id || 'child-1';
                  const safeName = `${child.firstName}_${child.lastName || ''}`.trim() || 'Student';
                  await downloadFile(
                    `/api/v1/students/${targetId}/report-card`,
                    `GGPS_ReportCard_${safeName}_2026-2027.pdf`
                  );
                }}
                className="bg-[#F0F7FF] dark:bg-blue-950/30 hover:bg-[#E2F0FE] dark:hover:bg-blue-900/40 border border-[#D8EAFD] dark:border-blue-800/30 rounded-2xl p-3 flex items-center gap-2.5 transition-colors cursor-pointer text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-blue-900/50 flex items-center justify-center text-[#0050CB] shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                  <Download className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#0050CB] dark:text-[#38BDF8] leading-tight">
                  Download Report Card
                </span>
              </button>

              {/* 2. View Assessments */}
              <Link
                href="/parent/assessments"
                className="bg-[#FAF5FF] dark:bg-purple-950/30 hover:bg-[#F3E8FF] dark:hover:bg-purple-900/40 border border-[#E9D5FF] dark:border-purple-800/30 rounded-2xl p-3 flex items-center gap-2.5 transition-colors cursor-pointer text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-purple-900/50 flex items-center justify-center text-[#9333EA] shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#9333EA] dark:text-purple-300 leading-tight">
                  View Assessments
                </span>
              </Link>

              {/* 3. View Marksheet */}
              <Link
                href="/parent/assessments"
                className="bg-[#F0FDF4] dark:bg-emerald-950/30 hover:bg-[#DCFCE7] dark:hover:bg-emerald-900/40 border border-[#BBF7D0] dark:border-emerald-800/30 rounded-2xl p-3 flex items-center gap-2.5 transition-colors cursor-pointer text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-emerald-900/50 flex items-center justify-center text-[#16A34A] shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#16A34A] dark:text-emerald-300 leading-tight">
                  View Marksheet
                </span>
              </Link>

              {/* 4. Upload Document */}
              <Link
                href="/parent/documents"
                className="bg-[#FFFBEB] dark:bg-amber-950/30 hover:bg-[#FEF3C7] dark:hover:bg-amber-900/40 border border-[#FDE68A] dark:border-amber-800/30 rounded-2xl p-3 flex items-center gap-2.5 transition-colors cursor-pointer text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-amber-900/50 flex items-center justify-center text-[#D97706] shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#D97706] dark:text-amber-300 leading-tight">
                  Upload Document
                </span>
              </Link>

              {/* 5. View Syllabus */}
              <button
                type="button"
                onClick={() => toast("Opening Academic Curriculum & Syllabus...")}
                className="bg-[#FDF2F8] dark:bg-pink-950/30 hover:bg-[#FCE7F3] dark:hover:bg-pink-900/40 border border-[#FBCFE8] dark:border-pink-800/30 rounded-2xl p-3 flex items-center gap-2.5 transition-colors cursor-pointer text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-pink-900/50 flex items-center justify-center text-[#DB2777] shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#DB2777] dark:text-pink-300 leading-tight">
                  View Syllabus
                </span>
              </button>

              {/* 6. Contact Teacher */}
              <Link
                href="/parent/messages"
                className="bg-[#F5F3FF] dark:bg-indigo-950/30 hover:bg-[#EDE9FE] dark:hover:bg-indigo-900/40 border border-[#DDD6FE] dark:border-indigo-800/30 rounded-2xl p-3 flex items-center gap-2.5 transition-colors cursor-pointer text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-indigo-900/50 flex items-center justify-center text-[#7C3AED] shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#7C3AED] dark:text-indigo-300 leading-tight">
                  Contact Teacher
                </span>
              </Link>

            </div>

          </div>

          {/* Card 3: Small Steps Big Dreams Quote Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F0F7FF] via-[#EBF4FE] to-[#E3F0FF] dark:from-[#091E42] dark:via-[#0A2554] dark:to-[#091E42] border border-[#D9EAFF] dark:border-blue-900/30 p-5 flex items-center justify-between">
            
            <div className="space-y-1 relative z-10 max-w-[190px]">
              <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-1 text-amber-500">
                <Lightbulb className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
              <h4 className="text-sm font-extrabold text-[#000E28] dark:text-white leading-tight">
                Small Steps
              </h4>
              <p className="text-sm font-black text-[#0050CB] dark:text-[#38BDF8] flex items-center gap-1 leading-tight">
                <span>Big Dreams</span>
                <span className="text-rose-500">♥</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic pt-1">
                Stay curious.
              </p>
            </div>

            {/* Plant on Books Illustration */}
            <div className="relative w-28 h-20 shrink-0 pointer-events-none select-none">
              <Image
                src="/timetable-plant-books.png"
                alt="Plant on books"
                fill
                sizes="112px"
                className="object-contain object-right"
              />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
