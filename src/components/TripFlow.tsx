import { useState } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  MessageCircle,
  Navigation,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { useApp } from '../lib/context'
import { activeRider, money, place, statusLabels, tripDate } from '../lib/model'
import type { Role, Trip } from '../lib/model'
import { Avatar, Badge, Button, Dialog, DriverCard, Modal, RouteSummary } from './ui'

export function RatingForm({ trip }: { trip: Trip }) {
  const { dispatch, toast } = useApp()
  const [rating, setRating] = useState(0)
  return (
    <div className="rating-form">
      <h3>Bagaimana perjalananmu?</h3>
      <p>Masukanmu membantu kami membuat perjalanan lebih nyaman.</p>
      <div className="rating-stars" role="group" aria-label="Pilih rating perjalanan">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            aria-label={`${value} bintang`}
            aria-pressed={rating === value}
            onClick={() => setRating(value)}
          >
            <Star size={30} fill={value <= rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
      <Button
        disabled={!rating}
        onClick={() => {
          dispatch({ type: 'rate', id: trip.id, rating })
          toast('Terima kasih! Rating perjalananmu sudah disimpan.')
        }}
      >
        Kirim rating <ArrowRight size={16} />
      </Button>
    </div>
  )
}

export function TripDetails({
  trip,
  role,
  onClose,
}: {
  trip: Trip
  role: Role
  onClose: () => void
}) {
  return (
    <Modal title="Detail perjalanan" onClose={onClose}>
      <div className="trip-detail-meta">
        <span>{trip.id}</span>
        <Badge
          tone={
            trip.status === 'cancelled' ? 'error' : trip.status === 'completed' ? 'success' : 'info'
          }
        >
          {statusLabels[trip.status]}
        </Badge>
      </div>
      <RouteSummary pickup={trip.pickup} destination={trip.destination} />
      <div className="receipt">
        <div>
          <span>Waktu pemesanan</span>
          <strong>{tripDate(trip.createdAt)}</strong>
        </div>
        <div>
          <span>Layanan</span>
          <strong>{trip.service === 'motor' ? 'Temu Motor' : 'Temu Mobil'}</strong>
        </div>
        <div>
          <span>Jarak ilustrasi</span>
          <strong>{trip.distance} km</strong>
        </div>
        <div>
          <span>Pembayaran demo</span>
          <strong>{trip.payment === 'cash' ? 'Tunai' : 'QRIS'}</strong>
        </div>
        <div className="receipt-total">
          <span>{trip.status === 'cancelled' ? 'Estimasi (dibatalkan)' : 'Total perjalanan'}</span>
          <strong>{money(trip.fare)}</strong>
        </div>
      </div>
      {trip.rating ? (
        <p className="rated">
          <Star size={16} fill="currentColor" /> {trip.rating}/5 · Terima kasih untuk penilaiannya.
        </p>
      ) : trip.status === 'completed' && role === 'customer' ? (
        <RatingForm trip={trip} />
      ) : null}
      <p className="demo-note">Ringkasan demo. Tidak ada transaksi atau perjalanan nyata.</p>
    </Modal>
  )
}

export function ActiveTripPanel({ trip, role }: { trip: Trip; role: Role }) {
  const { state, dispatch, toast } = useApp()
  const [cancel, setCancel] = useState(false)
  const [contact, setContact] = useState(false)
  const driver = state.profiles.rider
  const steps = [
    { status: 'searching', label: 'Mencari rider' },
    { status: 'accepted', label: 'Penjemputan' },
    { status: 'in_progress', label: 'Perjalanan' },
    { status: 'completed', label: 'Selesai' },
  ]
  const step =
    trip.status === 'arrived' ? 1 : steps.findIndex((item) => item.status === trip.status)
  const next: Record<string, { status: Trip['status']; label: string }> = {
    searching: { status: 'accepted', label: 'Simulasikan rider menerima' },
    accepted: {
      status: 'arrived',
      label: role === 'rider' ? 'Saya sudah tiba' : 'Simulasikan rider tiba',
    },
    arrived: {
      status: 'in_progress',
      label: role === 'rider' ? 'Mulai perjalanan' : 'Simulasikan berangkat',
    },
    in_progress: {
      status: 'completed',
      label: role === 'rider' ? 'Selesaikan perjalanan' : 'Simulasikan selesai',
    },
  }
  const action = next[trip.status]
  const busy = trip.status === 'searching' && !!activeRider(state)
  return (
    <div className="active-trip-panel">
      <div className="section-heading">
        <span className="eyebrow">PERJALANAN AKTIF</span>
        <Badge tone="success">
          <span className="live-dot" />
          {trip.id}
        </Badge>
      </div>
      <h2>
        {statusLabels[trip.status]}
        {trip.status === 'searching' && <LoaderCircle size={20} className="spin" />}
      </h2>
      <p className="muted">
        {trip.status === 'searching'
          ? 'Kami sedang menyiapkan teman perjalananmu.'
          : trip.status === 'accepted'
            ? 'Bersiap, rider sedang menuju titik jemput.'
            : trip.status === 'arrived'
              ? 'Rider menunggu di titik jemput. Pastikan kendaraan sesuai.'
              : 'Nikmati perjalanan. Semoga harimu menyenangkan.'}
      </p>
      <ol className="trip-progress">
        {steps.map((item, index) => (
          <li
            key={item.status}
            className={index <= step ? 'done' : ''}
            aria-current={index === step ? 'step' : undefined}
          >
            <span>{index < step ? <Check size={13} /> : index + 1}</span>
            <small>{item.label}</small>
          </li>
        ))}
      </ol>
      <RouteSummary pickup={trip.pickup} destination={trip.destination} />
      {role === 'customer' && trip.assigned ? (
        <DriverCard
          name={driver.name}
          vehicle={trip.service === 'car' ? 'Toyota Avanza · Putih (demo)' : driver.vehicle}
          plate={trip.service === 'car' ? 'AB 1088 TK' : driver.plate}
          onContact={() => setContact(true)}
        />
      ) : role === 'rider' ? (
        <div className="passenger">
          <Avatar name={trip.passenger} size="small" />
          <strong>{trip.passenger}</strong>
          <Button variant="ghost" onClick={() => setContact(true)}>
            <MessageCircle size={17} />
            Hubungi
          </Button>
        </div>
      ) : null}
      <div className="trip-estimate">
        <span>
          <Navigation size={15} />
          {trip.distance} km
        </span>
        <span>
          <Clock3 size={15} />± {Math.ceil(trip.distance * 3)} menit
        </span>
        <strong>{money(trip.fare)}</strong>
      </div>
      {action && (
        <Button
          className="full-width"
          disabled={busy}
          onClick={() => {
            dispatch({
              type: 'transition',
              id: trip.id,
              status: action.status,
              date: new Date().toISOString(),
            })
            if (action.status === 'completed')
              toast('Perjalanan selesai. Ringkasan tersedia di riwayat.')
          }}
        >
          {action.label}
          <ArrowRight size={16} />
        </Button>
      )}
      {busy && (
        <p className="field-error">
          Rider demo masih menyelesaikan perjalanan lain. Beralih ke rider untuk menyelesaikannya.
        </p>
      )}
      {trip.status !== 'in_progress' && (
        <Button variant="ghost" className="full-width cancel-trip" onClick={() => setCancel(true)}>
          Batalkan perjalanan
        </Button>
      )}
      <p className="demo-note">
        <ShieldCheck size={13} />
        Status dan waktu tempuh disimulasikan.
      </p>
      {cancel && (
        <Dialog
          title="Batalkan perjalanan?"
          description="Perjalanan ini akan dibatalkan tanpa biaya. Kamu bisa memesan lagi kapan saja."
          confirmLabel="Ya, batalkan"
          onClose={() => setCancel(false)}
          onConfirm={() => {
            dispatch({
              type: 'transition',
              id: trip.id,
              status: 'cancelled',
              date: new Date().toISOString(),
            })
            setCancel(false)
            toast('Perjalanan dibatalkan. Sampai bertemu di perjalanan berikutnya.')
          }}
        />
      )}
      {contact && (
        <Modal
          title={role === 'customer' ? 'Hubungi rider' : 'Hubungi penumpang'}
          onClose={() => setContact(false)}
        >
          <div className="contact-preview">
            <Avatar name={role === 'customer' ? driver.name : trip.passenger} size="large" />
            <h3>{role === 'customer' ? driver.name : trip.passenger}</h3>
            <p>Titik jemput: {place(trip.pickup).name}</p>
          </div>
          <div className="info-box">
            <MessageCircle size={20} />
            <p>
              Chat dan telepon belum terhubung pada mode demo. Pada layanan langsung, kontak
              perjalanan akan tersedia di sini.
            </p>
          </div>
          <Button className="full-width" onClick={() => setContact(false)}>
            Mengerti
          </Button>
        </Modal>
      )}
    </div>
  )
}

export function RideRequestCard({ trip }: { trip: Trip }) {
  const { state, dispatch, toast } = useApp()
  const [decline, setDecline] = useState(false)
  const busy = !!activeRider(state)
  return (
    <article className="ride-request-card">
      <div className="section-heading">
        <Badge tone="success">
          <span className="live-dot" />
          PERMINTAAN BARU
        </Badge>
        <span className="muted">{trip.service === 'motor' ? 'Temu Motor' : 'Temu Mobil'}</span>
      </div>
      <div className="request-passenger">
        <Avatar name={trip.passenger} size="small" />
        <strong>{trip.passenger}</strong>
        <span className="muted">· Akun demo</span>
      </div>
      <RouteSummary pickup={trip.pickup} destination={trip.destination} />
      <div className="request-fare">
        <div>
          <span>Jarak perjalanan</span>
          <strong>
            {trip.distance} <small>km</small>
          </strong>
        </div>
        <div>
          <span>Estimasi pendapatan</span>
          <strong>{money(trip.fare)}</strong>
        </div>
      </div>
      <p className="payment-method">
        <CreditCard size={15} />
        {trip.payment === 'cash' ? 'Pembayaran tunai' : 'QRIS demo'}
      </p>
      <div className="request-actions">
        <Button variant="secondary" onClick={() => setDecline(true)}>
          Tolak
        </Button>
        <Button
          disabled={busy || !state.online}
          onClick={() => {
            dispatch({
              type: 'transition',
              id: trip.id,
              status: 'accepted',
              date: new Date().toISOString(),
            })
            toast('Permintaan diterima. Menuju titik jemput, yuk!')
          }}
        >
          Terima perjalanan <ArrowRight size={16} />
        </Button>
      </div>
      {busy && (
        <small className="muted">Selesaikan perjalanan aktif untuk menerima yang baru.</small>
      )}
      {decline && (
        <Dialog
          title="Tolak permintaan ini?"
          description="Permintaan ini akan dihapus dari daftar demo. Perjalanan lain tetap tersedia."
          confirmLabel="Tolak permintaan"
          onClose={() => setDecline(false)}
          onConfirm={() => {
            dispatch({ type: 'decline', id: trip.id, date: new Date().toISOString() })
            setDecline(false)
            toast('Permintaan ditolak.')
          }}
        />
      )}
    </article>
  )
}

export function CompletionCard({ trip }: { trip: Trip }) {
  return (
    <div className="completion-card">
      <CheckCircle2 size={34} />
      <h2>Sudah sampai. Terima kasih!</h2>
      <p>
        {place(trip.destination).name} · {money(trip.fare)}
      </p>
      <RatingForm trip={trip} />
    </div>
  )
}
