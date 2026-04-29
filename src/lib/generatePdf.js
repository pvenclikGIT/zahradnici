import jsPDF from 'jspdf'

export function generateInvoicePdf(invoice, client, biz) {
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
  const W = 210, margin = 18

  // ── Fonts & Colors ──
  const green  = [52, 133, 41]
  const dark   = [20, 20, 16]
  const gray   = [120, 120, 112]
  const light  = [240, 240, 236]

  // ── Header block ──
  doc.setFillColor(...[30,30,24])
  doc.rect(0, 0, W, 52, 'F')

  // Logo text
  doc.setTextColor(52, 133, 41)
  doc.setFont('helvetica','bold')
  doc.setFontSize(20)
  doc.text(biz.name, margin, 20)

  // Company details
  doc.setTextColor(180, 180, 170)
  doc.setFont('helvetica','normal')
  doc.setFontSize(8.5)
  doc.text(biz.address, margin, 28)
  doc.text(`${biz.phone}  ·  ${biz.email}`, margin, 34)
  doc.text(`IČO: ${biz.ico}  ·  DIČ: ${biz.dic}`, margin, 40)

  // Invoice number
  doc.setTextColor(255,255,255)
  doc.setFont('helvetica','bold')
  doc.setFontSize(11)
  doc.text('FAKTURA', W - margin, 18, { align:'right' })
  doc.setFontSize(28)
  doc.text(`#${invoice.id}`, W - margin, 30, { align:'right' })

  doc.setFont('helvetica','normal')
  doc.setFontSize(8.5)
  doc.setTextColor(180,180,170)
  doc.text(`Vystaveno: ${formatD(invoice.date)}`, W - margin, 40, { align:'right' })
  doc.text(`Splatnost: ${formatD(invoice.dueDate)}`, W - margin, 46, { align:'right' })

  // ── Parties ──
  let y = 66
  doc.setTextColor(...gray)
  doc.setFont('helvetica','bold')
  doc.setFontSize(7.5)
  doc.text('DODAVATEL', margin, y)
  doc.text('ODBĚRATEL', W/2 + 4, y)

  y += 6
  doc.setTextColor(...dark)
  doc.setFont('helvetica','bold')
  doc.setFontSize(10)
  doc.text(biz.name, margin, y)
  doc.text(client?.name || '—', W/2 + 4, y)

  doc.setFont('helvetica','normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...gray)
  y += 5
  doc.text(biz.address, margin, y)
  doc.text(client?.address || '', W/2 + 4, y)
  y += 5
  doc.text(biz.phone, margin, y)
  doc.text(client?.phone || '', W/2 + 4, y)
  y += 5
  doc.text(`IČO: ${biz.ico}`, margin, y)
  if (client?.email) doc.text(client.email, W/2 + 4, y)

  // Divider
  y += 12
  doc.setDrawColor(...light)
  doc.setLineWidth(0.3)
  doc.line(margin, y, W - margin, y)

  // ── Items table ──
  y += 10
  doc.setFillColor(...light)
  doc.rect(margin, y - 5, W - margin*2, 8, 'F')

  doc.setTextColor(...gray)
  doc.setFont('helvetica','bold')
  doc.setFontSize(7.5)
  doc.text('POPIS PRÁCE', margin + 2, y)
  doc.text('MNOŽSTVÍ', 112, y, { align:'right' })
  doc.text('JEDN. CENA', 145, y, { align:'right' })
  doc.text('CELKEM', W - margin - 2, y, { align:'right' })

  y += 8
  doc.setFont('helvetica','normal')
  doc.setFontSize(9)
  doc.setTextColor(...dark)

  const items = invoice.serviceDetails || [
    { name:`Zahradnické práce — zakázka #${invoice.orderId||'—'}`, qty:1, unit:'paušál', pricePerUnit:invoice.amount, total:invoice.amount }
  ]

  items.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 248, 244)
      doc.rect(margin, y - 5, W - margin*2, 8, 'F')
    }
    doc.setTextColor(...dark)
    doc.text(item.name, margin + 2, y, { maxWidth: 80 })
    doc.setTextColor(...gray)
    doc.text(`${item.qty} ${item.unit}`, 112, y, { align:'right' })
    doc.text(`${item.pricePerUnit} Kč`, 145, y, { align:'right' })
    doc.setTextColor(...dark)
    doc.setFont('helvetica','bold')
    doc.text(fmtCzk(item.total), W - margin - 2, y, { align:'right' })
    doc.setFont('helvetica','normal')
    y += 9
  })

  // ── Totals ──
  y += 6
  doc.setDrawColor(...light)
  doc.line(margin, y, W - margin, y)
  y += 8

  const base = Math.round(invoice.amount / 1.21)
  const dph  = invoice.amount - base

  doc.setFontSize(8.5)
  doc.setTextColor(...gray)
  ;[['Základ daně (21 %)', base], ['DPH 21 %', dph]].forEach(([l, v]) => {
    doc.text(l, W - margin - 55, y)
    doc.text(fmtCzk(v), W - margin - 2, y, { align:'right' })
    y += 7
  })

  // Total box
  y += 2
  doc.setFillColor(...[30,30,24])
  doc.roundedRect(margin, y, W - margin*2, 14, 3, 3, 'F')
  doc.setTextColor(255,255,255)
  doc.setFont('helvetica','bold')
  doc.setFontSize(10)
  doc.text('K ÚHRADĚ', margin + 5, y + 9)
  doc.setTextColor(...green)
  doc.setFontSize(18)
  doc.text(fmtCzk(invoice.amount), W - margin - 4, y + 10, { align:'right' })

  // ── Payment info ──
  y += 24
  doc.setFillColor(...light)
  doc.roundedRect(margin, y, W - margin*2, 22, 3, 3, 'F')
  doc.setTextColor(...gray)
  doc.setFont('helvetica','bold')
  doc.setFontSize(8)
  doc.text('PLATEBNÍ ÚDAJE', margin + 4, y + 7)
  doc.setFont('helvetica','normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...dark)
  doc.text(`Číslo účtu: ${biz.bank}`, margin + 4, y + 14)
  doc.text(`Variabilní symbol: ${invoice.id}`, margin + 4, y + 20)

  // Status
  const statusTxt = invoice.paid ? 'ZAPLACENO' : 'ČEKÁ NA PLATBU'
  const statusColor = invoice.paid ? green : [180, 83, 9]
  doc.setFont('helvetica','bold')
  doc.setFontSize(9)
  doc.setTextColor(...statusColor)
  doc.text(statusTxt, W - margin - 4, y + 14, { align:'right' })

  // ── Footer ──
  doc.setTextColor(...gray)
  doc.setFont('helvetica','normal')
  doc.setFontSize(7.5)
  doc.text('Faktura vystavena aplikací ZahradaPro · zahradapro.cz', W/2, 285, { align:'center' })

  // Save
  doc.save(`faktura-${invoice.id}.pdf`)
}

function formatD(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('cs-CZ', { day:'2-digit', month:'2-digit', year:'numeric' })
}
function fmtCzk(n) {
  return new Intl.NumberFormat('cs-CZ', { style:'currency', currency:'CZK', maximumFractionDigits:0 }).format(n)
}
