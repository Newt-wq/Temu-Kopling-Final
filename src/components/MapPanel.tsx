import { useState } from 'react'
import { Bike, Crosshair, Layers, MapPin, Minus, Plus } from 'lucide-react'
import { place } from '../lib/model'

export function MapPanel({
  pickup = 'ugm',
  destination = 'malioboro',
  active = false,
  className = '',
}: {
  pickup?: string
  destination?: string
  active?: boolean
  className?: string
}) {
  const [zoom, setZoom] = useState(1)
  const [showLabels, setShowLabels] = useState(true)
  const from = place(pickup)
  const to = place(destination)
  const middleY = (from.y + to.y) / 2
  const route = `M${from.x} ${from.y} L${from.x} ${middleY} Q${from.x} ${middleY + 15} ${from.x - 15} ${middleY + 15} L${to.x + 15} ${middleY + 15} Q${to.x} ${middleY + 15} ${to.x} ${middleY + 30} L${to.x} ${to.y}`
  return (
    <section
      className={`map-panel ${className}`}
      aria-label="Peta ilustrasi perjalanan di Yogyakarta"
    >
      <svg
        className="city-map"
        viewBox="0 0 800 530"
        role="img"
        aria-label={`Ilustrasi rute ${from.name} ke ${to.name}. Bukan peta navigasi.`}
      >
        <defs>
          <pattern
            id="blocks"
            x="0"
            y="0"
            width="82"
            height="70"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-9)"
          >
            <rect width="82" height="70" fill="var(--map-ground)" />
            <rect x="5" y="5" width="68" height="56" rx="6" fill="var(--map-block)" />
            <path d="M20 8v50M42 5v55M5 29h66" stroke="var(--map-ground)" strokeWidth="3" />
          </pattern>
        </defs>
        <g transform={`translate(${400 - 400 * zoom},${265 - 265 * zoom}) scale(${zoom})`}>
          <rect width="800" height="530" fill="url(#blocks)" />
          <path
            d="M548-40C420 80 602 115 560 220S640 366 569 560"
            fill="none"
            stroke="var(--map-water)"
            strokeWidth="23"
          />
          <path
            d="M548-40C420 80 602 115 560 220S640 366 569 560"
            fill="none"
            stroke="var(--map-water-line)"
            strokeWidth="2"
          />
          <g fill="var(--map-park)">
            <path d="M390 38h123v126H400l-15-54z" />
            <path d="M63 355l87-13 23 82-97 15z" />
            <rect x="631" y="375" width="87" height="66" rx="12" />
            <path d="M226 432h118v73H226z" />
          </g>
          <g stroke="var(--map-road-edge)" strokeWidth="18" fill="none">
            <path d="M-30 246L825 224M281-10L300 555M-20 355L827 322M55 20L420 540M-40 97L831 75M456-20L467 550" />
          </g>
          <g stroke="var(--surface)" strokeWidth="13" fill="none">
            <path d="M-30 246L825 224M281-10L300 555M-20 355L827 322M55 20L420 540M-40 97L831 75M456-20L467 550" />
          </g>
          <g stroke="var(--surface)" strokeWidth="6" fill="none">
            <path d="M0 162L802 142M80-20L185 550M643-15L676 550M0 425L800 392M200-20L219 550M-20 495L820 460" />
          </g>
          {showLabels && (
            <g className="map-labels" textAnchor="middle">
              <text x="470" y="59" className="map-district">
                CATURTUNGGAL
              </text>
              <text x="138" y="179" className="map-district">
                JETIS
              </text>
              <text x="663" y="270" className="map-district">
                GONDOKUSUMAN
              </text>
              <text x="148" y="486" className="map-district">
                NGAMPILAN
              </text>
              <text x="475" y="111">
                Universitas
              </text>
              <text x="475" y="126">
                Gadjah Mada
              </text>
              <text x="294" y="212">
                Tugu Yogyakarta
              </text>
              <text x="190" y="290">
                Stasiun Tugu
              </text>
              <text x="393" y="320">
                Kotabaru
              </text>
              <text x="687" y="93">
                Pakuwon Mall
              </text>
              <text x="290" y="494">
                Alun-Alun Kidul
              </text>
              <text x="649" y="416">
                Kebun Binatang
              </text>
              <text x="284" y="405" className="map-city">
                YOGYAKARTA
              </text>
              <text x="703" y="211" className="map-street">
                Jl. Jenderal Sudirman
              </text>
              <text x="142" y="330" className="map-street">
                Jl. Pasar Kembang
              </text>
            </g>
          )}
          <path
            d={route}
            fill="none"
            stroke="var(--surface)"
            strokeWidth="11"
            strokeLinejoin="round"
          />
          <path
            d={route}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <circle cx={from.x} cy={from.y} r="21" fill="var(--primary)" opacity=".12" />
          <circle
            cx={from.x}
            cy={from.y}
            r="9"
            fill="var(--primary)"
            stroke="var(--surface)"
            strokeWidth="4"
          />
          <g transform={`translate(${to.x - 15},${to.y - 32})`}>
            <path
              d="M15 0a15 15 0 0 1 15 15c0 11-15 23-15 23S0 26 0 15A15 15 0 0 1 15 0"
              fill="var(--primary)"
            />
            <circle cx="15" cy="14" r="5" fill="var(--surface)" />
          </g>
          <g transform="translate(340,245) rotate(-10)">
            <rect
              x="-17"
              y="-17"
              width="34"
              height="34"
              rx="11"
              fill="var(--surface)"
              stroke="var(--map-road-edge)"
            />
            <Bike x="-11" y="-11" width="22" height="22" color="var(--primary)" />
          </g>
          <g transform="translate(590,303) rotate(15)">
            <rect
              x="-15"
              y="-15"
              width="30"
              height="30"
              rx="10"
              fill="var(--surface)"
              stroke="var(--map-road-edge)"
            />
            <Bike x="-10" y="-10" width="20" height="20" color="var(--primary)" />
          </g>
          {active && (
            <g transform={`translate(${from.x},${middleY})`}>
              <circle r="20" fill="var(--primary)" />
              <Bike x="-12" y="-12" width="24" height="24" color="var(--surface)" />
            </g>
          )}
        </g>
      </svg>
      <div className="map-location">
        <MapPin size={15} />
        <span>Yogyakarta</span>
        <span className="map-dot" /> <small>Area demo</small>
      </div>
      <div className="map-controls">
        <button
          aria-label="Perbesar peta"
          disabled={zoom >= 1.6}
          onClick={() => setZoom(Math.min(1.6, zoom + 0.2))}
        >
          <Plus size={18} />
        </button>
        <button
          aria-label="Perkecil peta"
          disabled={zoom <= 0.8}
          onClick={() => setZoom(Math.max(0.8, zoom - 0.2))}
        >
          <Minus size={18} />
        </button>
        <button aria-label="Pusatkan peta" onClick={() => setZoom(1)}>
          <Crosshair size={18} />
        </button>
      </div>
      <button
        className={`map-layers ${showLabels ? 'selected' : ''}`}
        aria-label="Tampilkan label peta"
        aria-pressed={showLabels}
        onClick={() => setShowLabels(!showLabels)}
      >
        <Layers size={18} />
      </button>
      <span className="map-attribution">Peta ilustrasi · Bukan navigasi langsung</span>
      <div className="map-riders">
        <span className="live-dot" />
        <span>{active ? 'Perjalanan demo sedang aktif' : 'Rider demo di sekitarmu'}</span>
        <small>{active ? 'Status dapat disimulasikan' : 'Siap menemani perjalananmu'}</small>
      </div>
    </section>
  )
}
