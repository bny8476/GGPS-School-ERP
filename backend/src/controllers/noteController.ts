import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Note, { INote } from '../models/Note';

// Initial Seeded Notes matching institutional needs
const INITIAL_NOTES: any[] = [
  {
    _id: 'note_1',
    id: 'note_1',
    title: 'Executive Board Resolution #BR-2026-08: STEAM & AI Innovation Lab',
    content: `## Executive Resolution & Capital Allocation

The Governing Board of **GGPS School** hereby ratifies the capital budget allocation for the Phase 2 STEAM Innovation Centre.

### Key Resolution Directives:
* **Approved Grant**: $125,000 from the 2026 Development Reserve.
* **Procurement Lead**: Chief Finance Officer (Robert Taylor) & IT Directorate.
* **Target Delivery**: Prior to Term 2 orientation (November 15, 2026).

| Equipment / Asset | Units | Department | Projected Cost |
| :--- | :--- | :--- | :--- |
| Advanced Robotics Kits | 30 | Secondary Science | $35,000 |
| High-Performance Workstations | 25 | Computer Science | $52,000 |
| 3D Prototyping Stations | 4 | Design Tech | $18,000 |
| Teacher Certification | - | Faculty Training | $20,000 |

### Confidentiality Clause:
> *This resolution is classified as Executive Board Only. Public dissemination is restricted until formal faculty announcement on October 1st.*`,
    category: 'Meeting Minutes',
    privacy: 'private',
    authorName: 'Super Admin',
    authorRole: 'Executive Administration',
    isPinned: true,
    isArchived: false,
    tags: ['Board Resolution', 'Finance', 'STEAM'],
    color: '#FFFFFF',
    comments: [
      {
        id: 'c1',
        authorName: 'Dr. Marcus Vance',
        authorRole: 'Principal',
        text: 'The equipment specifications have been reviewed by Department Heads and fully endorsed.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    _id: 'note_2',
    id: 'note_2',
    title: 'Kindergarten Curriculum Harmonization Plan: Pre-KG, LKG & UKG',
    content: `## Early Years Foundation Stage (EYFS) Moderation Framework

Coordination memo regarding curriculum alignment between Pre-KG, LKG, and UKG early literacy and sensory learning.

### Objectives:
- [x] Standardize phonics pronunciation and sound-play rubrics for Term 1.
- [x] Integrate sensory motor-skills activities and Montessori math trays.
- [ ] Finalize developmental assessment milestones for UKG (Target: Oct 15).
- [ ] Circulate parental early childhood milestone consultation booklet.

### Assigned Academic Mentors:
* **Early Literacy & Phonics**: Sarah Jenkins (Head of Dept)
* **Numeracy & Fine Motor**: David Chen (Pre-KG Phonics Lead)
* **General Awareness & Storytelling**: Elena Rostova (Dean of Academics)

> **Mandatory Note**: Class advisors must submit term completion logs by Friday 4:00 PM.`,
    category: 'Curriculum',
    privacy: 'executive_board',
    authorName: 'Sarah Jenkins',
    authorRole: 'Head of Early Years',
    isPinned: true,
    isArchived: false,
    tags: ['Curriculum', 'Kindergarten', 'EYFS'],
    color: '#FFFFFF',
    comments: [
      {
        id: 'c2',
        authorName: 'Elena Rostova',
        authorRole: 'Dean of Students',
        text: 'Parent consultation dates will be synchronized with the ERP calendar tomorrow morning.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    _id: 'note_3',
    id: 'note_3',
    title: 'Campus Safety & Fire Evacuation Protocols: 2026 Audit Standard',
    content: `## Official Institutional Safety Directive

Notice to all teaching faculty, facility staff, and administrative personnel regarding emergency preparedness.

### Assembly Stations:
1. **Primary Wing**: North Courtyard (Station Alpha)
2. **Secondary Wing & Labs**: Central Sports Pavilion (Station Beta)
3. **Dining & Hostel**: South Perimeter Green (Station Gamma)

### Staff Responsibilities:
* Homeroom proctors must carry class physical attendance dossiers.
* Lab teachers must activate emergency main gas shut-off valves immediately.
* Floor marshals must verify restrooms and stairwells before evacuating.

> *Inspection scheduled with City Fire Safety Bureau next Tuesday at 10:30 AM.*`,
    category: 'Safety',
    privacy: 'public_staff',
    authorName: 'Michael Chang',
    authorRole: 'Head of Campus Safety',
    isPinned: false,
    isArchived: false,
    tags: ['Safety', 'Compliance', 'All Staff'],
    color: '#FFFFFF',
    comments: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
];

let inMemoryNotes: any[] = [...INITIAL_NOTES];

// @desc    Get all notes
// @route   GET /api/notes
export const getNotes = async (req: Request, res: Response) => {
  try {
    const { category, privacy, search } = req.query;

    let notes: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        let filter: any = {};
        if (category && category !== 'All Categories') filter.category = category;
        if (privacy && privacy !== 'All Privacy') filter.privacy = privacy;
        if (search) {
          const searchRegex = new RegExp(String(search), 'i');
          filter.$or = [
            { title: searchRegex },
            { content: searchRegex },
            { tags: searchRegex },
          ];
        }
        notes = await Note.find(filter).sort({ isPinned: -1, createdAt: -1 });
      } catch (dbErr) {
        notes = inMemoryNotes;
      }
    } else {
      notes = inMemoryNotes;
    }

    if (!notes || notes.length === 0) {
      notes = inMemoryNotes;
    }

    // Apply in-memory filtering if needed
    let filtered = [...notes];
    if (category && category !== 'All Categories') {
      filtered = filtered.filter((n) => n.category?.toLowerCase() === String(category).toLowerCase());
    }
    if (privacy && privacy !== 'All Privacy') {
      filtered = filtered.filter((n) => n.privacy?.toLowerCase() === String(privacy).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q) ||
          (n.tags && n.tags.some((tag: string) => tag.toLowerCase().includes(q)))
      );
    }

    // Sort: pinned first, then newest
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new note
// @route   POST /api/notes
export const createNote = async (req: Request, res: Response) => {
  try {
    const { title, content, category = 'General', privacy = 'private', isPinned = false, tags = [], color = '#FFFFFF' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const userId = req.user?.id || new mongoose.Types.ObjectId();

    const newNoteData: any = {
      title,
      content,
      category,
      privacy,
      author: userId,
      authorName: 'Super Admin',
      authorRole: 'Executive Administration',
      isPinned: Boolean(isPinned),
      isArchived: false,
      tags: Array.isArray(tags) ? tags : [tags],
      color,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let createdNote = null;
    if (mongoose.connection.readyState === 1) {
      try {
        createdNote = await Note.create(newNoteData);
      } catch (dbErr) {
        createdNote = { ...newNoteData, _id: `note_${Date.now()}`, id: `note_${Date.now()}` };
        inMemoryNotes.unshift(createdNote);
      }
    } else {
      createdNote = { ...newNoteData, _id: `note_${Date.now()}`, id: `note_${Date.now()}` };
      inMemoryNotes.unshift(createdNote);
    }

    return res.status(201).json({ success: true, data: createdNote });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing note
// @route   PUT /api/notes/:id
export const updateNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, category, privacy, isPinned, tags, color } = req.body;

    const updates: any = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (category !== undefined) updates.category = category;
    if (privacy !== undefined) updates.privacy = privacy;
    if (isPinned !== undefined) updates.isPinned = isPinned;
    if (tags !== undefined) updates.tags = tags;
    if (color !== undefined) updates.color = color;

    let updatedNote = null;
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      try {
        updatedNote = await Note.findByIdAndUpdate(id, updates, { new: true });
      } catch (e) {}
    }

    if (!updatedNote) {
      const idx = inMemoryNotes.findIndex((n) => n._id === id || n.id === id);
      if (idx !== -1) {
        inMemoryNotes[idx] = { ...inMemoryNotes[idx], ...updates };
        updatedNote = inMemoryNotes[idx];
      }
    }

    if (!updatedNote) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    return res.json({ success: true, data: updatedNote });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle pin status
// @route   PATCH /api/notes/:id/pin
export const togglePinNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let targetNote = inMemoryNotes.find((n) => n._id === id || n.id === id);
    let newPinStatus = targetNote ? !targetNote.isPinned : true;

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      try {
        const dbNote = await Note.findById(id);
        if (dbNote) {
          dbNote.isPinned = !dbNote.isPinned;
          await dbNote.save();
          return res.json({ success: true, data: dbNote });
        }
      } catch (e) {}
    }

    if (targetNote) {
      targetNote.isPinned = newPinStatus;
      return res.json({ success: true, data: targetNote });
    }

    return res.status(404).json({ success: false, message: 'Note not found' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a collaborative review comment to a note
// @route   POST /api/notes/:id/comments
export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text, authorName = 'Dr. Marcus Vance', authorRole = 'Principal' } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const comment = {
      id: `c_${Date.now()}`,
      authorName,
      authorRole,
      text: text.trim(),
      createdAt: new Date(),
    };

    let updatedNote = null;
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      try {
        updatedNote = await Note.findByIdAndUpdate(
          id,
          { $push: { comments: comment } },
          { new: true }
        );
      } catch (e) {}
    }

    if (!updatedNote) {
      const idx = inMemoryNotes.findIndex((n) => n._id === id || n.id === id);
      if (idx !== -1) {
        if (!inMemoryNotes[idx].comments) inMemoryNotes[idx].comments = [];
        inMemoryNotes[idx].comments.push(comment);
        updatedNote = inMemoryNotes[idx];
      }
    }

    if (!updatedNote) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    return res.status(201).json({ success: true, data: updatedNote, comment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      try {
        await Note.findByIdAndDelete(id);
      } catch (e) {}
    }

    inMemoryNotes = inMemoryNotes.filter((n) => n._id !== id && n.id !== id);
    return res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
