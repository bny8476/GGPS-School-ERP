import { Request, Response } from 'express';
import SystemSettings from '../models/Settings';

export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({
        schoolName: 'GGPS School',
        schoolTagline: 'Learn • Grow • Succeed',
        schoolEmail: 'admissions@ggps.edu',
        schoolPhone: '+91 98765 43210',
        schoolAddress: '123 Education Lane, Knowledge Park, Tamil Nadu, India',
        academicYear: '2026-2027',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        language: 'en',
        logoUrl: '/logo.png',
        website: 'https://ggps-school.edu',
        primaryColor: '#0050CB',
        secondaryColor: '#FF690C',
        principalSignatureUrl: '/signature-principal.png',
      });
    }
    return res.json({ success: true, data: settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSchoolBranding = async (req: Request, res: Response) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({
        schoolName: 'GGPS School',
        schoolTagline: 'Learn • Grow • Succeed',
        schoolEmail: 'admissions@ggps.edu',
        schoolPhone: '+91 98765 43210',
        schoolAddress: '123 Education Lane, Knowledge Park, Tamil Nadu, India',
        academicYear: '2026-2027',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        language: 'en',
        logoUrl: '/logo.png',
        website: 'https://ggps-school.edu',
        primaryColor: '#0050CB',
        secondaryColor: '#FF690C',
        principalSignatureUrl: '/signature-principal.png',
      });
    }

    return res.json({
      success: true,
      data: {
        schoolName: settings.schoolName || 'GGPS School',
        tagline: settings.schoolTagline || 'Learn • Grow • Succeed',
        logoUrl: settings.logoUrl || '/logo.png',
        address: settings.schoolAddress || '123 Education Lane, Knowledge Park, Tamil Nadu, India',
        phone: settings.schoolPhone || '+91 98765 43210',
        email: settings.schoolEmail || 'admissions@ggps.edu',
        website: settings.website || 'https://ggps-school.edu',
        primaryColor: settings.primaryColor || '#0050CB',
        secondaryColor: settings.secondaryColor || '#FF690C',
        principalSignatureUrl: settings.principalSignatureUrl || '/signature-principal.png',
        academicYear: settings.academicYear || '2026-2027',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    let settings = await SystemSettings.findOne();

    if (settings) {
      Object.assign(settings, req.body, { updatedBy: userId });
      await settings.save();
    } else {
      settings = await SystemSettings.create({ ...req.body, updatedBy: userId });
    }

    return res.json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
