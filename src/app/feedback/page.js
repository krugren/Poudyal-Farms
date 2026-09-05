import prisma from '@/lib/prisma';
import FeedbackClient from './FeedbackClient';

export const metadata = {
  title: 'Guest Feedback — Poudhyal Farms',
  description: 'Read reviews from our guests and share your own experience at Poudhyal Farms organic farmstay in Sikkim.',
};

export default async function FeedbackPage() {
  const [content, feedback, stats] = await Promise.all([
    prisma.siteContent.findMany({ where: { page: 'feedback' }, orderBy: { sortOrder: 'asc' } }),
    prisma.feedback.findMany({ where: { isVisible: true }, orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, name: true, rating: true, comment: true, avatarColor: true, createdAt: true } }),
    prisma.feedback.aggregate({ where: { isVisible: true }, _count: true, _avg: { rating: true } }),
  ]);

  const distribution = await prisma.feedback.groupBy({ by: ['rating'], where: { isVisible: true }, _count: true });
  const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const d of distribution) {
    // Round half-star ratings (e.g. 4.5 → 5, 3.5 → 4) into integer buckets.
    // Matches the same logic in api/feedback/route.js to keep counts consistent.
    const bucket = Math.min(5, Math.max(1, Math.round(d.rating)));
    ratingDist[bucket] = (ratingDist[bucket] || 0) + d._count;
  }

  const sections = {};
  for (const row of content) {
    if (!sections[row.section]) sections[row.section] = {};
    sections[row.section][row.key] = row.value;
  }

  return (
    <FeedbackClient
      sections={sections}
      initialFeedback={feedback}
      stats={{ total: stats._count, average: stats._avg.rating ? parseFloat(stats._avg.rating.toFixed(1)) : 0, distribution: ratingDist }}
    />
  );
}
