"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Camera, ArrowRight, X, Eye } from "lucide-react";
import { getApiBaseUrl } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface GalleryPhoto {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
}

export default function GalleryPage() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    async function loadGallery() {
      try {
        const apiBase = getApiBaseUrl();
        const res = await fetch(`${apiBase}/api/v1/gallery`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPhotos(data);
          } else {
            // Curated initial campus gallery
            setPhotos([
              {
                _id: "gal_1",
                title: "Smart Kindergarten Classroom",
                category: "Classrooms",
                imageUrl: "/mother-daughter-study.png",
                description: "Child-friendly collaborative seating, interactive touchscreens, and experiential sensory learning stations.",
              },
              {
                _id: "gal_2",
                title: "Happy Learners at GGPS Campus",
                category: "Campus Life",
                imageUrl: "/hero-banner-light.jpg",
                description: "Nurturing early education with joyful social interaction and guidance from certified educators.",
              },
              {
                _id: "gal_3",
                title: "Active Play & Gross Motor Zone",
                category: "Play & Sports",
                imageUrl: "/hero-banner.png",
                description: "Safe soft-turf outdoor playground equipped with modern motor-skill climbing structures and balance beams.",
              },
              {
                _id: "gal_4",
                title: "STEM Discovery & Creative Arts Hub",
                category: "Activities",
                imageUrl: "/hero-banner-dark.jpg",
                description: "Hands-on painting, block construction, and junior scientific inquiry fostering imagination.",
              },
            ]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const filteredPhotos = photos.filter((p) => {
    return selectedCategory === "ALL" || p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#000a1f] text-[#000E28] dark:text-slate-100 font-sans selection:bg-[#0050CB]/20 selection:text-[#0050CB] transition-colors duration-200">
      
      {/* HERO SECTION */}
      <section className="relative pt-28 pb-12 sm:pt-36 sm:pb-16 overflow-hidden border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white via-[#F6F8FC] to-[#E5EEFF]/30 dark:from-[#000E28] dark:via-[#000a1f] dark:to-[#050E22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/30 border border-blue-200 dark:border-blue-900 text-[#0050CB] dark:text-[#38BDF8] text-xs font-bold mb-4">
              <Camera className="w-3.5 h-3.5 text-[#FF690C]" />
              <span>Life at GGPS School</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#000E28] dark:text-white tracking-tight leading-tight mb-4">
              Campus <span className="text-[#0050CB] dark:text-[#38BDF8]">Photo Gallery</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Take a visual tour of our modern kindergarten classrooms, vibrant activity zones, and joyful student moments.
            </p>
          </div>
        </div>
      </section>

      {/* GALLERY GRID */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* CATEGORY FILTER PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
          {["ALL", "Classrooms", "Campus Life", "Play & Sports", "Activities"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#0050CB] text-white shadow-sm"
                  : "bg-white dark:bg-[#001438] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat === "ALL" ? "All Photos" : cat}
            </button>
          ))}
        </div>

        {/* PHOTO MASONRY / GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No photos found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo._id}
                onClick={() => setActivePhoto(photo)}
                className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#001438] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white">
                      <Eye className="w-5 h-5" />
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0050CB] dark:text-[#38BDF8]">
                    {photo.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#000E28] dark:text-white line-clamp-1">
                    {photo.title}
                  </h3>
                  {photo.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {photo.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOTTOM ADMISSIONS CTA */}
        <div className="mt-14 p-8 rounded-3xl bg-linear-to-r from-[#000E28] via-[#002772] to-[#0050CB] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-xl font-black">Experience Our Campus in Person</h3>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              Photographs capture only a glimpse. Schedule a personal guided tour with our admissions team.
            </p>
          </div>
          <Link
            href="/enquire"
            className="px-6 py-3 rounded-full bg-white text-[#0050CB] font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors shrink-0 shadow-md"
          >
            ✦ Enquire About Admission →
          </Link>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="relative bg-white dark:bg-[#000E28] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-80 sm:h-96 w-full bg-black">
              <Image
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-contain"
              />
            </div>

            <div className="p-5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0050CB]">
                {activePhoto.category}
              </span>
              <h3 className="text-base font-bold text-[#000E28] dark:text-white">
                {activePhoto.title}
              </h3>
              {activePhoto.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {activePhoto.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
