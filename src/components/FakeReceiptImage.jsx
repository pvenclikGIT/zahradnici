import { formatDate, formatCurrency } from '../data'

// Generates SVG mock receipt that looks like real one
export function FakeReceiptImage({ receipt, large = false }) {
  if (!receipt) return null

  const baseW = large ? 320 : 200
  const lineHeight = 14
  const padding = 16
  const itemRows = receipt.items?.length || 1
  const headerH = 60
  const footerH = 70
  const totalH = headerH + (itemRows * lineHeight) + footerH + padding * 2
  const scale = large ? 1.6 : 1
  const W = baseW
  const H = Math.max(280, totalH * scale)

  const dateStr = formatDate(receipt.date)
  const amountStr = formatCurrency(receipt.amount)
  const ico = receipt.supplierId ? '12345678' : '00000000'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{width:'100%', height:'auto', maxHeight: large ? 500 : 240}}>
      {/* Paper background with subtle texture */}
      <defs>
        <pattern id="paper" patternUnits="userSpaceOnUse" width="6" height="6">
          <rect width="6" height="6" fill="#fefefe"/>
          <circle cx="2" cy="3" r="0.3" fill="#f5f5f3" opacity="0.5"/>
        </pattern>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.15"/></feComponentTransfer>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Receipt body */}
      <rect x="6" y="6" width={W - 12} height={H - 12} fill="url(#paper)" filter="url(#shadow)" rx="2"/>

      {/* Wavy top edge */}
      <path d={`M 6 14 Q 14 10, 22 14 T 38 14 T 54 14 T 70 14 T 86 14 T 102 14 T 118 14 T 134 14 T 150 14 T 166 14 T 182 14 T ${W-6} 14 L ${W-6} 8 L 6 8 Z`}
        fill="white" opacity="0.95"/>

      {/* Header — supplier */}
      <text x={W/2} y={36} textAnchor="middle" fontFamily="Courier, monospace" fontSize="11" fontWeight="bold" fill="#222">
        {receipt.supplier?.toUpperCase() || 'OBCHOD'}
      </text>
      <text x={W/2} y={50} textAnchor="middle" fontFamily="Courier, monospace" fontSize="8" fill="#666">
        IČO: {ico}
      </text>
      <text x={W/2} y={62} textAnchor="middle" fontFamily="Courier, monospace" fontSize="8" fill="#666">
        DIČ: CZ{ico}
      </text>

      {/* Divider */}
      <line x1={padding} y1={75} x2={W - padding} y2={75} stroke="#ccc" strokeDasharray="2,2"/>

      {/* Items */}
      {(receipt.items || []).map((item, i) => {
        const y = 92 + i * lineHeight
        return (
          <g key={i}>
            <text x={padding} y={y} fontFamily="Courier, monospace" fontSize="8" fill="#333">
              {item.name?.slice(0, 24)}
            </text>
            <text x={padding} y={y + 9} fontFamily="Courier, monospace" fontSize="8" fill="#666">
              {item.qty} × {item.pricePerUnit} Kč
            </text>
            <text x={W - padding} y={y + 9} textAnchor="end" fontFamily="Courier, monospace" fontSize="9" fontWeight="bold" fill="#000">
              {item.total} Kč
            </text>
          </g>
        )
      })}

      {/* Divider */}
      <line x1={padding} y1={92 + itemRows * lineHeight + 14} x2={W - padding} y2={92 + itemRows * lineHeight + 14} stroke="#ccc" strokeDasharray="2,2"/>

      {/* Total */}
      <text x={padding} y={92 + itemRows * lineHeight + 32} fontFamily="Courier, monospace" fontSize="10" fontWeight="bold" fill="#000">
        CELKEM:
      </text>
      <text x={W - padding} y={92 + itemRows * lineHeight + 32} textAnchor="end" fontFamily="Courier, monospace" fontSize="13" fontWeight="bold" fill="#000">
        {amountStr}
      </text>

      {/* Payment + date */}
      <text x={padding} y={92 + itemRows * lineHeight + 50} fontFamily="Courier, monospace" fontSize="7" fill="#666">
        {receipt.paymentMethod === 'card' ? 'Platba kartou' : receipt.paymentMethod === 'cash' ? 'Hotově' : 'Převodem'}
      </text>
      <text x={W - padding} y={92 + itemRows * lineHeight + 50} textAnchor="end" fontFamily="Courier, monospace" fontSize="7" fill="#666">
        {dateStr}
      </text>

      {/* Footer */}
      <text x={W/2} y={92 + itemRows * lineHeight + 68} textAnchor="middle" fontFamily="Courier, monospace" fontSize="7" fill="#999">
        DĚKUJEME ZA NÁKUP
      </text>

      {/* Wavy bottom edge */}
      <path d={`M 6 ${H - 14} Q 14 ${H - 18}, 22 ${H - 14} T 38 ${H - 14} T 54 ${H - 14} T 70 ${H - 14} T 86 ${H - 14} T 102 ${H - 14} T 118 ${H - 14} T 134 ${H - 14} T 150 ${H - 14} T 166 ${H - 14} T 182 ${H - 14} T ${W-6} ${H - 14} L ${W-6} ${H - 8} L 6 ${H - 8} Z`}
        fill="white" opacity="0.95"/>
    </svg>
  )
}
