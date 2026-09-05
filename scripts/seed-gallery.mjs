import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const photos = [
  {
    filename: 'pf-20260702-11.jpeg',
    url: '/uploads/gallery/pf-20260702-11.jpeg',
    alt: 'Poudhyal Farms A-frame farmhouse surrounded by lush greenery',
    caption: 'The Farmhouse',
    category: 'Exterior',
    sortOrder: 1,
    isVisible: true,
  },
  {
    filename: 'pf-20260702-4.jpeg',
    url: '/uploads/gallery/pf-20260702-4.jpeg',
    alt: 'Poudhyal Farms exterior with iconic red A-frame roof and garden seating',
    caption: 'Garden & Farmhouse',
    category: 'Exterior',
    sortOrder: 2,
    isVisible: true,
  },
  {
    filename: 'pf-20260702-14.jpeg',
    url: '/uploads/gallery/pf-20260702-14.jpeg',
    alt: 'Himalayan mountain view from the balcony of Poudhyal Farms',
    caption: 'Balcony Mountain View',
    category: 'Views',
    sortOrder: 3,
    isVisible: true,
  },
  {
    filename: 'pf-20260702-3.jpeg',
    url: '/uploads/gallery/pf-20260702-3.jpeg',
    alt: 'Traditional ox-plough farming on terraced fields with misty Himalayan backdrop',
    caption: 'Traditional Organic Farming',
    category: 'Surroundings',
    sortOrder: 4,
    isVisible: true,
  },
  {
    filename: 'pf-20260702-9.jpeg',
    url: '/uploads/gallery/pf-20260702-9.jpeg',
    alt: 'Bright open-plan lounge and dining area inside Poudhyal Farms',
    caption: 'Open-plan Living & Dining',
    category: 'Interior',
    sortOrder: 5,
    isVisible: true,
  },
  {
    filename: 'pf-20260702-6.jpeg',
    url: '/uploads/gallery/pf-20260702-6.jpeg',
    alt: 'Modern kitchen and dining area with spiral staircase leading to loft',
    caption: 'Kitchen & Dining',
    category: 'Interior',
    sortOrder: 6,
    isVisible: true,
  },
  {
    filename: 'pf-20260702-2.jpeg',
    url: '/uploads/gallery/pf-20260702-2.jpeg',
    alt: 'Comfortable living room with wooden A-frame ceiling beams',
    caption: 'Living Room',
    category: 'Interior',
    sortOrder: 7,
    isVisible: true,
  },
  {
    filename: 'pf-20260702-8.jpeg',
    url: '/uploads/gallery/pf-20260702-8.jpeg',
    alt: 'Cosy double bedroom with warm wooden interiors',
    caption: 'Double Bedroom',
    category: 'Interior',
    sortOrder: 8,
    isVisible: true,
  },
  {
    filename: 'pf-20260702-10.jpeg',
    url: '/uploads/gallery/pf-20260702-10.jpeg',
    alt: 'Loft bedroom with bean bag and A-frame windows letting in natural light',
    caption: 'Loft Bedroom',
    category: 'Interior',
    sortOrder: 9,
    isVisible: true,
  },
  {
    filename: 'pf-20260702-1.jpeg',
    url: '/uploads/gallery/pf-20260702-1.jpeg',
    alt: 'Cosy study nook in the A-frame loft with views to the garden',
    caption: 'Loft Study Nook',
    category: 'Interior',
    sortOrder: 10,
    isVisible: true,
  },
  {
    filename: 'pf-20260702-5.jpeg',
    url: '/uploads/gallery/pf-20260702-5.jpeg',
    alt: 'Workspace under the A-frame roof with natural light from triangular window',
    caption: 'Loft Workspace',
    category: 'Interior',
    sortOrder: 11,
    isVisible: true,
  },
  {
    filename: 'pf-20260702-7.jpeg',
    url: '/uploads/gallery/pf-20260702-7.jpeg',
    alt: 'Indoor table tennis room surrounded by views of the garden',
    caption: 'Games Room',
    category: 'Interior',
    sortOrder: 12,
    isVisible: true,
  },
  {
    filename: 'pf-20260702-12.jpeg',
    url: '/uploads/gallery/pf-20260702-12.jpeg',
    alt: 'Clean bathroom with marble vanity and walk-in shower',
    caption: 'Bathroom',
    category: 'Interior',
    sortOrder: 13,
    isVisible: true,
  },
  {
    filename: 'pf-20260702-13.jpeg',
    url: '/uploads/gallery/pf-20260702-13.jpeg',
    alt: 'Second bathroom with shower and natural window light',
    caption: 'Second Bathroom',
    category: 'Interior',
    sortOrder: 14,
    isVisible: true,
  },
];

async function main() {
  console.log('Seeding gallery images...');

  // Clear existing gallery images first
  await prisma.galleryImage.deleteMany({});
  console.log('Cleared existing gallery images.');

  for (const photo of photos) {
    await prisma.galleryImage.create({ data: photo });
    console.log(`  ✓ Added: ${photo.caption}`);
  }

  console.log(`\nDone! Inserted ${photos.length} photos.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
