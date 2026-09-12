import { useEffect, useState } from 'react'
import {
  Bell,
  Bike,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  House,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  PanelLeftClose,
  Radio,
  Route,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../lib/context'
import type { Role } from '../lib/model'
import { Avatar, Brand, Button, Modal, StatusIndicator } from './ui'

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean }
const customerNav: NavItem[] = [
  { to: '/app', label: 'Beranda', icon: House, end: true },
  { to: '/app/trips', label: 'Perjalanan', icon: Route },
  { to: '/app/history', label: 'Riwayat', icon: Clock3 },
  { to: '/app/notifications', label: 'Notifikasi', icon: Bell },
  { to: '/app/profile', label: 'Profil saya', icon: UserRound },
]
const riderNav: NavItem[] = [
  { to: '/rider', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/rider/requests', label: 'Permintaan', icon: Radio },
  { to: '/rider/trips', label: 'Perjalanan', icon: Route },
  { to: '/rider/earnings', label: 'Pendapatan', icon: Wallet },
  { to: '/rider/profile', label: 'Profil saya', icon: UserRound },
]

export function Layout({ role }: { role: Role }) {
  const { state, dispatch } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [help, setHelp] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const base = role === 'customer' ? '/app' : '/rider'
  const nav = role === 'customer' ? customerNav : riderNav
  const profile = state.profiles[role]
  const unread = state.notifications.filter((notice) => notice.role === role && !notice.read).length
  const current = nav.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
  )
  useEffect(() => {
    document.title = `${current?.label ?? 'Notifikasi'} — Temu Kopling`
    window.scrollTo(0, 0)
  }, [location.pathname, current?.label])
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])
  if (!state.session) return <Navigate to={`/login?role=${role}`} replace />
  if (state.session !== role)
    return <Navigate to={state.session === 'customer' ? '/app' : '/rider'} replace />
  const switchRole = () => {
    const next = role === 'customer' ? 'rider' : 'customer'
    dispatch({ type: 'session', role: next })
    navigate(next === 'customer' ? '/app' : '/rider')
  }
  const logout = () => {
    dispatch({ type: 'session', role: null })
    navigate('/')
  }
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Lewati ke konten
      </a>
      {mobileOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Tutup navigasi"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <Link to="/" className="sidebar-brand" aria-label="Temu Kopling beranda">
          <Brand />
        </Link>
        <button
          className="sidebar-close icon-button"
          aria-label="Tutup menu"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
        <span className="nav-caption">
          {role === 'customer' ? 'RUANG PERJALANANMU' : 'RUANG MITRA RIDER'}
        </span>
        <nav aria-label="Navigasi utama">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} strokeWidth={1.7} />
              <span>{label}</span>
              {label === 'Notifikasi' && unread > 0 && <span className="nav-count">{unread}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="sidebar-note-icon">
              <ShieldCheck size={22} />
            </span>
            <h3>Tenang di setiap jalan.</h3>
            <p>Kenali rider dan detail perjalanan sebelum berangkat.</p>
            <button onClick={() => setHelp(true)}>
              Kenali Temu Kopling <ChevronRight size={15} />
            </button>
          </div>
          <button className="nav-item help-link" onClick={() => setHelp(true)}>
            <CircleHelp size={19} />
            <span>Pusat bantuan</span>
            <ChevronRight size={15} />
          </button>
          <div className="sidebar-account">
            <Avatar name={profile.name} size="small" />
            <div>
              <strong>{profile.name}</strong>
              <span>{role === 'customer' ? 'Akun customer' : 'Mitra rider'}</span>
            </div>
            <button className="icon-button" aria-label="Keluar dari akun demo" onClick={logout}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
        <div className="sidebar-foot">
          <span>© {new Date().getFullYear()} Temu Kopling</span>
          <PanelLeftClose size={14} />
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Buka navigasi"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb-brand">Temu Kopling</span>
            <ChevronRight size={13} className="breadcrumb-chevron" />
            <strong>{current?.label ?? 'Notifikasi'}</strong>
          </div>
          <div className="topbar-actions">
            <span className="header-location">
              <MapPin size={14} /> Yogyakarta, ID
            </span>
            <span className="demo-pill">Mode demo</span>
            {role === 'rider' && (
              <button
                className="online-button"
                onClick={() => dispatch({ type: 'online', value: !state.online })}
              >
                <StatusIndicator online={state.online} />
              </button>
            )}
            <Link
              className="icon-button notification-button"
              to={`${base}/notifications`}
              aria-label={`Notifikasi, ${unread} belum dibaca`}
            >
              <Bell size={20} />
              {unread > 0 && <span />}
            </Link>
            <details className="account-dropdown">
              <summary aria-label="Menu akun">
                <Avatar name={profile.name} size="small" />
                <ChevronDown size={14} />
              </summary>
              <div className="dropdown-panel">
                <span className="dropdown-label">Jelajahi aplikasi demo</span>
                <Link to={`${base}/profile`}>
                  <UserRound size={16} />
                  Profil saya
                </Link>
                <button onClick={switchRole}>
                  <Bike size={16} />
                  Beralih ke {role === 'customer' ? 'rider' : 'customer'}
                </button>
                <Link to="/">
                  <House size={16} />
                  Landing page
                </Link>
                <button onClick={logout}>
                  <LogOut size={16} />
                  Keluar
                </button>
              </div>
            </details>
          </div>
        </header>
        <main id="main-content" className="page-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>Dibuat untuk perjalanan yang lebih berarti.</span>
          <span>
            <span className="live-dot" /> Demo interaktif <span className="footer-divider">/</span>{' '}
            Temu Kopling
          </span>
        </footer>
      </div>
      <nav className="bottom-navigation" aria-label="Navigasi mobile">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <Icon size={20} />
            <span>{label === 'Profil saya' ? 'Profil' : label}</span>
          </NavLink>
        ))}
      </nav>
      {help && (
        <Modal title="Kenali Temu Kopling" onClose={() => setHelp(false)}>
          <p className="muted">
            Satu ruang untuk perjalanan yang lebih sederhana. Pilih titik jemput, temukan rider, dan
            ikuti perjalananmu.
          </p>
          <div className="help-features">
            <p>
              <Route /> Pesan perjalanan dari lokasi demo di Yogyakarta.
            </p>
            <p>
              <CreditCard /> Lihat estimasi transparan sebelum memesan.
            </p>
            <p>
              <Sparkles /> Beralih peran untuk mencoba dashboard rider.
            </p>
          </div>
          <div className="info-box">
            <strong>Ini adalah demo frontend.</strong>
            <p>
              Belum ada pemesanan, kontak rider, pembayaran, verifikasi keamanan, atau layanan
              darurat yang terhubung.
            </p>
          </div>
          <Button onClick={() => setHelp(false)} className="full-width">
            Mengerti
          </Button>
        </Modal>
      )}
    </div>
  )
}
