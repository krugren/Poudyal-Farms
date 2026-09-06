export const dynamic = 'force-dynamic'

import prisma from '@/lib/prisma';
import ContactClient from './ContactClient';

export const metadata = {
  title: 'Contact — Poudhyal Farms | Get in Touch',
  description: 'Contact Poudhyal Farms for bookings, queries, or travel advice. Located on Rumtek-Ranka Road, Gangtok, Sikkim.',
};

export const revalidate = 300;

export default async function ContactPage() {
  const [content, settings] = await Promise.all([
    prisma.siteContent.findMany({ where: { page: 'contact' }, orderBy: { sortOrder: 'asc' } }),
    prisma.siteSetting.findMany(),
  ]);

  const sections = {};
  for (const row of content) {
    if (!sections[row.section]) sections[row.section] = {};
    sections[row.section][row.key] = row.value;
  }

  const settingsObj = {};
  for (const s of settings) {
    try { settingsObj[s.key] = JSON.parse(s.value); } catch { settingsObj[s.key] = s.value; }
  }

  return <ContactClient sections={sections} settings={settingsObj} />;
}
