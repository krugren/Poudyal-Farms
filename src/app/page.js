export const revalidate = 60 // ISR: rebuild at most once per minute

import prisma from '@/lib/prisma';
import HomeClient from './HomeClient';

export const metadata = {
  title: 'Poudhyal Farms — Organic Farmstay in Sikkim',
  description: 'Experience authentic Sikkimese farm life with panoramic Kanchenjunga views, organic cuisine, and warm hospitality at Poudhyal Farms, Gangtok.',
  keywords: ['Poudhyal Farms', 'Sikkim farmstay', 'organic farm', 'Gangtok homestay', 'Kanchenjunga views'],
};

export const revalidate = 300; // ISR: 5-min cache

export default async function HomePage() {
  const [content, activities, settings, feedback] = await Promise.all([
    prisma.siteContent.findMany({ where: { page: 'home' }, orderBy: { sortOrder: 'asc' } }),
    prisma.activity.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.siteSetting.findMany(),
    prisma.feedback.findMany({ where: { isVisible: true }, orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, name: true, rating: true, comment: true, avatarColor: true, createdAt: true } }),
  ]);

  // Group content by section
  const sections = {};
  for (const row of content) {
    if (!sections[row.section]) sections[row.section] = {};
    sections[row.section][row.key] = row.value;
  }

  // Settings as object
  const settingsObj = {};
  for (const s of settings) settingsObj[s.key] = s.value;

  return <HomeClient sections={sections} activities={activities} settings={settingsObj} recentFeedback={feedback} />;
}
