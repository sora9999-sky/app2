import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatIQD, formatDate } from './format';
import { accountTotals } from './derive';

export function exportAccountPDF(account, lang = 'en') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const totals = accountTotals(account);
  const generatedAt = new Date();

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(14, 165, 233); // sky-500
  doc.rect(0, 0, pageWidth, 70, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('Dinar Desk', 40, 35);
  doc.setFontSize(12);
  doc.text('Supplier Account Statement', 40, 55);

  // Meta block
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(14);
  doc.text(`Supplier: ${account.name}`, 40, 100);
  doc.setFontSize(11);
  doc.text(`Account ID: SUP-${String(account.id).padStart(4, '0')}`, 40, 118);
  doc.text(`Generated: ${generatedAt.toLocaleString('en-GB')}`, 40, 134);

  // Totals box
  const boxY = 150;
  doc.setDrawColor(186, 230, 253); // sky-200
  doc.setFillColor(240, 249, 255); // sky-50
  doc.roundedRect(40, boxY, pageWidth - 80, 70, 6, 6, 'FD');
  doc.setFontSize(11);
  doc.setTextColor(2, 132, 199); // sky-600
  doc.text('Total Bills', 60, boxY + 22);
  doc.text('Total Payments', 240, boxY + 22);
  doc.text('Outstanding Balance', 420, boxY + 22);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.text(formatIQD(totals.totalBills, 'en'), 60, boxY + 48);
  doc.text(formatIQD(totals.totalPayments, 'en'), 240, boxY + 48);
  doc.text(formatIQD(totals.outstanding, 'en'), 420, boxY + 48);

  // Bills table
  const billsBody = (account.bills || []).map((b) => [
    `B-${String(b.id).padStart(4, '0')}`,
    String(b.billNumber || ''),
    formatDate(b.date, 'en'),
    `${b.monthsUntilDue || 0} mo`,
    formatDate(b.dueDate, 'en'),
    formatIQD(b.amount, 'en'),
  ]);
  autoTable(doc, {
    startY: boxY + 90,
    head: [['ID', 'Bill #', 'Date', 'Term', 'Due', 'Amount']],
    body: billsBody.length
      ? billsBody
      : [['—', '—', '—', '—', '—', 'No bills']],
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [14, 165, 233], textColor: 255 },
    margin: { left: 40, right: 40 },
    didDrawPage: () => {
      doc.setFontSize(13);
      doc.setTextColor(2, 132, 199);
      doc.text('Bills', 40, boxY + 82);
    },
  });

  // Payments table
  const paymentsBody = (account.payments || []).map((p) => [
    `P-${String(p.id).padStart(4, '0')}`,
    String(p.paymentNumber || ''),
    formatDate(p.date, 'en'),
    p.billId ? `B-${String(p.billId).padStart(4, '0')}` : '—',
    formatIQD(p.amount, 'en'),
  ]);
  const afterBillsY = doc.lastAutoTable.finalY + 30;
  doc.setFontSize(13);
  doc.setTextColor(15, 118, 110); // teal-700
  doc.text('Payments', 40, afterBillsY - 8);
  autoTable(doc, {
    startY: afterBillsY,
    head: [['ID', 'Payment #', 'Date', 'For Bill', 'Amount']],
    body: paymentsBody.length
      ? paymentsBody
      : [['—', '—', '—', '—', 'No payments']],
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [13, 148, 136], textColor: 255 },
    margin: { left: 40, right: 40 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Dinar Desk · Offline Personal Accounting · Page ${i} of ${pageCount}`,
      40,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  const safeName = (account.name || 'supplier').replace(/[^a-z0-9_-]+/gi, '_');
  doc.save(`statement-${safeName}-${account.id}.pdf`);
}
