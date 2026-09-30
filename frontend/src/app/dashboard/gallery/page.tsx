"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Camera,
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Search,
  Users,
  Eye,
  Download,
  ChevronRight,
  Home,
  Filter,
  X,
  Share2,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";

interface AlbumItem {
  id: string;
  _id?: string;
  title: string;
  category: "Sports" | "Cultural" | "Academic" | "Celebrations" | "Campus Life";
  date: string;
  visibility: "All" | "Parents" | "Staff";
  description: string;
  coverImage: string;
  photos: string[];
}

const INITIAL_ALBUMS: AlbumItem[] = [
  {
    id: "album-1",
    title: "Annual Sports Meet 2026",
    category: "Sports",
    date: "2026-11-15",
    visibility: "All",
    description: "Athletics track races, long jump events, obstacle relays and inter-house championship prize distribution ceremony.",
    coverImage: "/sports-day-track.jpg",
    photos: [
      "/sports-day-track.jpg",
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    id: "album-2",
    title: "Annual Day Cultural Gala",
    category: "Cultural",
    date: "2026-12-20",
    visibility: "All",
    description: "Spectacular stage performances, classical Indian folk dance, student musical choir and dramatic skits in the main auditorium.",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
    photos: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    id: "album-3",
    title: "Science & Innovation Fair",
    category: "Academic",
    date: "2027-01-10",
    visibility: "All",
    description: "Working robotics models, solar energy prototypes, chemistry experiments, and coding projects exhibited by middle and high school students.",
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80",
    photos: [
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    id: "album-4",
    title: "Republic Day Flag Hoisting",
    category: "Celebrations",
    date: "2027-01-26",
    visibility: "All",
    description: "National flag hoisting ceremony, NCC student battalion march past, patriotic songs and speech addresses honoring the Constitution.",
    coverImage: "/school-campus.jpg",
    photos: [
      "/school-campus.jpg",
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    id: "album-5",
    title: "Teacher's Day Tribute",
    category: "Campus Life",
    date: "2026-09-05",
    visibility: "Staff",
    description: "Student council organized appreciation banquet, comedy skits, poetry recitals and faculty felicitations in the auditorium.",
    coverImage: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80",
    photos: [
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    id: "album-6",
    title: "Art & Craft Carnival",
    category: "Campus Life",
    date: "2026-10-18",
    visibility: "Parents",
    description: "Water color paintings, clay pottery, origami sculptures and creative recycled handicraft gallery presented by junior school students.",
    coverImage: "https://images.unsplash.com/photo-1460518451282-474b15028898?auto=format&fit=crop&w=1000&q=80",
    photos: [
      "https://images.unsplash.com/photo-1460518451282-474b15028898?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    id: "album-7",
    title: "Parent Teacher Consultations",
    category: "Academic",
    date: "2027-02-25",
    visibility: "Parents",
    description: "Mid-term academic report reviews, personalized counseling sessions, and student development dialogue across classrooms.",
    coverImage: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80",
    photos: [
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80",
    ],
  },
];

export default function GalleryPage() {
  const [albums, setAlbums] = useState<AlbumItem[]>(INITIAL_ALBUMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedVisibility, setSelectedVisibility] = useState<string>("All");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<AlbumItem | null>(null);
  const [viewingAlbum, setViewingAlbum] = useState<AlbumItem | null>(null);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number>(0);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form State
  const [formValues, setFormValues] = useState({
    title: "",
    category: "Sports" as AlbumItem["category"],
    date: new Date().toISOString().split("T")[0],
    visibility: "All" as AlbumItem["visibility"],
    description: "",
    coverImage: "/sports-day-track.jpg",
    mediaUrls: "",
  });

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ggps_school_gallery_albums");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAlbums(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveAlbums = (updated: AlbumItem[]) => {
    setAlbums(updated);
    try {
      localStorage.setItem("ggps_school_gallery_albums", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleOpenCreate = () => {
    setEditingAlbum(null);
    setFormValues({
      title: "",
      category: "Sports",
      date: new Date().toISOString().split("T")[0],
      visibility: "All",
      description: "",
      coverImage: "/sports-day-track.jpg",
      mediaUrls: "",
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (album: AlbumItem) => {
    setEditingAlbum(album);
    setFormValues({
      title: album.title,
      category: album.category,
      date: album.date,
      visibility: album.visibility,
      description: album.description,
      coverImage: album.coverImage,
      mediaUrls: album.photos.join(", "),
    });
    setIsCreateOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteAlbum = (id: string) => {
    if (confirm("Are you sure you want to delete this album?")) {
      const updated = albums.filter((a) => a.id !== id && a._id !== id);
      saveAlbums(updated);
      toast.success("Album deleted successfully");
      setActiveMenuId(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.title.trim()) {
      toast.error("Please enter an album title");
      return;
    }

    const photosList = formValues.mediaUrls
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const photos = photosList.length > 0 ? photosList : [formValues.coverImage];

    if (editingAlbum) {
      const updated = albums.map((item) => {
        if (item.id === editingAlbum.id || (editingAlbum._id && item._id === editingAlbum._id)) {
          return {
            ...item,
            title: formValues.title,
            category: formValues.category,
            date: formValues.date,
            visibility: formValues.visibility,
            description: formValues.description,
            coverImage: formValues.coverImage,
            photos,
          };
        }
        return item;
      });
      saveAlbums(updated);
      toast.success("Album updated successfully!");
    } else {
      const newAlbum: AlbumItem = {
        id: `album-${Date.now()}`,
        title: formValues.title,
        category: formValues.category,
        date: formValues.date,
        visibility: formValues.visibility,
        description: formValues.description,
        coverImage: formValues.coverImage,
        photos,
      };
      saveAlbums([newAlbum, ...albums]);
      toast.success("New album created successfully!");
    }
    setIsCreateOpen(false);
  };

  const openAlbumViewer = (album: AlbumItem, initialIndex = 0) => {
    setViewingAlbum(album);
    setLightboxPhotoIndex(initialIndex);
  };

  // Filter albums
  const filteredAlbums = albums.filter((album) => {
    const matchesSearch =
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || album.category === selectedCategory;
    const matchesVisibility = selectedVisibility === "All" || album.visibility === selectedVisibility;

    return matchesSearch && matchesCategory && matchesVisibility;
  });

  const totalPhotosCount = albums.reduce((acc, curr) => acc + (curr.photos?.length || 1), 0);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Sports":
        return "bg-[#E5EEFF] text-[#0050CB]";
      case "Cultural":
        return "bg-purple-100 text-purple-700";
      case "Academic":
        return "bg-sky-100 text-sky-700";
      case "Celebrations":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] dark:bg-[#000a1f] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center text-xs font-medium text-slate-500 space-x-1.5">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span className="hover:text-slate-700 cursor-pointer">Dashboard</span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="hover:text-slate-700 cursor-pointer">Events &amp; Gallery</span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-[#0050CB] font-bold">Photo Gallery</span>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 flex items-center justify-center text-[#0050CB] dark:text-blue-400 shadow-inner flex-shrink-0">
            <Camera className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Photo &amp; Video Gallery
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-normal">
              Preserve and showcase memorable campus events, sports meets, and student celebrations.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="z-10 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => toast.success("Gallery link copied to clipboard!")}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Share2 className="w-4 h-4 text-[#0050CB]" />
            <span>Share Gallery</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="bg-[#0050CB] hover:bg-[#003ea1] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Album</span>
          </button>
        </div>

        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-50/70 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Albums */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-blue-50/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E5EEFF] dark:bg-blue-950/60 flex items-center justify-center text-[#0050CB] dark:text-blue-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Albums</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {albums.length}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                ↑ 3 new this term
              </p>
            </div>
          </div>
        </div>

        {/* Photos & Media */}
        <div className="bg-[#F0FDF4] dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-100/70 dark:border-emerald-900/30 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] dark:bg-emerald-900/40 flex items-center justify-center text-[#16A34A] dark:text-emerald-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Photos &amp; Media</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {totalPhotosCount * 6 + 18}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                ↑ 45 uploaded recently
              </p>
            </div>
          </div>
        </div>

        {/* Public & Parent Access */}
        <div className="bg-[#FAF5FF] dark:bg-purple-950/20 rounded-2xl p-4 border border-purple-100/70 dark:border-purple-900/30 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] dark:bg-purple-900/40 flex items-center justify-center text-[#9333EA] dark:text-purple-400">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Parent Visible</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {albums.filter((a) => a.visibility === "All" || a.visibility === "Parents").length}
              </p>
              <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                92% public access
              </p>
            </div>
          </div>
        </div>

        {/* Video Highlights */}
        <div className="bg-[#FFFBEB] dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-100/70 dark:border-amber-900/30 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] dark:bg-amber-900/40 flex items-center justify-center text-[#D97706] dark:text-amber-400">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Video Highlights</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                12
              </p>
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                Full 4K HD Recaps
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search albums by name, event or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0050CB] text-slate-800 dark:text-white"
          />
        </div>

        {/* Dropdowns & Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 py-2 px-3 rounded-xl cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
          >
            <option value="All">All Categories</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
            <option value="Academic">Academic</option>
            <option value="Celebrations">Celebrations</option>
            <option value="Campus Life">Campus Life</option>
          </select>

          {/* Visibility Dropdown */}
          <select
            value={selectedVisibility}
            onChange={(e) => setSelectedVisibility(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 py-2 px-3 rounded-xl cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
          >
            <option value="All">All Visibility</option>
            <option value="All">Parents &amp; Students</option>
            <option value="Staff">Staff Only</option>
            <option value="Parents">Parents Only</option>
          </select>

          {/* Reset filter */}
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedVisibility("All");
              setSearchQuery("");
              toast.success("Filters reset");
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Photo Albums Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredAlbums.map((album) => (
          <div
            key={album.id || album._id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group relative"
          >
            {/* Cover image banner */}
            <div
              onClick={() => openAlbumViewer(album)}
              className="relative h-44 w-full overflow-hidden bg-slate-100 cursor-pointer"
            >
              <Image
                src={album.coverImage || "/sports-day-track.jpg"}
                alt={album.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />

              {/* Photo count pill */}
              <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md rounded-xl px-2.5 py-1 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                <ImageIcon className="w-3.5 h-3.5 text-blue-300" />
                <span>{(album.photos?.length || 1) * 6} Photos</span>
              </div>

              {/* Category Badge */}
              <div className="absolute top-2.5 right-2.5">
                <span
                  className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm ${getCategoryBadge(
                    album.category
                  )}`}
                >
                  {album.category}
                </span>
              </div>
            </div>

            {/* Album details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3
                  onClick={() => openAlbumViewer(album)}
                  className="font-bold text-slate-900 dark:text-white text-[15px] truncate cursor-pointer hover:text-[#0050CB] transition-colors"
                  title={album.title}
                >
                  {album.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {album.description}
                </p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(album.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{album.visibility}</span>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => openAlbumViewer(album)}
                  className="text-xs font-bold text-[#0050CB] dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Album</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-1 relative">
                  <button
                    onClick={() => openAlbumViewer(album)}
                    className="p-1 hover:text-[#0050CB] hover:bg-blue-50 rounded-md transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(album)}
                    className="p-1 hover:text-[#0050CB] hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlbum(album.id || album._id || "")}
                    className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Special "Upload / Create New Album" Card */}
        <div className="bg-gradient-to-b from-white to-[#F6F9FF] dark:from-slate-900 dark:to-blue-950/20 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900/50 hover:border-[#0050CB] transition-all p-6 flex flex-col items-center justify-center text-center relative group min-h-[300px]">
          <div
            onClick={handleOpenCreate}
            className="w-14 h-14 rounded-full bg-[#E5EEFF] dark:bg-blue-950/80 text-[#0050CB] dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#0050CB] group-hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Create New Album</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[210px] mt-1.5 mb-5 leading-relaxed">
            Upload school event photos, tag classes and publish to student &amp; parent feeds.
          </p>
          <button
            onClick={handleOpenCreate}
            className="bg-[#0050CB] hover:bg-[#003ea1] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Upload Photos</span>
          </button>
        </div>
      </div>

      {/* Lightbox / Photo Viewer Modal */}
      {viewingAlbum && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10 pb-4 border-b border-white/10">
            <div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${getCategoryBadge(
                  viewingAlbum.category
                )}`}
              >
                {viewingAlbum.category}
              </span>
              <h2 className="text-lg sm:text-xl font-black mt-1">{viewingAlbum.title}</h2>
              <p className="text-xs text-white/70">{viewingAlbum.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toast.success("Photo downloaded successfully")}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button
                onClick={() => setViewingAlbum(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Photo Showcase */}
          <div className="relative flex-1 my-4 flex items-center justify-center">
            <div className="relative w-full max-w-4xl h-[60vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src={
                  viewingAlbum.photos[lightboxPhotoIndex] ||
                  viewingAlbum.coverImage ||
                  "/sports-day-track.jpg"
                }
                alt={viewingAlbum.title}
                fill
                sizes="(max-width: 1200px) 100vw, 1000px"
                className="object-contain bg-black/40"
              />
            </div>
          </div>

          {/* Filmstrip Thumbnails */}
          <div className="flex items-center justify-center gap-3 overflow-x-auto py-2">
            {viewingAlbum.photos.map((photoUrl, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxPhotoIndex(idx)}
                className={`relative w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  lightboxPhotoIndex === idx
                    ? "border-[#0050CB] scale-105 shadow-md shadow-blue-500/50"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={photoUrl} alt="Thumbnail" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Album Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingAlbum ? "Edit Album" : "Create New Album"}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Album Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Meet 2026"
                  value={formValues.title}
                  onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formValues.category}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        category: e.target.value as AlbumItem["category"],
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                  >
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Academic">Academic</option>
                    <option value="Celebrations">Celebrations</option>
                    <option value="Campus Life">Campus Life</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formValues.date}
                    onChange={(e) => setFormValues({ ...formValues, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Visibility
                  </label>
                  <select
                    value={formValues.visibility}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        visibility: e.target.value as AlbumItem["visibility"],
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                  >
                    <option value="All">All (Public)</option>
                    <option value="Parents">Parents Only</option>
                    <option value="Staff">Staff Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cover Image
                </label>
                <select
                  value={formValues.coverImage}
                  onChange={(e) => setFormValues({ ...formValues, coverImage: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                >
                  <option value="/sports-day-track.jpg">Sports Ground Track</option>
                  <option value="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80">
                    Annual Day Stage
                  </option>
                  <option value="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80">
                    Science &amp; Robotics Lab
                  </option>
                  <option value="/school-campus.jpg">Campus Flag Ceremony</option>
                  <option value="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80">
                    Teacher&apos;s Day Board
                  </option>
                  <option value="https://images.unsplash.com/photo-1460518451282-474b15028898?auto=format&fit=crop&w=1000&q=80">
                    Art Carnival
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Photos (comma-separated URLs)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://images.unsplash.com/..., https://..."
                  value={formValues.mediaUrls}
                  onChange={(e) => setFormValues({ ...formValues, mediaUrls: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief note about the event, participants and highlights..."
                  value={formValues.description}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050CB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0050CB] hover:bg-[#003ea1] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  {editingAlbum ? "Save Album" : "Create Album"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
