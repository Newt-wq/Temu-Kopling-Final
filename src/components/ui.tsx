import { useEffect, useId, useRef } from 'react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'
import { ArrowRight, Bike, Check, ChevronRight, MapPin, Route, Star, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { money, place, statusLabels, tripDate } from '../lib/model'
import type { Trip } from '../lib/model'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? 'brand-compact' : ''}`}>
      <svg viewBox="0 0 40 40" width="37" height="37" aria-hidden="true">
        <rect width="40" height="40" rx="12" fill="currentColor" />
        <path
          d="M11 14h11a6 6 0 0 1 0 12H12m8-12-6 12m-3-12 3-4m-2 16-3 4"
          fill="none"
          stroke="var(--brand-mark-ink)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!compact && (
        <span>
          temu<span className="brand-light">kopling</span>
          <span className="brand-period">.</span>
        </span>
      )}
    </span>
  )
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  children: ReactNode
}) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}
export function Input({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  )
}
export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select {...props} id={id}>
        {children}
      </select>
    </div>
  )
}
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'success' | 'warning' | 'error' | 'neutral' | 'info'
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
export function StatusIndicator({ online }: { online: boolean }) {
  return (
    <span className={`status-indicator ${online ? 'is-online' : ''}`}>
      <span />
      {online ? 'Online' : 'Offline'}
    </span>
  )
}
export function Avatar({
  name,
  size = 'medium',
}: {
  name: string
  size?: 'small' | 'medium' | 'large'
}) {
  return (
    <span className={`avatar avatar-${size}`} aria-label={name}>
      {name
        .split(' ')
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase()}
    </span>
  )
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])
  return (
    <dialog
      className="modal"
      ref={ref}
      aria-labelledby={id}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal-inner">
        <div className="section-heading">
          <h2 id={id}>{title}</h2>
          <button className="icon-button" aria-label="Tutup dialog" onClick={onClose}>
            <X size={21} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
export function Dialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="muted">{description}</p>
      <div className="dialog-actions">
        <Button variant="secondary" onClick={onClose}>
          Kembali
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Route,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: LucideIcon
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={27} strokeWidth={1.5} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}
export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="loading-skeleton" role="status" aria-label="Memuat halaman">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton" />
      ))}
      <span className="sr-only">Sedang memuat…</span>
    </div>
  )
}
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          aria-pressed={value === option.value}
          className={value === option.value ? 'selected' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
export function StatsCard({
  label,
  value,
  icon: Icon,
  detail,
}: {
  label: string
  value: string
  icon: LucideIcon
  detail?: string
}) {
  return (
    <div className="stats-item">
      <span className="stats-label">
        <Icon size={17} />
        {label}
      </span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  )
}
export function UserCard({
  name,
  subtitle,
  children,
}: {
  name: string
  subtitle: string
  children?: ReactNode
}) {
  return (
    <div className="user-card">
      <Avatar name={name} />
      <div>
        <strong>{name}</strong>
        <p>{subtitle}</p>
      </div>
      {children}
    </div>
  )
}
export function DriverCard({
  name,
  vehicle,
  plate,
  onContact,
}: {
  name: string
  vehicle: string
  plate: string
  onContact: () => void
}) {
  return (
    <div className="driver-card">
      <UserCard name={name} subtitle={vehicle}>
        <span className="driver-rating">
          <Star size={13} fill="currentColor" /> 4,9
        </span>
      </UserCard>
      <div className="driver-bottom">
        <span className="plate">{plate}</span>
        <button className="text-button" onClick={onContact}>
          Hubungi rider <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
export function RouteSummary({ pickup, destination }: { pickup: string; destination: string }) {
  return (
    <div className="route-summary">
      <div>
        <span className="route-dot" />
        <div>
          <small>TITIK JEMPUT</small>
          <strong>{place(pickup).name}</strong>
          <span>{place(pickup).address}</span>
        </div>
      </div>
      <div>
        <MapPin size={17} />
        <div>
          <small>TUJUAN</small>
          <strong>{place(destination).name}</strong>
          <span>{place(destination).address}</span>
        </div>
      </div>
    </div>
  )
}
export function TripCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  return (
    <button className="trip-row" onClick={onClick}>
      <span className="trip-icon">
        <Bike size={20} />
      </span>
      <span className="trip-row-main">
        <strong>{place(trip.destination).name}</strong>
        <span>
          {place(trip.pickup).name}{' '}
          <span className="mobile-trip-date">· {tripDate(trip.createdAt)}</span>
        </span>
      </span>
      <span className="trip-row-date">{tripDate(trip.createdAt)}</span>
      <Badge
        tone={
          trip.status === 'completed' ? 'success' : trip.status === 'cancelled' ? 'error' : 'info'
        }
      >
        {trip.status === 'completed' && <Check size={11} />}
        {statusLabels[trip.status]}
      </Badge>
      <strong className="trip-price">{money(trip.fare)}</strong>
      <ChevronRight size={17} className="muted" />
    </button>
  )
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}
export function NotFound() {
  return (
    <main className="not-found">
      <Brand />
      <EmptyState
        title="Sepertinya kamu salah jalan."
        description="Halaman ini tidak ditemukan. Yuk, kembali ke beranda."
        action={
          <Link className="button button-primary" to="/">
            Kembali ke beranda <ArrowRight size={16} />
          </Link>
        }
      />
    </main>
  )
}
