import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// PATCH /api/feedback/:id — Toggle visibility or update (admin only)
export async function PATCH(request, { params }) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const updateData = {};

    if (typeof body.isVisible === 'boolean') {
      updateData.isVisible = body.isVisible;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, feedback });
  } catch (err) {
    if (err.code === 'P2025') return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    console.error('Feedback update error:', err);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}

// DELETE /api/feedback/:id — Permanently delete (admin only)
export async function DELETE(request, { params }) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.feedback.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Feedback permanently deleted' });
  } catch (err) {
    if (err.code === 'P2025') return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    console.error('Feedback delete error:', err);
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }
}
