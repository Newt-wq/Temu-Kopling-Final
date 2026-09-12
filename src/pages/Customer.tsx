import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Bike,
  BriefcaseBusiness,
  CarFront,
  ChevronRight,
  Clock3,
  Crosshair,
  House,
  Leaf,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  Sun,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/context'
import { activeCustomer, estimate, locations, money, roleTrips } from '../lib/model'
import type { Trip } from '../lib/model'
import { ActiveTripPanel, CompletionCard, TripDetails } from '../components/TripFlow'
import { MapPanel } from '../components/MapPanel'
import { Badge, Button, Card, EmptyState, PageHeading, Select, TripCard } from '../components/ui'

function BookingForm({ onRoute }: { onRoute: (pickup: string, destination: string) => void }) {
  const { state, dispatch, toast } = useApp()
  const [pickup, setPickup] = useState('ugm')
  const [destination, setDestination] = useState('')
  const [service, setService] = useState<Trip['service']>('motor')
  const [payment, setPayment] = useState<Trip['payment']>('cash')
  const [error, setError] = useState('')
  const quote = estimate(pickup, destination || 'malioboro', service)
  const update = (from: string, to: string) => {
    setPickup(from)
    setDestination(to)
    setError('')
    onRoute(from, to || 'malioboro')
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!pickup || !destination) {
      setError('Pilih titik jemput dan tujuan terlebih dahulu.')
      return
    }
    if (pickup === destination) {
      setError('Tujuan harus berbeda dari titik jemput.')
      return
    }
    dispatch({
      type: 'book',
      trip: {
        id: `TK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        pickup,
        destination,
        service,
        payment,
        status: 'searching',
        origin: 'customer',
        assigned: false,
        fare: quote.fare,
        distance: quote.distance,
        createdAt: new Date().toISOString(),
        passenger: state.profiles.customer.name,
      },
    })
    toast('Pesanan demo dibuat. Yuk, lihat status perjalananmu.')
  }
  return (
    <form className="booking-form" onSubmit={submit}>
      <div className="section-heading">
        <h2>Mulai perjalananmu</h2>
        <span className="small-icon">
          <Navigation size={18} />
        </span>
      </div>
      <p className="muted">Satu tujuan, selangkah lebih dekat.</p>
      <div className="location-fields">
        <span className="location-connector" />
        <div className="location-input">
          <span className="route-dot" />
          <Select
            label="Titik jemput"
            value={pickup}
            onChange={(event) => update(event.target.value, destination)}
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
          <button
            type="button"
            className="icon-button"
            aria-label="Gunakan lokasi rumah demo"
            onClick={() => {
              update('home', destination)
              toast('Titik jemput diatur ke Rumah · Terban (lokasi demo).')
            }}
          >
            <Crosshair size={17} />
          </button>
        </div>
        <div className="location-input">
          <MapPin size={18} />
          <Select
            label="Tujuan perjalanan"
            value={destination}
            onChange={(event) => update(pickup, event.target.value)}
            required
          >
            <option value="" disabled>
              Mau pergi ke mana?
            </option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
          <button
            className="icon-button"
            type="button"
            aria-label="Tukar titik jemput dan tujuan"
            disabled={!destination}
            onClick={() => update(destination, pickup)}
          >
            <ArrowDownUp size={16} />
          </button>
        </div>
      </div>
      <div className="saved-places">
        <button type="button" onClick={() => update(pickup, 'home')}>
          <House size={13} />
          Rumah
          <ChevronRight size={12} />
        </button>
        <button type="button" onClick={() => update(pickup, 'office')}>
          <BriefcaseBusiness size={13} />
          Kantor
          <ChevronRight size={12} />
        </button>
        <span>Lokasi demo</span>
      </div>
      <div className="service-heading">
        <label>Pilih teman perjalanan</label>
        <span>Nyaman, sesuai kebutuhan</span>
      </div>
      <div className="service-options">
        {(
          [
            { id: 'motor', name: 'Temu Motor', description: 'Praktis & gesit', icon: Bike },
            { id: 'car', name: 'Temu Mobil', description: 'Nyaman bersama', icon: CarFront },
          ] as const
        ).map(({ id, name, description, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`service-option ${service === id ? 'selected' : ''}`}
            aria-pressed={service === id}
            onClick={() => setService(id)}
          >
            <span className="service-icon">
              <Icon size={27} strokeWidth={1.5} />
            </span>
            <strong>{name}</strong>
            <small>{description}</small>
            <span className="radio-dot" />
          </button>
        ))}
      </div>
      <div className="booking-payment">
        <Wallet size={17} />
        <Select
          label="Pembayaran"
          value={payment}
          onChange={(event) => setPayment(event.target.value === 'cash' ? 'cash' : 'qris')}
        >
          <option value="cash">Tunai</option>
          <option value="qris">QRIS demo</option>
        </Select>
        <strong>{destination ? money(quote.fare) : '—'}</strong>
      </div>
      {destination && (
        <div className="quote-detail">
          <span>
            {quote.distance} km · ± {quote.minutes} menit
          </span>
          <span>Estimasi demo</span>
        </div>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="full-width">
        Cari rider <ArrowRight size={17} />
      </Button>
      <p className="booking-footnote">
        <ShieldCheck size={12} />
        Tarif terlihat di awal, perjalanan lebih tenang.
      </p>
    </form>
  )
}

export function CustomerDashboard() {
  const { state } = useApp()
  const [route, setRoute] = useState({ pickup: 'ugm', destination: 'malioboro' })
  const [selected, setSelected] = useState<Trip | null>(null)
  const active = activeCustomer(state)
  const recent = roleTrips(state, 'customer')
    .filter((trip) => ['completed', 'cancelled'].includes(trip.status))
    .slice(0, 3)
  const unrated = recent.find((trip) => trip.status === 'completed' && !trip.rating)
  const hour = new Date().getHours()
  const greeting = hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 18 ? 'sore' : 'malam'
  return (
    <>
      <div className="dashboard-intro">
        <div>
          <h1>
            Selamat {greeting}, {state.profiles.customer.name.split(' ')[0]} <Sun size={23} />
          </h1>
          <p>Hari baru, tujuan baru. Mau ke mana hari ini?</p>
        </div>
        <span className="today-date">
          {new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(new Date())}
        </span>
      </div>
      <div className="dashboard-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="live-dot" /> DEKAT, NYAMAN, SAMPAI TUJUAN.
          </span>
          <h2>
            Ke mana pun tujuanmu,
            <br />
            <span>temu teman jalanmu.</span>
          </h2>
          <p>
            Dari rutinitas pagi sampai rencana spontan.
            <br />
            Temu Kopling siap menemani langkahmu.
          </p>
          <a href="#booking" className="hero-link">
            Yuk, mulai perjalanan <ArrowUpRight size={17} />
          </a>
        </div>
        <img
          src="/scooter.webp"
          alt="Skuter hijau Temu Kopling dengan helm, siap menemani perjalanan"
          className="hero-scooter"
        />
        <div className="hero-image-tag">
          <ShieldCheck size={15} />
          Lebih tenang di setiap jalan
        </div>
      </div>
      <div className="journey-section-heading" id="booking">
        <div>
          <span className="section-kicker">PERJALANAN YANG LEBIH MUDAH</span>
          <h2>
            {active ? 'Teman jalanmu, selangkah lagi.' : 'Tentukan tujuan. Kami temani jalannya.'}
          </h2>
        </div>
        <Badge>
          <MapPin size={12} /> Jelajahi Yogyakarta
        </Badge>
      </div>
      <div className="booking-layout">
        <Card className="booking-card">
          {active ? (
            <ActiveTripPanel trip={active} role="customer" />
          ) : (
            <BookingForm onRoute={(pickup, destination) => setRoute({ pickup, destination })} />
          )}
        </Card>
        <MapPanel
          pickup={active?.pickup ?? route.pickup}
          destination={active?.destination ?? route.destination}
          active={!!active}
        />
      </div>
      {unrated && (
        <div className="rating-reminder">
          <Sparkles size={20} />
          <div>
            <strong>Terima kasih sudah berjalan bersama.</strong>
            <p>Bagaimana perjalanan terakhir kamu?</p>
          </div>
          <Button variant="secondary" onClick={() => setSelected(unrated)}>
            Beri rating <ArrowRight size={14} />
          </Button>
        </div>
      )}
      <div className="dashboard-lower">
        <section className="recent-trips">
          <div className="section-heading">
            <div>
              <h2>Perjalanan terakhir</h2>
              <p className="muted">Cerita kecil dari perjalananmu.</p>
            </div>
            <Link className="text-link" to="/app/history">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="recent-trip-list">
            {recent.length ? (
              recent.map((trip) => (
                <TripCard trip={trip} key={trip.id} onClick={() => setSelected(trip)} />
              ))
            ) : (
              <EmptyState
                title="Perjalanan pertamamu menunggu"
                description="Pesan perjalanan, dan cerita perjalananmu akan tersimpan di sini."
              />
            )}
          </div>
        </section>
        <aside className="eco-note">
          <span className="eco-icon">
            <Leaf size={23} />
          </span>
          <h3>
            Jalan bareng.
            <br />
            Hari lebih ringan.
          </h3>
          <p>Tak perlu repot cari parkir. Duduk nyaman, nikmati kotamu dari sudut yang berbeda.</p>
          <span>
            SEDIKIT REPOT, BANYAK CERITA <ArrowUpRight size={16} />
          </span>
        </aside>
      </div>
      <div className="trust-strip">
        <span>
          <ShieldCheck size={17} />
          Detail rider yang jelas
        </span>
        <span>
          <Wallet size={17} />
          Estimasi di awal
        </span>
        <span>
          <Clock3 size={17} />
          Status perjalanan yang mudah diikuti
        </span>
      </div>
      {selected && (
        <TripDetails
          trip={state.trips.find((trip) => trip.id === selected.id) ?? selected}
          role="customer"
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

export function CustomerTrips() {
  const { state } = useApp()
  const active = activeCustomer(state)
  const completed = roleTrips(state, 'customer').find(
    (trip) => trip.status === 'completed' && !trip.rating,
  )
  return (
    <>
      <PageHeading
        eyebrow="SETIAP LANGKAH, TETAP TERHUBUNG"
        title="Perjalananmu"
        description="Semua yang kamu butuhkan, dari titik jemput sampai tujuan."
        action={
          <Link to="/app/history" className="button button-secondary">
            Lihat riwayat <ArrowRight size={16} />
          </Link>
        }
      />
      {active ? (
        <div className="booking-layout">
          <Card>
            <ActiveTripPanel trip={active} role="customer" />
          </Card>
          <MapPanel active pickup={active.pickup} destination={active.destination} />
        </div>
      ) : completed ? (
        <Card>
          <CompletionCard trip={completed} />
        </Card>
      ) : (
        <Card>
          <EmptyState
            title="Tujuan berikutnya menunggumu"
            description="Belum ada perjalanan aktif. Tentukan tujuan dan temukan teman jalanmu."
            action={
              <Link className="button button-primary" to="/app">
                Pesan perjalanan <ArrowRight size={16} />
              </Link>
            }
          />
        </Card>
      )}
    </>
  )
}
