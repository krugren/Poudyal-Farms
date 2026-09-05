const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin Account ──
  const adminExists = await prisma.admin.findUnique({ where: { username: 'admin' } });
  if (!adminExists) {
    await prisma.admin.create({
      data: {
        username: process.env.ADMIN_USERNAME || 'admin',
        passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'poudhyal2024', 12),
      },
    });
    console.log('✅ Admin account created');
  }

  // ── Site Settings ──
  const settings = [
    { key: 'site_name', value: 'Poudhyal Farms' },
    { key: 'site_tagline', value: 'Organic Farmstay · Sikkim' },
    { key: 'phone', value: '+91 98765 43210' },
    { key: 'email', value: 'stay@poudhyalfarms.com' },
    { key: 'address', value: 'Poudhyal Farms, Rumtek-Ranka Road, Gangtok, Sikkim 737101, India' },
    { key: 'map_embed_url', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d884.9892956038706!2d88.43015!3d27.23811!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e69f52b4f9f64b%3A0x94732fff6207d7ef!2sPoudyal%20Farm!5e0!3m2!1sen!2sin!4v1718272000000!5m2!1sen!2sin' },
    { key: 'maps_link', value: 'https://maps.google.com/?q=Gangtok,+Sikkim' },
    { key: 'instagram', value: 'https://instagram.com/poudhyalfarms' },
    { key: 'facebook', value: 'https://facebook.com/poudhyalfarms' },
    { key: 'twitter', value: 'https://twitter.com/poudhyalfarms' },
    { key: 'working_hours', value: JSON.stringify({ checkIn: '2:00 PM', checkOut: '11:00 AM', reception: '8:00 AM – 9:00 PM', farmTours: '6:30 AM – 10:00 AM / 3:00 PM – 5:30 PM' }) },
    { key: 'stats_guests', value: '150' },
    { key: 'stats_generations', value: '3' },
    { key: 'stats_acres', value: '12' },
    { key: 'stats_experiences', value: '6' },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('✅ Site settings seeded');

  // ── Site Content (page text) ──
  const content = [
    // Home Hero
    { page: 'home', section: 'hero', key: 'tagline', value: 'Escape to the Hills', sortOrder: 1 },
    { page: 'home', section: 'hero', key: 'title', value: 'Experience Authentic Sikkimese Farm Life', sortOrder: 2 },
    { page: 'home', section: 'hero', key: 'subtitle', value: 'A sanctuary of peace, organic living, and traditional hospitality amidst the misty mountains of Gangtok.', sortOrder: 3 },
    // Home Highlights
    { page: 'home', section: 'highlights', key: 'organic_title', value: '100% Organic', sortOrder: 1 },
    { page: 'home', section: 'highlights', key: 'organic_desc', value: 'Everything we serve is grown on our land using traditional, sustainable farming methods passed down through generations.', sortOrder: 2 },
    { page: 'home', section: 'highlights', key: 'views_title', value: 'Panoramic Views', sortOrder: 3 },
    { page: 'home', section: 'highlights', key: 'views_desc', value: 'Wake up to breathtaking views of the Kanchenjunga range right from your cottage window each morning.', sortOrder: 4 },
    { page: 'home', section: 'highlights', key: 'hospitality_title', value: 'Warm Hospitality', sortOrder: 5 },
    { page: 'home', section: 'highlights', key: 'hospitality_desc', value: 'Experience the genuine warmth and culture of Sikkim by staying with our family on the farm.', sortOrder: 6 },
    // Home Why Us
    { page: 'home', section: 'why_us', key: 'title', value: 'Why Poudhyal Farms?', sortOrder: 1 },
    { page: 'home', section: 'why_us', key: 'subtitle', value: 'More than a stay — an experience that connects you to the land, the culture, and yourself.', sortOrder: 2 },
    { page: 'home', section: 'why_us', key: 'point_1_title', value: 'Farm-to-Table Dining', sortOrder: 3 },
    { page: 'home', section: 'why_us', key: 'point_1_desc', value: 'Every meal is prepared with ingredients harvested from our own organic gardens — no chemicals, no imports, just pure Sikkimese flavours.', sortOrder: 4 },
    { page: 'home', section: 'why_us', key: 'point_2_title', value: 'Living Heritage', sortOrder: 5 },
    { page: 'home', section: 'why_us', key: 'point_2_desc', value: 'Our farmstay preserves traditional building methods, farming practices, and cultural rituals that have defined Sikkim for centuries.', sortOrder: 6 },
    { page: 'home', section: 'why_us', key: 'point_3_title', value: 'Untouched Nature', sortOrder: 7 },
    { page: 'home', section: 'why_us', key: 'point_3_desc', value: 'Surrounded by protected forests, rare orchids, and pristine streams — a world away from urban chaos.', sortOrder: 8 },
    // Home CTA
    { page: 'home', section: 'cta', key: 'title', value: 'Plan Your Escape', sortOrder: 1 },
    { page: 'home', section: 'cta', key: 'subtitle', value: 'Leave the noise behind. Let the mountains, the mist, and the warm hospitality of Poudhyal Farms rejuvenate your soul.', sortOrder: 2 },
    // Home Testimonial
    { page: 'home', section: 'testimonial', key: 'quote', value: 'An absolutely magical experience. The peace, the food, and the warmth of the Poudhyal family made this the highlight of our Sikkim trip.', sortOrder: 1 },
    { page: 'home', section: 'testimonial', key: 'author', value: 'Sarah Jenkins, UK', sortOrder: 2 },
    // About Story
    { page: 'about', section: 'story', key: 'title', value: 'Our Story', sortOrder: 1 },
    { page: 'about', section: 'story', key: 'para_1', value: 'Poudhyal Farms began with a simple vision: to preserve the rich agricultural heritage of Sikkim while sharing its beauty with the world. Nestled amidst the misty hills near Gangtok, our family-run organic farmstay offers a sanctuary from the bustle of modern life.', sortOrder: 2 },
    { page: 'about', section: 'story', key: 'para_2', value: 'For three generations, we have cultivated these lands using traditional, sustainable methods. Our cardamom plantations, tea gardens, and organic vegetable farms are tended with the same care our grandparents brought to this land decades ago.', sortOrder: 3 },
    { page: 'about', section: 'story', key: 'para_3', value: 'When you stay with us, you are not just a guest; you become part of our extended family and the rhythm of farm life. We believe that the truest luxury is simplicity — fresh mountain air, home-cooked meals, and the sound of birdsong at dawn.', sortOrder: 4 },
    // About Values
    { page: 'about', section: 'values', key: 'title', value: 'Our Values', sortOrder: 1 },
    { page: 'about', section: 'values', key: 'sustainability_title', value: 'Sustainability', sortOrder: 2 },
    { page: 'about', section: 'values', key: 'sustainability_desc', value: 'Zero pesticides. Rainwater harvesting. Solar heating. Composting. We do not just talk about sustainability — we live it every day.', sortOrder: 3 },
    { page: 'about', section: 'values', key: 'community_title', value: 'Community', sortOrder: 4 },
    { page: 'about', section: 'values', key: 'community_desc', value: 'We source locally, employ locally, and give back locally. Every stay directly supports rural livelihoods in our village.', sortOrder: 5 },
    { page: 'about', section: 'values', key: 'authenticity_title', value: 'Authenticity', sortOrder: 6 },
    { page: 'about', section: 'values', key: 'authenticity_desc', value: 'No pretence. What you see is what we are — a real working farm where generations have lived and will continue to live.', sortOrder: 7 },
    // Contact
    { page: 'contact', section: 'hero', key: 'title', value: 'Get in Touch', sortOrder: 1 },
    { page: 'contact', section: 'hero', key: 'subtitle', value: 'Have questions? We are here to help you plan your perfect getaway to the hills of Sikkim.', sortOrder: 2 },
    { page: 'contact', section: 'faq', key: 'q1', value: 'How do I get to Poudhyal Farms from Bagdogra Airport?', sortOrder: 1 },
    { page: 'contact', section: 'faq', key: 'a1', value: 'We can arrange a private pickup from Bagdogra Airport (IXB). The scenic drive takes approximately 4-5 hours via NH10 through Siliguri and Rangpo.', sortOrder: 2 },
    { page: 'contact', section: 'faq', key: 'q2', value: 'Is there mobile network coverage?', sortOrder: 3 },
    { page: 'contact', section: 'faq', key: 'a2', value: 'Yes, Airtel and Jio have reasonable coverage. We also provide complimentary Wi-Fi, though we encourage you to disconnect!', sortOrder: 4 },
    { page: 'contact', section: 'faq', key: 'q3', value: 'Can you accommodate dietary restrictions?', sortOrder: 5 },
    { page: 'contact', section: 'faq', key: 'a3', value: 'Absolutely. We serve vegetarian, vegan, and Jain meals on request. Please mention your dietary needs when booking.', sortOrder: 6 },
    // Feedback
    { page: 'feedback', section: 'hero', key: 'title', value: 'Guest Stories', sortOrder: 1 },
    { page: 'feedback', section: 'hero', key: 'subtitle', value: 'Read about experiences from our past guests, and share your own story with us.', sortOrder: 2 },
    // Reservations
    { page: 'reservations', section: 'hero', key: 'title', value: 'Book Your Stay', sortOrder: 1 },
    { page: 'reservations', section: 'hero', key: 'subtitle', value: 'Choose your dates and accommodation to begin your Sikkimese farmstay experience.', sortOrder: 2 },
  ];

  for (const c of content) {
    await prisma.siteContent.upsert({
      where: { page_section_key: { page: c.page, section: c.section, key: c.key } },
      update: { value: c.value, sortOrder: c.sortOrder },
      create: c,
    });
  }
  console.log('✅ Site content seeded');

  // ── Activities ──
  const activities = [
    { title: 'Tea Plucking', description: 'Join our workers in the early morning mist to pluck the finest tea leaves from our private estate. Learn the ancient art of selecting the perfect two-leaves-and-a-bud.', iconName: 'tea', sortOrder: 1 },
    { title: 'Organic Cooking', description: 'Learn to cook traditional Sikkimese dishes — momos, thukpa, gundruk — using ingredients you harvested yourself from our kitchen garden.', iconName: 'cooking', sortOrder: 2 },
    { title: 'Nature Walks', description: 'Guided walks through our cardamom plantations, bamboo groves, and neighboring pristine forests. Discover rare orchids and medicinal herbs along the way.', iconName: 'hiking', sortOrder: 3 },
    { title: 'Bird Watching', description: 'Spot rare Himalayan bird species — from the vibrant Mrs Gould\'s Sunbird to the elusive Satyr Tragopan — guided by our trained local naturalists.', iconName: 'bird', sortOrder: 4 },
    { title: 'Bonfire Nights', description: 'Gather around the fire under a canopy of stars with local rice beer (Tongba), roasted corn, and stories of the mountains passed down through generations.', iconName: 'fire', sortOrder: 5 },
    { title: 'Yoga & Meditation', description: 'Find your inner peace with sunrise yoga sessions on our wooden deck overlooking the snow-capped Kanchenjunga. Guided by a certified instructor.', iconName: 'yoga', sortOrder: 6 },
  ];

  for (const a of activities) {
    const existing = await prisma.activity.findFirst({ where: { title: a.title } });
    if (!existing) await prisma.activity.create({ data: a });
  }
  console.log('✅ Activities seeded');

  // ── Room Types ──
  const rooms = [
    { name: 'Farm Cottage', slug: 'farm-cottage', pricePerNight: 3500, description: 'Cozy wooden cottage with a private balcony facing the Kanchenjunga range. Features handwoven Sikkimese textiles and a wood-burning stove for chilly evenings.', maxGuests: 2, amenities: JSON.stringify(['Mountain View', 'Private Balcony', 'Wood Stove', 'Organic Toiletries', 'Hot Water']), sortOrder: 1 },
    { name: 'Heritage Room', slug: 'heritage-room', pricePerNight: 4500, description: 'Spacious room in the main farmhouse with traditional Sikkimese architecture — carved wooden beams, slate floors, and handmade quilts.', maxGuests: 4, amenities: JSON.stringify(['Tea Garden View', 'Shared Veranda', 'Family Bed', 'Organic Toiletries', 'Hot Water', 'Room Heater']), sortOrder: 2 },
    { name: 'Mountain Suite', slug: 'mountain-suite', pricePerNight: 6000, description: 'Our finest accommodation — a standalone suite with 270° panoramic mountain views, private sit-out, premium king bed, and clawfoot bathtub.', maxGuests: 2, amenities: JSON.stringify(['270° Views', 'Private Sit-Out', 'King Bed', 'Clawfoot Bath', 'Fireplace', 'Complimentary Farm Tour', 'Bonfire Evening']), sortOrder: 3 },
    { name: 'Day Farm Tour', slug: 'farm-tour', pricePerNight: 1000, description: 'Full-day guided experience including organic lunch, tea tasting, nature walk, and interaction with farm animals. No overnight stay.', maxGuests: 10, amenities: JSON.stringify(['Guided Tour', 'Organic Lunch', 'Tea Tasting', 'Nature Walk']), sortOrder: 4 },
  ];

  for (const r of rooms) {
    await prisma.roomType.upsert({
      where: { slug: r.slug },
      update: { ...r },
      create: r,
    });
  }
  console.log('✅ Room types seeded');

  // ── Travel Guide ──
  const guides = [
    { title: 'How to Reach', iconName: 'plane', entries: JSON.stringify([
      { label: 'By Air', text: 'Bagdogra Airport (IXB) is the nearest major airport at 120km. Pakyong Airport (PYG) is closer but has limited connectivity.' },
      { label: 'By Train', text: 'New Jalpaiguri (NJP) Railway Station is 115km away. Well-connected to Delhi, Kolkata, and Mumbai.' },
      { label: 'By Road', text: 'A 4-5 hour scenic drive from Siliguri via NH10. We can arrange a private pickup upon request.' },
    ]), sortOrder: 1 },
    { title: 'Best Time to Visit', iconName: 'sun', entries: JSON.stringify([
      { label: 'Spring (Mar-May)', text: 'Blooming rhododendrons and orchids. Pleasant temperatures (15-25°C). Cardamom flowering season.' },
      { label: 'Autumn (Sep-Nov)', text: 'Crystal-clear skies for best Kanchenjunga views. Ideal for trekking and the harvest festival season.' },
      { label: 'Winter (Dec-Feb)', text: 'Cold and crisp (2-12°C). Perfect for bonfires, hot Tongba, and the quiet magic of mountain winters.' },
    ]), sortOrder: 2 },
    { title: 'Nearby Attractions', iconName: 'mountain', entries: JSON.stringify([
      { label: 'Rumtek Monastery (8km)', text: 'One of the most important seats of Tibetan Buddhism with intricate murals and a golden stupa.' },
      { label: 'Tsomgo Lake (35km)', text: 'A glacial lake at 3,753m elevation, sacred to locals. Stunning reflections, especially in spring and autumn.' },
      { label: 'MG Marg, Gangtok (12km)', text: 'The vibrant pedestrian boulevard — cafes, shops, local handicrafts, and the best momos in town.' },
    ]), sortOrder: 3 },
  ];

  for (const g of guides) {
    const existing = await prisma.travelGuide.findFirst({ where: { title: g.title } });
    if (!existing) await prisma.travelGuide.create({ data: g });
  }
  console.log('✅ Travel guide seeded');

  // ── Sample Feedback ──
  const feedbackCount = await prisma.feedback.count();
  if (feedbackCount === 0) {
    const samples = [
      { name: 'Ananya Sharma', rating: 5, comment: 'An absolutely magical experience! The organic farm-to-table meals were incredible, and waking up to the view of Kanchenjunga was surreal. The Poudhyal family made us feel right at home.', avatarColor: '#d4a843' },
      { name: 'Rajesh Patel', rating: 5, comment: 'We visited during the rhododendron season and it was breathtaking. The tea garden tour was a highlight. The cottages are cozy and well-maintained. Will definitely return!', avatarColor: '#87a7b3' },
      { name: 'Meera Joshi', rating: 4, comment: 'Peaceful retreat from city life. The farm activities were engaging and educational for our kids. Fresh organic vegetables and local Sikkimese cuisine — simply wonderful.', avatarColor: '#c17d4a' },
      { name: 'David Chen', rating: 5, comment: 'One of the best homestay experiences in Northeast India. The hosts arranged a stunning sunrise trek. The homemade millet wine and momos were unforgettable!', avatarColor: '#6b8f5e' },
      { name: 'Priya Nair', rating: 4, comment: 'Perfect blend of adventure and relaxation. The bird watching tour revealed so many species! Rooms were clean and the organic breakfast spread was fantastic.', avatarColor: '#a0522d' },
      { name: 'Takeshi Yamamoto', rating: 5, comment: 'Travelled all the way from Japan and it was worth every mile. The cardamom plantation walk, the Himalayan views, and the warm hospitality — an experience I will cherish forever.', avatarColor: '#5f7a8a' },
      { name: 'Elena Rodriguez', rating: 5, comment: 'The Mountain Suite was extraordinary — waking up to 270-degree views of snow-capped peaks was a dream. The bonfire night with Tongba and local stories was the cherry on top.', avatarColor: '#8b6f47' },
    ];

    for (const fb of samples) {
      await prisma.feedback.create({ data: fb });
    }
    console.log('✅ Sample feedback seeded');
  }

  // ── Gallery Images (placeholders) ──
  const galleryCount = await prisma.galleryImage.count();
  if (galleryCount === 0) {
    const images = [
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop', altText: 'Misty mountain sunrise in the Himalayas', category: 'landscape', sortOrder: 1 },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop', altText: 'Mountain peaks of the Kanchenjunga range', category: 'landscape', sortOrder: 2 },
      { url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?q=80&w=2070&auto=format&fit=crop', altText: 'Lush green tea plantation terraces', category: 'farm', sortOrder: 3 },
      { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=2070&auto=format&fit=crop', altText: 'Organic vegetables growing in the farm garden', category: 'farm', sortOrder: 4 },
      { url: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=2070&auto=format&fit=crop', altText: 'Cozy farmstay cottage with mountain backdrop', category: 'rooms', sortOrder: 5 },
      { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop', altText: 'Golden sunset over terraced hills', category: 'landscape', sortOrder: 6 },
    ];

    for (const img of images) {
      await prisma.galleryImage.create({ data: img });
    }
    console.log('✅ Gallery images seeded');
  }

  console.log('🌿 Database seeding complete!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Seed error:', e);
    prisma.$disconnect();
    process.exit(1);
  });
