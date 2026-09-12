import { useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Bike,
  Clock3,
  Coffee,
  CreditCard,
  Radio,
  Route,
  Star,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/context'
import { activeRider, money, roleTrips } from '../lib/model'
import { ActiveTripPanel, RideRequestCard } from '../components/TripFlow'
import { MapPanel } from '../components/MapPanel'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeading,
  Select,
  StatsCard,
  StatusIndicator,
} from '../components/ui'
import { TripHistory } from './Shared'

function OnlineControl() {
  const { state, dispatch, toast } = useApp()
  return (
    <button
      className={`online-control ${state.online ? 'enabled' : ''}`}
      role="switch"
      aria-label="Status ketersediaan rider"
      aria-checked={state.online}
      onClick={() => {
        dispatch({ type: 'online', value: !state.online })
        toast(
          state.online
            ? 'Kamu offline. Permintaan baru dijeda.'
            : 'Kamu online. Siap menerima perjalanan demo.',
        )
      }}
    >
      <StatusIndicator online={state.online} />
      <span className={`switch ${state.online ? 'on' : ''}`}>
        <span />
      </span>
    </button>
  )
}

function RequestList({ limit }: { limit?: number }) {
  const { state, dispatch } = useApp()
  const requests = state.trips.filter((trip) => trip.status === 'searching' && !trip.assigned)
  if (!state.online)
    return (
      <Card>
        <EmptyState
          icon={Coffee}
          title="Ambil jeda, atau mulai harimu."
          description="Kamu sedang offline. Aktifkan status online untuk melihat permintaan perjalanan demo."
          action={
            <Button onClick={() => dispatch({ type: 'online', value: true })}>
              Aktifkan status online <Radio size={16} />
            </Button>
          }
        />
      </Card>
    )
  if (!requests.length)
    return (
      <Card>
        <EmptyState
          icon={Radio}
          title="Semua permintaan sudah ditangani"
          description="Buat pesanan dari akun customer untuk mencoba permintaan baru, atau reset data demo dari profil."
          action={
            <Link className="button button-secondary" to="/rider/profile">
              Buka pengaturan demo
            </Link>
          }
        />
      </Card>
    )
  return (
    <div className="request-grid">
      {requests.slice(0, limit).map((trip) => (
        <RideRequestCard key={trip.id} trip={trip} />
      ))}
    </div>
  )
}

export function RiderDashboard() {
  const { state } = useApp()
  const active = activeRider(state)
  const trips = roleTrips(state, 'rider').filter((trip) => trip.status === 'completed')
  const today = trips.filter(
    (trip) =>
      new Date(trip.completedAt ?? trip.createdAt).toDateString() === new Date().toDateString(),
  )
  const earnings = today.reduce((sum, trip) => sum + trip.fare, 0)
  const rated = trips.filter((trip) => trip.rating)
  const rating = rated.length
    ? (rated.reduce((sum, trip) => sum + (trip.rating ?? 0), 0) / rated.length)
        .toFixed(1)
        .replace('.', ',')
    : '—'
  return (
    <>
      <PageHeading
        eyebrow="MITRA TEMU KOPLING"
        title={`Selamat bekerja, ${state.profiles.rider.name.split(' ')[0]}.`}
        description="Satu perjalanan baik, satu hari yang lebih berarti."
        action={<OnlineControl />}
      />
      <div className="rider-banner">
        <div>
          <Badge tone="success">
            <span className="live-dot" />
            {state.online ? 'SIAP MENERIMA PERJALANAN' : 'WAKTUNYA ATUR LANGKAHMU'}
          </Badge>
          <h2>
            {active ? 'Ada yang menanti perjalananmu.' : 'Jalanmu, waktumu.\nKamu yang tentukan.'}
          </h2>
          <p>
            {active
              ? 'Pastikan penumpang dan titik jemput sesuai sebelum berangkat.'
              : 'Aktifkan status online dan temukan permintaan di sekitarmu.'}
          </p>
        </div>
        <Bike size={115} strokeWidth={1} />
        <span className="rider-banner-line" />
      </div>
      <div className="stats-strip">
        <StatsCard
          label="Perjalanan hari ini"
          value={String(today.length)}
          icon={Route}
          detail="Perjalanan demo selesai"
        />
        <StatsCard
          label="Pendapatan hari ini"
          value={money(earnings)}
          icon={Wallet}
          detail="Total tarif demo, sebelum potongan"
        />
        <StatsCard
          label="Rating perjalanan"
          value={rating}
          icon={Star}
          detail={`${rated.length} penilaian demo`}
        />
        <StatsCard
          label="Permintaan tersedia"
          value={
            state.online
              ? String(state.trips.filter((trip) => trip.status === 'searching').length)
              : '—'
          }
          icon={Radio}
          detail={state.online ? 'Permintaan demo di area Jogja' : 'Aktifkan status online'}
        />
      </div>
      {active && (
        <>
          <div className="section-heading section-space">
            <h2>Perjalanan aktif</h2>
            <Link className="text-link" to="/rider/trips">
              Lihat detail <ArrowRight size={15} />
            </Link>
          </div>
          <div className="booking-layout">
            <Card>
              <ActiveTripPanel trip={active} role="rider" />
            </Card>
            <MapPanel pickup={active.pickup} destination={active.destination} active />
          </div>
        </>
      )}
      <div className="section-heading section-space">
        <div>
          <h2>Permintaan perjalanan</h2>
          <p className="muted">Informasi penting, keputusan lebih mudah.</p>
        </div>
        <Link className="text-link" to="/rider/requests">
          Lihat semua <ArrowUpRight size={15} />
        </Link>
      </div>
      <RequestList limit={2} />
      <div className="rider-bottom-note">
        <Clock3 size={19} />
        <div>
          <strong>Jangan lupa istirahat.</strong>
          <p>Keselamatan dan kenyamananmu tetap yang utama.</p>
        </div>
        <Badge>Teman di setiap jalan</Badge>
      </div>
    </>
  )
}

export function RiderRequests() {
  return (
    <>
      <PageHeading
        eyebrow="PELUANG DI SEKITARMU"
        title="Permintaan perjalanan"
        description="Lihat titik jemput, tujuan, dan estimasi sebelum menerima."
        action={<OnlineControl />}
      />
      <RequestList />
    </>
  )
}

export function RiderTrips() {
  const { state } = useApp()
  const active = activeRider(state)
  return (
    <>
      <PageHeading
        title="Perjalanan"
        description="Pantau perjalanan aktif dan lihat perjalanan yang sudah selesai."
      />
      {active ? (
        <div className="booking-layout">
          <Card>
            <ActiveTripPanel trip={active} role="rider" />
          </Card>
          <MapPanel pickup={active.pickup} destination={active.destination} active />
        </div>
      ) : (
        <Card>
          <EmptyState
            title="Siap untuk tujuan berikutnya?"
            description="Belum ada perjalanan aktif. Terima permintaan untuk mulai menemani penumpang."
            action={
              <Link className="button button-primary" to="/rider/requests">
                Lihat permintaan <ArrowRight size={16} />
              </Link>
            }
          />
        </Card>
      )}
      <div className="section-heading section-space">
        <h2>Riwayat perjalanan</h2>
      </div>
      <TripHistory role="rider" compact />
    </>
  )
}

export function RiderEarnings() {
  const { state } = useApp()
  const [period, setPeriod] = useState('7')
  const all = roleTrips(state, 'rider').filter((trip) => trip.status === 'completed')
  const trips = all.filter(
    (trip) =>
      new Date(trip.completedAt ?? trip.createdAt).getTime() >=
      Date.now() - Number(period) * 86400000,
  )
  const total = trips.reduce((sum, trip) => sum + trip.fare, 0)
  const cash = trips
    .filter((trip) => trip.payment === 'cash')
    .reduce((sum, trip) => sum + trip.fare, 0)
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const value = all
      .filter(
        (trip) =>
          new Date(trip.completedAt ?? trip.createdAt).toDateString() === date.toDateString(),
      )
      .reduce((sum, trip) => sum + trip.fare, 0)
    return { date, value }
  })
  const max = Math.max(...days.map((day) => day.value), 1)
  return (
    <>
      <PageHeading
        eyebrow="HASIL DARI SETIAP PERJALANAN"
        title="Pendapatan"
        description="Ringkasan yang jelas untuk hari kerja yang lebih terarah."
        action={
          <Select
            label="Periode pendapatan"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option value="7">7 hari terakhir</option>
            <option value="30">30 hari terakhir</option>
          </Select>
        }
      />
      <div className="earnings-summary">
        <div className="earnings-total">
          <span>TOTAL PENDAPATAN DEMO</span>
          <h2>{money(total)}</h2>
          <p>Dari {trips.length} perjalanan selesai</p>
          <Badge>Belum ada transaksi nyata</Badge>
        </div>
        <div className="earnings-breakdown">
          <StatsCard label="Tunai" value={money(cash)} icon={Wallet} />
          <StatsCard label="QRIS demo" value={money(total - cash)} icon={CreditCard} />
          <p>Total tarif ilustrasi sebelum biaya platform. Pencairan dana belum tersedia.</p>
        </div>
      </div>
      <Card className="earnings-chart">
        <div className="section-heading">
          <div>
            <h2>Setiap perjalanan berarti</h2>
            <p className="muted">Total tarif demo per hari · 7 hari terakhir</p>
          </div>
          <Badge tone="success">
            <Route size={12} />
            {
              all.filter(
                (trip) =>
                  new Date(trip.completedAt ?? trip.createdAt).getTime() >=
                  Date.now() - 7 * 86400000,
              ).length
            }{' '}
            perjalanan
          </Badge>
        </div>
        <div
          className="bar-chart"
          role="img"
          aria-label={`Pendapatan 7 hari: ${days.map((day) => `${day.date.toLocaleDateString('id-ID')}: ${money(day.value)}`).join('; ')}`}
        >
          {days.map((day, index) => (
            <div className={`chart-column ${index === 6 ? 'today' : ''}`} key={index}>
              <span>{day.value ? money(day.value) : '—'}</span>
              <div className="bar-track">
                <div
                  className="bar"
                  style={{ height: `${Math.max(2, (day.value / max) * 100)}%` }}
                />
              </div>
              <small>
                {index === 6
                  ? 'Hari ini'
                  : new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(day.date)}
              </small>
            </div>
          ))}
        </div>
      </Card>
      <div className="section-heading section-space">
        <h2>Detail perjalanan</h2>
      </div>
      <TripHistory role="rider" compact />
    </>
  )
}
