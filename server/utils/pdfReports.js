import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BRAND_COLOR = [27, 107, 90];
const ACCENT_COLOR = [245, 197, 24];
const GRAY = [100, 100, 100];
const LIGHT_GRAY = [245, 245, 245];

const addHeader = (doc, title, subtitle) => {
  // Green header bar
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, 210, 32, 'F');

  // XenEdu logo text
  doc.setTextColor(245, 197, 24);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('XenEdu', 14, 14);

  // Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('A/L Tuition Management System • Mirigama', 14, 21);

  // Report title on right
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 196, 12, { align: 'right' });

  if (subtitle) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 196, 19, { align: 'right' });
  }

  // Generated date
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 200);
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 196, 26, { align: 'right' });
};

const addSummaryCards = (doc, cards, startY) => {
  const cardW = (210 - 28 - (cards.length - 1) * 4) / cards.length;
  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 4);

    // Card background
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(x, startY, cardW, 20, 2, 2, 'F');

    // Label
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label.toUpperCase(), x + cardW / 2, startY + 7, { align: 'center' });

    // Value
    doc.setTextColor(...(card.color || BRAND_COLOR));
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, x + cardW / 2, startY + 15, { align: 'center' });
  });

  return startY + 26;
};

const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.text('XenEdu Institute • Mirigama • xenedu@gmail.com', 14, 292);
    doc.text(`Page ${i} of ${pageCount}`, 196, 292, { align: 'right' });
  }
};

// ─── Monthly Report PDF ───────────────────────────────────────────
export const generateMonthlyPDF = (report, month) => {
  const doc = new jsPDF();

  addHeader(doc, 'Monthly Income Report', `Period: ${month}`);

  let y = 40;

  // Summary cards
  y = addSummaryCards(doc, [
    { label: 'Total Generated', value: `Rs. ${report.summary?.totalGenerated?.toLocaleString()}` },
    { label: 'Collected', value: `Rs. ${report.summary?.totalCollected?.toLocaleString()}`, color: [16, 185, 129] },
    { label: 'Unpaid', value: `Rs. ${report.summary?.totalUnpaid?.toLocaleString()}`, color: [239, 68, 68] },
    { label: 'Collection Rate', value: report.summary?.collectionRate || '0%', color: BRAND_COLOR },
  ], y);

  // Section title
  doc.setTextColor(...BRAND_COLOR);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Fee Records', 14, y + 4);
  y += 8;

  // Table
  autoTable(doc, {
    startY: y,
    head: [['Student', 'Class', 'Amount', 'Status', 'Due Date']],
    body: report.records?.map(fee => [
      fee.studentId?.userId?.name || 'N/A',
      fee.classId?.name || 'N/A',
      `Rs. ${fee.amount?.toLocaleString()}`,
      fee.status?.toUpperCase(),
      fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-GB') : 'N/A',
    ]) || [],
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 250, 248] },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 60 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 30, halign: 'center' },
    },
    didDrawCell: (data) => {
      if (data.column.index === 3 && data.section === 'body') {
        const status = data.cell.text[0];
        if (status === 'PAID') {
          doc.setTextColor(16, 185, 129);
        } else {
          doc.setTextColor(239, 68, 68);
        }
      }
    },
  });

  addFooter(doc);
  doc.save(`XenEdu_Monthly_Report_${month}.pdf`);
};

// ─── Date Range Report PDF ────────────────────────────────────────
export const generateDateRangePDF = (report, from, to) => {
  const doc = new jsPDF();

  addHeader(doc, 'Payment Report', `${from} to ${to}`);

  let y = 40;

  y = addSummaryCards(doc, [
    { label: 'Total Payments', value: report.totalPayments?.toString() },
    { label: 'Total Collected', value: `Rs. ${report.totalCollected?.toLocaleString()}`, color: [16, 185, 129] },
    { label: 'Period', value: `${from} — ${to}`, color: GRAY },
  ], y);

  // By date breakdown
  doc.setTextColor(...BRAND_COLOR);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Daily Breakdown', 14, y + 4);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Payments', 'Total Collected']],
    body: report.byDate?.map(d => [
      d.date,
      d.count?.toString(),
      `Rs. ${d.total?.toLocaleString()}`,
    ]) || [],
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 250, 248] },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 50, halign: 'right' },
    },
  });

  // Payment details
  const afterTable = doc.lastAutoTable.finalY + 8;

  doc.setTextColor(...BRAND_COLOR);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Details', 14, afterTable + 4);

  autoTable(doc, {
    startY: afterTable + 8,
    head: [['Date', 'Student', 'Class', 'Method', 'Amount', 'Receipt']],
    body: report.payments?.map(p => [
      new Date(p.paidAt).toLocaleDateString('en-GB'),
      p.studentId?.userId?.name || 'N/A',
      p.classId?.name || 'N/A',
      p.method?.replace('_', ' ').toUpperCase(),
      `Rs. ${p.amount?.toLocaleString()}`,
      p.receiptNumber || 'N/A',
    ]) || [],
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [250, 250, 248] },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 40 },
      2: { cellWidth: 45 },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 30, halign: 'center' },
    },
  });

  addFooter(doc);
  doc.save(`XenEdu_Payment_Report_${from}_to_${to}.pdf`);
};

// ─── Teacher Report PDF ───────────────────────────────────────────
export const generateTeacherPDF = (report) => {
  const doc = new jsPDF();

  addHeader(
    doc,
    'Teacher Income Report',
    `${report.teacher?.name} • ${report.month}`
  );

  let y = 40;

  // Teacher info
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(14, y, 182, 16, 'F');
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(report.teacher?.name || 'Teacher', 18, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(report.teacher?.email || '', 18, y + 13);
  doc.text(`Subjects: ${report.teacher?.subjects?.join(', ') || 'N/A'}`, 100, y + 7);
  doc.text(`Total Classes: ${report.totalClasses}`, 100, y + 13);
  y += 22;

  // Summary cards
  y = addSummaryCards(doc, [
    { label: 'Classes', value: report.totalClasses?.toString() },
    { label: 'Generated', value: `Rs. ${report.totalGenerated?.toLocaleString()}` },
    { label: 'Collected', value: `Rs. ${report.totalCollected?.toLocaleString()}`, color: [16, 185, 129] },
    { label: 'Collection Rate', value: `${report.collectionRate}%`, color: BRAND_COLOR },
  ], y);

  // Class breakdown
  doc.setTextColor(...BRAND_COLOR);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Class-wise Breakdown', 14, y + 4);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Class', 'Subject', 'Students', 'Fee/Month', 'Generated', 'Collected', 'Unpaid', 'Rate']],
    body: report.classReports?.map(cls => [
      cls.className,
      cls.subject,
      cls.enrolledCount?.toString(),
      `Rs. ${cls.monthlyFee?.toLocaleString()}`,
      `Rs. ${cls.totalGenerated?.toLocaleString()}`,
      `Rs. ${cls.totalCollected?.toLocaleString()}`,
      `Rs. ${cls.totalUnpaid?.toLocaleString()}`,
      `${cls.collectionRate}%`,
    ]) || [],
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [250, 250, 248] },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 28 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 22, halign: 'right' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 15, halign: 'center' },
    },
    foot: [[
      'TOTAL', '', '', '',
      `Rs. ${report.totalGenerated?.toLocaleString()}`,
      `Rs. ${report.totalCollected?.toLocaleString()}`,
      `Rs. ${(report.totalGenerated - report.totalCollected)?.toLocaleString()}`,
      `${report.collectionRate}%`,
    ]],
    footStyles: {
      fillColor: BRAND_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
  });

  addFooter(doc);
  doc.save(`XenEdu_Teacher_Report_${report.teacher?.name?.replace(/\s/g, '_')}_${report.month}.pdf`);
};