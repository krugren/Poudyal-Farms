import prisma from '@/lib/prisma';
import AboutClient from './AboutClient';

export const metadata = {
  title: 'About — Poudhyal Farms | Our Story & Travel Guide',
  description: 'Learn about our three-generation organic farm in Sikkim. Discover travel guides, activities, and nearby attractions for your visit.',
};

export const revalidate = 300;

export default async function AboutPage() {
  const [content, activities, guides, settings] = await Promise.all([
    prisma.siteContent.findMany({ where: { page: 'about' }, orderBy: { sortOrder: 'asc' } }),
    prisma.activity.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.travelGuide.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.siteSetting.findMany(),
  ]);

  const sections = {};
  for (const row of content) {
    if (!sections[row.section]) sections[row.section] = {};
    sections[row.section][row.key] = row.value;
  }

  const settingsObj = {};
  for (const s of settings) settingsObj[s.key] = s.value;

  const guidesData = guides.map(g => ({ ...g, entries: JSON.parse(g.entries || '[]') }));

  return <AboutClient sections={sections} activities={activities} guides={guidesData} settings={settingsObj} />;
}
