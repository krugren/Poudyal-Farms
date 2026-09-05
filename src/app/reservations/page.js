import prisma from '@/lib/prisma';
import ReservationsClient from './ReservationsClient';

export const metadata = {
  title: 'Book Your Stay — Poudhyal Farms | Reservations',
  description: 'Reserve your farmstay experience at Poudhyal Farms, Sikkim. Choose from cozy cottages, heritage rooms, and the premium mountain suite.',
};

export const revalidate = 300;

export default async function ReservationsPage() {
  const [content, rooms, settings] = await Promise.all([
    prisma.siteContent.findMany({ where: { page: 'reservations' }, orderBy: { sortOrder: 'asc' } }),
    prisma.roomType.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.siteSetting.findMany(),
  ]);

  const sections = {};
  for (const row of content) {
    if (!sections[row.section]) sections[row.section] = {};
    sections[row.section][row.key] = row.value;
  }

  const settingsObj = {};
  for (const s of settings) settingsObj[s.key] = s.value;

  const roomsData = rooms.map(r => ({ ...r, amenities: JSON.parse(r.amenities || '[]') }));

  return <ReservationsClient sections={sections} rooms={roomsData} settings={settingsObj} />;
}
