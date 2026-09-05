import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import ExcelJS from 'exceljs';

// GET /api/admin/export/:type — Export data as Excel (admin only)
export async function GET(request, { params }) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { type } = await params;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Poudhyal Farms Admin';
    workbook.created = new Date();

    let filename;

    if (type === 'reservations') {
      filename = 'poudhyal-reservations.xlsx';
      const sheet = workbook.addWorksheet('Reservations');
      sheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Check-In', key: 'checkIn', width: 15 },
        { header: 'Check-Out', key: 'checkOut', width: 15 },
        { header: 'Guests', key: 'guests', width: 8 },
        { header: 'Room Type', key: 'roomType', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Special Requests', key: 'specialRequests', width: 30 },
        { header: 'Created', key: 'createdAt', width: 20 },
      ];

      const data = await prisma.reservation.findMany({ orderBy: { createdAt: 'desc' } });
      data.forEach(r => sheet.addRow(r));

      // Style header row
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5A3F' } };
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    } else if (type === 'enquiries') {
      filename = 'poudhyal-enquiries.xlsx';
      const sheet = workbook.addWorksheet('Enquiries');
      sheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Subject', key: 'subject', width: 25 },
        { header: 'Message', key: 'message', width: 50 },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Created', key: 'createdAt', width: 20 },
      ];

      const data = await prisma.enquiry.findMany({ orderBy: { createdAt: 'desc' } });
      data.forEach(r => sheet.addRow(r));

      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5A3F' } };

    } else if (type === 'feedback') {
      filename = 'poudhyal-feedback.xlsx';
      const sheet = workbook.addWorksheet('Feedback');
      sheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Rating', key: 'rating', width: 8 },
        { header: 'Comment', key: 'comment', width: 60 },
        { header: 'Visible', key: 'isVisible', width: 8 },
        { header: 'Created', key: 'createdAt', width: 20 },
      ];

      const data = await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } });
      data.forEach(r => sheet.addRow({ ...r, isVisible: r.isVisible ? 'Yes' : 'No' }));

      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D5A3F' } };

    } else {
      return NextResponse.json({ error: 'Invalid export type. Use: reservations, enquiries, feedback' }, { status: 400 });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
