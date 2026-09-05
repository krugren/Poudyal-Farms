import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET /api/gallery — public, returns active images
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const where = { isActive: true };
    if (category && category !== 'all') where.category = category;

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    return NextResponse.json({ images });
  } catch (err) {
    console.error('Gallery GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}

// POST /api/gallery — admin only, multipart upload
export async function POST(request) {
  const { requireAuth } = await import('@/lib/auth');
  if (!requireAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file     = formData.get('file');
    const altText  = (formData.get('altText') || '').trim().slice(0, 200);
    const category = formData.get('category') || 'general';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate type
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WebP, or AVIF images are allowed' }, { status: 400 });
    }

    // Validate size (10 MB)
    const MAX_BYTES = 10 * 1024 * 1024;
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'File must be under 10 MB' }, { status: 400 });
    }

    // Sanitise filename
    const ext      = path.extname(file.name).toLowerCase() || '.jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'gallery');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, safeName), buffer);

    const url = `/uploads/gallery/${safeName}`;

    // Count existing for sortOrder
    const count = await prisma.galleryImage.count();
    const image = await prisma.galleryImage.create({
      data: { url, altText: altText || 'Farm photo', category, sortOrder: count },
    });

    return NextResponse.json({ success: true, image }, { status: 201 });
  } catch (err) {
    console.error('Gallery POST error:', err);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
