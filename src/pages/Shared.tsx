import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  Bell,
  CheckCheck,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Download,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RotateCcw,
  Route,
  Search,
  Settings2,
  ShieldCheck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../lib/context'
import { money, place, roleTrips, statusLabels, tripDate } from '../lib/model'
import type { Role, Trip } from '../lib/model'
import { TripDetails } from '../components/TripFlow'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  Input,
  Modal,
  PageHeading,
  Select,
  Tabs,
  TripCard,
} from '../components/ui'

export function TripHistory({ role, compact = false }: { role: Role; compact?: boolean }) {
  const { state, toast } = useApp()
  const [status, setStatus] = useState('all')
  const [period, setPeriod] = useState('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Trip | null>(null)
  const history = roleTrips(state, role).filter((trip) =>
    ['completed', 'cancelled'].includes(trip.status),
  )
  const filtered = history.filter((trip) => {
    const matchStatus = status === 'all' || trip.status === status
    const matchPeriod =
      period === 'all' ||
      new Date(trip.createdAt).getTime() >= Date.now() - Number(period) * 86400000
    const matchSearch = `${trip.id} ${place(trip.pickup).name} ${place(trip.destination).name}`
      .toLowerCase()
      .includes(query.toLowerCase())
    return matchStatus && matchPeriod && matchSearch
  })
  const exportCsv = () => {
    const rows = [
      ['ID', 'Tanggal', 'Jemput', 'Tujuan', 'Status', 'Tarif IDR'],
      ...filtered.map((trip) => [
        trip.id,
        trip.createdAt,
        place(trip.pickup).name,
        place(trip.destination).name,
        statusLabels[trip.status],
        trip.fare.toString(),
      ]),
    ]
    const content = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(
      new Blob(['\ufeff', content], { type: 'text/csv;charset=utf-8;' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = 'temu-kopling-riwayat-demo.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast('Ringkasan perjalanan demo berhasil diunduh.')
  }
  return (
    <>
      {!compact && (
        <PageHeading
          eyebrow="CERITA PERJALANANMU"
          title="Riwayat perjalanan"
          description="Setiap tujuan menyimpan cerita. Temukan kembali perjalananmu di sini."
          action={
            <Button variant="secondary" disabled={!filtered.length} onClick={exportCsv}>
              <Download size={16} />
              Unduh ringkasan
            </Button>
          }
        />
      )}
      <section className="history-section">
        <div className="history-toolbar">
          <Tabs
            label="Filter status perjalanan"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'Semua' },
              { value: 'completed', label: 'Selesai' },
              { value: 'cancelled', label: 'Dibatalkan' },
            ]}
          />
          <div className="history-filters">
            <div className="search-input">
              <Search size={16} />
              <input
                aria-label="Cari perjalanan"
                placeholder="Cari tujuan atau ID…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Select
              label="Rentang waktu"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="all">Semua waktu</option>
              <option value="7">7 hari terakhir</option>
              <option value="30">30 hari terakhir</option>
            </Select>
          </div>
        </div>
        {!filtered.length ? (
          <EmptyState
            title={history.length ? 'Perjalanan belum ditemukan' : 'Belum ada cerita perjalanan'}
            description={
              history.length
                ? 'Coba kata kunci lain atau sesuaikan filter perjalananmu.'
                : 'Perjalanan yang kamu selesaikan akan tersimpan di sini.'
            }
            action={
              history.length ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('')
                    setStatus('all')
                    setPeriod('all')
                  }}
                >
                  Reset filter
                </Button>
              ) : (
                <Link
                  className="button button-primary"
                  to={role === 'customer' ? '/app' : '/rider/requests'}
                >
                  {role === 'customer' ? 'Pesan perjalanan' : 'Lihat permintaan'}
                  <ArrowRight size={15} />
                </Link>
              )
            }
          />
        ) : (
          <>
            <table className="history-table">
              <caption className="sr-only">Daftar riwayat perjalanan</caption>
              <thead>
                <tr>
                  <th scope="col">Perjalanan</th>
                  <th scope="col">Tanggal</th>
                  <th scope="col">Status</th>
                  <th scope="col">Total</th>
                  <th scope="col">
                    <span className="sr-only">Detail</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((trip) => (
                  <tr key={trip.id}>
                    <td>
                      <strong>{place(trip.destination).name}</strong>
                      <span>{place(trip.pickup).name}</span>
                    </td>
                    <td>{tripDate(trip.createdAt)}</td>
                    <td>
                      <Badge tone={trip.status === 'completed' ? 'success' : 'error'}>
                        {statusLabels[trip.status]}
                      </Badge>
                    </td>
                    <td className="table-fare">{money(trip.fare)}</td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={`Detail perjalanan ${trip.id}`}
                        onClick={() => setSelected(trip)}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mobile-history">
              {filtered.map((trip) => (
                <TripCard key={trip.id} trip={trip} onClick={() => setSelected(trip)} />
              ))}
            </div>
            <div className="history-count">
              {filtered.length} perjalanan ditampilkan <span>Data demo</span>
            </div>
          </>
        )}
      </section>
      {selected && (
        <TripDetails
          trip={state.trips.find((trip) => trip.id === selected.id) ?? selected}
          role={role}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

export function Notifications({ role }: { role: Role }) {
  const { state, dispatch } = useApp()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<AppNotice | null>(null)
  type AppNotice = (typeof state.notifications)[number]
  const all = state.notifications.filter((notice) => notice.role === role)
  const notices = all.filter((notice) => filter === 'all' || notice.category === filter)
  const unread = all.filter((notice) => !notice.read).length
  return (
    <>
      <PageHeading
        eyebrow="TETAP TERHUBUNG"
        title="Notifikasi"
        description="Kabar terbaru tentang perjalanan dan akunmu, dalam satu tempat."
        action={
          <Button
            variant="secondary"
            disabled={unread === 0}
            onClick={() => dispatch({ type: 'read', role })}
          >
            <CheckCheck size={17} />
            Tandai semua dibaca
          </Button>
        }
      />
      <Tabs
        label="Kategori notifikasi"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: `Semua${unread ? ` (${unread})` : ''}` },
          { value: 'trip', label: 'Perjalanan' },
          { value: 'payment', label: 'Pembayaran' },
          { value: 'system', label: 'Sistem' },
        ]}
      />
      <div className="notifications-list">
        {notices.length ? (
          notices.map((notice) => (
            <button
              key={notice.id}
              className={`notification-row ${!notice.read ? 'unread' : ''}`}
              onClick={() => {
                dispatch({ type: 'read', role, id: notice.id })
                setSelected(notice)
              }}
            >
              <span className="notification-icon">
                {notice.category === 'trip' ? (
                  <Route size={22} />
                ) : notice.category === 'payment' ? (
                  <CreditCard size={22} />
                ) : (
                  <Bell size={22} />
                )}
              </span>
              <span className="notification-content">
                <strong>
                  {notice.title}
                  {!notice.read && <span className="unread-dot" />}
                </strong>
                <span>{notice.body}</span>
                <small>{tripDate(notice.date)}</small>
              </span>
              <ChevronRight size={17} />
            </button>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title="Belum ada kabar baru"
            description="Kabar terbaru untuk kategori ini akan muncul di sini. Kamu tidak melewatkan apa pun."
          />
        )}
      </div>
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <p className="muted">{selected.body}</p>
          <p className="demo-note">{tripDate(selected.date)}</p>
          <Button className="full-width" onClick={() => setSelected(null)}>
            Mengerti
          </Button>
        </Modal>
      )}
    </>
  )
}

export function ProfilePage({ role }: { role: Role }) {
  const { state, dispatch, toast } = useApp()
  const navigate = useNavigate()
  const profile = state.profiles[role]
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile)
  const [dialog, setDialog] = useState<'logout' | 'reset' | 'security' | null>(null)
  const trips = roleTrips(state, role).filter((trip) => trip.status === 'completed')
  const save = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.name.trim()) return
    dispatch({ type: 'profile', role, profile: { ...draft, name: draft.name.trim() } })
    setEditing(false)
    toast('Profil demo kamu berhasil diperbarui.')
  }
  return (
    <>
      <PageHeading
        eyebrow="RUANG PRIBADIMU"
        title="Profil saya"
        description="Atur informasi dan preferensimu untuk perjalanan yang lebih nyaman."
      />
      <div className="profile-grid">
        <Card className="profile-summary">
          <Avatar name={profile.name} size="large" />
          <h2>{profile.name}</h2>
          <Badge tone="success">
            {role === 'customer' ? 'Customer Temu Kopling' : 'Mitra rider'}
          </Badge>
          <p>
            <MapPin size={14} />
            Yogyakarta, Indonesia
          </p>
          <div className="profile-metrics">
            <div>
              <strong>{trips.length}</strong>
              <span>Perjalanan demo</span>
            </div>
            <div>
              <strong>{role === 'rider' ? '4,9' : 'Aktif'}</strong>
              <span>{role === 'rider' ? 'Rating ilustrasi' : 'Akun demo'}</span>
            </div>
          </div>
          <div className="profile-safety">
            <ShieldCheck size={21} />
            <p>Data ini tersimpan di browsermu. Gunakan informasi contoh untuk mencoba aplikasi.</p>
          </div>
          <Button variant="ghost" className="logout-button" onClick={() => setDialog('logout')}>
            <LogOut size={16} />
            Keluar dari akun
          </Button>
        </Card>
        <div className="profile-sections">
          <Card>
            <div className="section-heading">
              <h2>Informasi akun</h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setDraft(profile)
                  setEditing(true)
                }}
              >
                <Pencil size={15} />
                Edit profil
              </Button>
            </div>
            <dl className="profile-info">
              <div>
                <dt>Nama lengkap</dt>
                <dd>{profile.name}</dd>
              </div>
              <div>
                <dt>
                  <Mail size={14} />
                  Alamat email
                </dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>
                  <Phone size={14} />
                  Nomor telepon
                </dt>
                <dd>{profile.phone || 'Belum ditambahkan'}</dd>
              </div>
              <div>
                <dt>Jenis akun</dt>
                <dd>{role === 'customer' ? 'Customer' : 'Mitra rider'}</dd>
              </div>
            </dl>
          </Card>
          {role === 'rider' && (
            <Card>
              <div className="section-heading">
                <h2>Informasi kendaraan</h2>
                <Badge tone="warning">Data ilustrasi</Badge>
              </div>
              <dl className="profile-info">
                <div>
                  <dt>Kendaraan</dt>
                  <dd>{profile.vehicle}</dd>
                </div>
                <div>
                  <dt>Nomor polisi</dt>
                  <dd>
                    <span className="plate">{profile.plate}</span>
                  </dd>
                </div>
                <div>
                  <dt>Verifikasi SIM</dt>
                  <dd>Belum tersedia di demo</dd>
                </div>
              </dl>
            </Card>
          )}
          <Card>
            <div className="section-heading">
              <h2>Preferensi</h2>
              <Settings2 size={18} className="muted" />
            </div>
            {(
              [
                {
                  key: 'tripUpdates',
                  title: 'Pembaruan perjalanan',
                  description: 'Preferensi pemberitahuan status perjalanan.',
                },
                {
                  key: 'promotions',
                  title: 'Info dan penawaran',
                  description: 'Preferensi kabar dan penawaran Temu Kopling.',
                },
              ] as const
            ).map(({ key, title, description }) => (
              <div className="preference-row" key={key}>
                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
                <button
                  className={`switch ${state.preferences[key] ? 'on' : ''}`}
                  role="switch"
                  aria-checked={state.preferences[key]}
                  aria-label={title}
                  onClick={() => {
                    dispatch({ type: 'preference', key, value: !state.preferences[key] })
                    toast('Preferensi demo disimpan.')
                  }}
                >
                  <span />
                </button>
              </div>
            ))}
            <p className="demo-note">
              Preferensi disimpan lokal. Pengiriman push dan email belum terhubung.
            </p>
          </Card>
          <Card>
            <h2>Keamanan & pengaturan</h2>
            <button className="settings-link" onClick={() => setDialog('security')}>
              <ShieldCheck size={19} />
              <span>Keamanan akun</span>
              <ChevronRight size={17} />
            </button>
            <button className="settings-link" onClick={() => setDialog('reset')}>
              <RotateCcw size={19} />
              <span>Reset data demo</span>
              <ChevronRight size={17} />
            </button>
          </Card>
        </div>
      </div>
      {editing && (
        <Modal title="Edit profil" onClose={() => setEditing(false)}>
          <form className="profile-edit-form" onSubmit={save}>
            <Input
              label="Nama lengkap"
              value={draft.name}
              maxLength={60}
              required
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={draft.email}
              required
              onChange={(event) => setDraft({ ...draft, email: event.target.value })}
            />
            <Input
              label="Nomor telepon"
              type="tel"
              pattern="[0-9+ ()-]{8,20}"
              value={draft.phone}
              onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
            />
            {role === 'rider' && (
              <>
                <Input
                  label="Kendaraan"
                  required
                  maxLength={70}
                  value={draft.vehicle}
                  onChange={(event) => setDraft({ ...draft, vehicle: event.target.value })}
                />
                <Input
                  label="Nomor polisi"
                  required
                  maxLength={16}
                  value={draft.plate}
                  onChange={(event) =>
                    setDraft({ ...draft, plate: event.target.value.toUpperCase() })
                  }
                />
              </>
            )}
            <p className="demo-note">Gunakan data contoh. Ini bukan verifikasi identitas.</p>
            <Button type="submit" className="full-width" disabled={!draft.name.trim()}>
              Simpan perubahan
            </Button>
          </form>
        </Modal>
      )}
      {dialog === 'logout' && (
        <Dialog
          title="Keluar dari Temu Kopling?"
          description="Data perjalanan demo tetap tersimpan di browser ini. Kamu bisa masuk lagi kapan saja."
          confirmLabel="Ya, keluar"
          onClose={() => setDialog(null)}
          onConfirm={() => {
            dispatch({ type: 'session', role: null })
            navigate('/')
          }}
        />
      )}
      {dialog === 'reset' && (
        <Dialog
          title="Mulai demo dari awal?"
          description="Semua perubahan profil, perjalanan, dan preferensi lokal akan dikembalikan ke data contoh. Kamu juga akan keluar."
          confirmLabel="Reset data demo"
          onClose={() => setDialog(null)}
          onConfirm={() => {
            dispatch({ type: 'reset' })
            navigate('/')
            toast('Data demo sudah direset.')
          }}
        />
      )}
      {dialog === 'security' && (
        <Modal title="Keamanan akun demo" onClose={() => setDialog(null)}>
          <div className="info-box">
            <CircleHelp size={22} />
            <p>
              Demo ini tidak menyimpan password dan tidak menggunakan autentikasi server. Perubahan
              password, verifikasi email, dan pengaturan keamanan tersedia setelah backend
              diintegrasikan.
            </p>
          </div>
          <Button className="full-width" onClick={() => setDialog(null)}>
            Mengerti
          </Button>
        </Modal>
      )}
    </>
  )
}
