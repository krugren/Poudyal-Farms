import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

// PATCH /api/gallery/[id] — update alt text, category, sortOrder, isActive
export async function PATCH(request, { params }) {
  const { requireAuth } = await import('@/lib/auth');
  if (!requireAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const id   = parseInt(params.id);
    const body = await request.json();
    const data = {};
    if (body.altText  !== undefined) data.altText  = String(body.altText).slice(0, 200);
    if (body.category !== undefined) data.category = String(body.category);
    if (body.sortOrder !== undefined) data.sortOrder = parseInt(body.sortOrder) || 0;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const image = await prisma.galleryImage.update({ where: { id }, data });
    return NextResponse.json({ success: true, image });
  } catch (err) {
    console.error('Gallery PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/gallery/[id]
export async function DELETE(request, { params }) {
  const { requireAuth } = await import('@/lib/auth');
  if (!requireAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const id    = parseInt(params.id);
    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Delete file from disk if it's a local upload
    if (image.url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', image.url);
      await unlink(filePath).catch(() => {}); // ignore if already gone
    }

    await prisma.galleryImage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Gallery DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
