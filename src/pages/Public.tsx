import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bike,
  CarFront,
  Check,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  MapPin,
  Menu,
  Route,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../lib/context'
import type { Role } from '../lib/model'
import { Badge, Brand, Button, Input, Modal } from '../components/ui'

export function Landing() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    document.title = 'Temu Kopling — Pergi dengan tenang.'
  }, [])
  const enter = (role: Role) => {
    dispatch({ type: 'session', role })
    navigate(role === 'customer' ? '/app' : '/rider')
  }
  return (
    <div className="landing">
      <a href="#landing-main" className="skip-link">
        Lewati ke konten
      </a>
      <header className="landing-nav">
        <Link to="/" aria-label="Temu Kopling">
          <Brand />
        </Link>
        <nav className={menu ? 'landing-menu open' : 'landing-menu'} aria-label="Navigasi landing">
          <a href="#cara-kerja" onClick={() => setMenu(false)}>
            Cara kerja
          </a>
          <a href="#layanan" onClick={() => setMenu(false)}>
            Layanan
          </a>
          <a href="#mitra" onClick={() => setMenu(false)}>
            Jadi mitra rider <ArrowUpRight size={13} />
          </a>
        </nav>
        <div className="landing-nav-actions">
          <Link to="/login" className="login-link">
            Masuk
          </Link>
          <Link to="/register" className="button button-primary">
            Mulai perjalanan <ArrowUpRight size={16} />
          </Link>
          <button
            className="mobile-menu icon-button"
            aria-label={menu ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>
      <main id="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="eyebrow">
              <span className="live-dot" /> TEMAN DI SETIAP JALAN
            </span>
            <h1>
              Perjalanan
              <br />
              lebih mudah.
              <br />
              <span>Rider lebih dekat.</span>
            </h1>
            <p>
              Ke kampus, ke kantor, atau sekadar cari suasana baru.
              <br className="desktop-break" /> Temukan teman jalanmu, nikmati setiap tujuan.
            </p>
            <div className="landing-hero-actions">
              <Button onClick={() => enter('customer')}>
                Coba pesan perjalanan <ArrowUpRight size={18} />
              </Button>
              <Link to="/register?role=rider" className="text-link">
                Jadi mitra rider <ArrowRight size={16} />
              </Link>
            </div>
            <div className="landing-hero-proof">
              <span className="proof-icon">
                <ShieldCheck size={21} />
              </span>
              <div>
                <strong>Dirancang untuk perjalanan yang lebih tenang.</strong>
                <span>Estimasi transparan. Detail jelas. Kamu pegang kendali.</span>
              </div>
            </div>
          </div>
          <div className="landing-visual">
            <div className="visual-top-label">
              <span>SEDIKIT REPOT.</span>
              <span>BANYAK CERITA.</span>
            </div>
            <img
              src="/scooter.webp"
              alt="Skuter hijau dengan helm di antara arsitektur minimalis dan tanaman tropis"
              fetchPriority="high"
            />
            <div className="floating-destination">
              <span className="destination-pin">
                <MapPin size={19} />
              </span>
              <div>
                <span>TUJUAN HARI INI</span>
                <strong>Ke mana pun kamu mau.</strong>
              </div>
              <span className="destination-check">
                <Check size={16} />
              </span>
            </div>
            <span className="visual-caption">Dibuat untuk hari-hari yang terus bergerak.</span>
            <span className="visual-index">01 — TEMU MOTOR</span>
          </div>
        </section>
        <div className="landing-values">
          <span>Perjalanan yang terasa lebih baik.</span>
          <div>
            <span>
              <Wallet size={18} />
              Tarif di awal
            </span>
            <span>
              <Route size={18} />
              Alur yang sederhana
            </span>
            <span>
              <Clock3 size={18} />
              Status yang jelas
            </span>
          </div>
          <a href="#cara-kerja" aria-label="Lihat cara kerja">
            <ArrowDown size={19} />
          </a>
        </div>
        <section className="landing-section how-section" id="cara-kerja">
          <div className="landing-section-heading">
            <div>
              <span className="eyebrow">TIGA LANGKAH. SATU TUJUAN.</span>
              <h2>
                Dari rencana,
                <br />
                jadi perjalanan.
              </h2>
            </div>
            <p>
              Kami menyederhanakan perjalanan,
              <br />
              supaya kamu bisa fokus menikmati harimu.
            </p>
          </div>
          <div className="how-grid">
            {[
              {
                number: '01',
                icon: MapPin,
                title: 'Tentukan tujuanmu',
                text: 'Pilih titik jemput dan tujuan. Lihat layanan serta estimasi tarif sebelum memesan.',
              },
              {
                number: '02',
                icon: Bike,
                title: 'Temukan teman jalan',
                text: 'Lihat rider, detail kendaraan, dan ikuti status penjemputan dalam satu tempat.',
              },
              {
                number: '03',
                icon: Sparkles,
                title: 'Berangkat dengan tenang',
                text: 'Nikmati perjalanan sampai tujuan. Selesaikan perjalanan dan bagikan penilaianmu.',
              },
            ].map(({ number, icon: Icon, title, text }) => (
              <article key={number}>
                <div className="how-step">
                  <span>{number}</span>
                  <Icon size={32} strokeWidth={1.3} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="landing-section services-section" id="layanan">
          <div className="landing-section-heading">
            <div>
              <span className="eyebrow">UNTUK CARA JALANMU</span>
              <h2>
                Beda kebutuhan.
                <br />
                Sama nyamannya.
              </h2>
            </div>
            <Badge tone="success">Jelajahi layanan demo</Badge>
          </div>
          <div className="landing-services">
            <article className="motor-service">
              <div>
                <span className="eyebrow">GESIT DI TENGAH KOTA</span>
                <h3>Temu Motor</h3>
                <p>Praktis untuk rutinitasmu, ringan untuk hari yang padat.</p>
                <button className="text-button" onClick={() => enter('customer')}>
                  Coba Temu Motor <ArrowUpRight size={18} />
                </button>
              </div>
              <Bike size={104} strokeWidth={1.1} />
            </article>
            <article className="car-service">
              <div>
                <span className="eyebrow">RUANG UNTUK BERSAMA</span>
                <h3>Temu Mobil</h3>
                <p>Perjalanan yang lebih lapang, sendiri atau bersama.</p>
                <button className="text-button" onClick={() => enter('customer')}>
                  Jelajahi layanan <ArrowUpRight size={18} />
                </button>
              </div>
              <CarFront size={106} strokeWidth={1.1} />
            </article>
          </div>
        </section>
        <section className="rider-landing-section" id="mitra">
          <div className="rider-landing-art">
            <Route size={130} strokeWidth={0.8} />
            <span>
              JALAN BERSAMA.
              <br />
              TUMBUH BERSAMA.
            </span>
          </div>
          <div>
            <span className="eyebrow">JADILAH BAGIAN DARI PERJALANAN</span>
            <h2>
              Di balik setiap tujuan,
              <br />
              ada peluang baru.
            </h2>
            <p>
              Atur ketersediaanmu, pilih perjalanan, dan pantau pendapatan dari dashboard yang
              dirancang untuk rider.
            </p>
            <Button onClick={() => enter('rider')}>
              Jelajahi dashboard rider <ArrowUpRight size={17} />
            </Button>
            <Link className="rider-register-link" to="/register?role=rider">
              Daftar sebagai rider <ChevronRight size={15} />
            </Link>
          </div>
        </section>
        <section className="landing-final">
          <span className="eyebrow">TUJUANMU BERIKUTNYA?</span>
          <h2>Yuk, jalan bareng.</h2>
          <p>Rencana kecil atau hari yang besar. Mulai dari sini.</p>
          <Button onClick={() => enter('customer')}>
            Coba Temu Kopling <ArrowUpRight size={18} />
          </Button>
        </section>
      </main>
      <footer className="landing-footer">
        <div>
          <Link to="/" aria-label="Temu Kopling">
            <Brand />
          </Link>
          <p>Perjalanan lebih mudah. Rider lebih dekat.</p>
        </div>
        <div>
          <span>© {new Date().getFullYear()} Temu Kopling</span>
          <small>Demo frontend · Belum melayani perjalanan atau pembayaran nyata.</small>
        </div>
      </footer>
    </div>
  )
}

export function AuthPage({ register = false }: { register?: boolean }) {
  const { state, dispatch, toast } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [role, setRole] = useState<Role>(params.get('role') === 'rider' ? 'rider' : 'customer')
  const [showPassword, setShowPassword] = useState(false)
  const [forgot, setForgot] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    document.title = `${register ? 'Daftar' : 'Masuk'} — Temu Kopling`
  }, [register])
  const enter = () => {
    dispatch({ type: 'session', role })
    navigate(role === 'customer' ? '/app' : '/rider')
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (register && !name.trim()) {
      setError('Isi nama yang ingin ditampilkan.')
      return
    }
    if (password.length < 8) {
      setError('Gunakan minimal 8 karakter untuk mencoba form password.')
      return
    }
    dispatch({
      type: 'profile',
      role,
      profile: { ...state.profiles[role], ...(name.trim() ? { name: name.trim() } : {}), email },
    })
    toast(
      register
        ? 'Profil demo berhasil dibuat. Selamat datang!'
        : 'Kamu masuk ke sesi demo. Selamat mencoba!',
    )
    enter()
  }
  return (
    <div className="auth-layout">
      <aside className="auth-brand-panel">
        <Link to="/" aria-label="Temu Kopling">
          <Brand />
        </Link>
        <div className="auth-story">
          <span className="eyebrow">TEMAN DI SETIAP JALAN</span>
          <h1>
            Tujuan boleh beda.
            <br />
            Nyaman tetap sama.
          </h1>
          <p>
            Temukan teman perjalananmu.
            <br />
            Bawa pulang cerita baru.
          </p>
        </div>
        <img src="/scooter.webp" alt="Skuter hijau dan helm Temu Kopling" />
        <span className="auth-brand-footer">
          <ShieldCheck size={17} />
          Dirancang untuk setiap perjalananmu.
        </span>
      </aside>
      <main className="auth-form-panel">
        <Link to="/" className="auth-back">
          <ArrowUpRight size={16} />
          Kembali ke beranda
        </Link>
        <div className="auth-form-content">
          <div className="auth-mobile-brand">
            <Brand />
          </div>
          <span className="eyebrow">
            {register ? 'AWALI CERITA BARUMU' : 'SENANG BERTEMU LAGI'}
          </span>
          <h1>{register ? 'Yuk, jadi bagian perjalanan.' : 'Selamat datang kembali.'}</h1>
          <p className="muted">
            {register
              ? 'Buat profil demo dan temukan pengalaman perjalanan yang baru.'
              : 'Masuk ke ruang perjalananmu. Tujuan berikutnya menunggu.'}
          </p>
          <div className="auth-role-selector" role="group" aria-label="Pilih jenis akun">
            <button
              aria-pressed={role === 'customer'}
              className={role === 'customer' ? 'selected' : ''}
              onClick={() => setRole('customer')}
            >
              <Route size={18} />
              Customer
            </button>
            <button
              aria-pressed={role === 'rider'}
              className={role === 'rider' ? 'selected' : ''}
              onClick={() => setRole('rider')}
            >
              <Bike size={18} />
              Mitra rider
            </button>
          </div>
          <form onSubmit={submit} className="auth-form">
            {register && (
              <Input
                label="Nama lengkap"
                autoComplete="name"
                placeholder="Nama yang ingin ditampilkan"
                value={name}
                maxLength={60}
                required
                onChange={(event) => {
                  setName(event.target.value)
                  setError('')
                }}
              />
            )}
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="nama@example.com"
              value={email}
              required
              onChange={(event) => setEmail(event.target.value)}
            />
            <div className="password-field">
              <Input
                label="Password demo"
                type={showPassword ? 'text' : 'password'}
                autoComplete="off"
                placeholder="Minimal 8 karakter, gunakan contoh"
                value={password}
                minLength={8}
                required
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!register && (
              <button
                className="text-button forgot-password"
                type="button"
                onClick={() => setForgot(true)}
              >
                Lupa password?
              </button>
            )}
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <Button className="full-width" type="submit">
              {register ? 'Buat profil demo' : 'Masuk ke demo'}
              <ArrowRight size={17} />
            </Button>
          </form>
          <div className="auth-divider">
            <span>atau langsung jelajahi</span>
          </div>
          <Button variant="secondary" className="full-width" onClick={enter}>
            Coba demo {role === 'customer' ? 'customer' : 'rider'}
            <ArrowUpRight size={16} />
          </Button>
          <p className="auth-switch">
            {register ? 'Sudah punya profil?' : 'Baru di Temu Kopling?'}{' '}
            <Link to={`${register ? '/login' : '/register'}?role=${role}`}>
              {register ? 'Masuk' : 'Daftar sekarang'}
            </Link>
          </p>
          <div className="auth-demo-note">
            <ShieldCheck size={18} />
            <p>
              <strong>Ruang demo, bebas eksplorasi.</strong> Data tersimpan di browser. Password
              tidak disimpan atau diverifikasi. Gunakan data contoh, bukan kredensial asli.
            </p>
          </div>
        </div>
        <footer>© {new Date().getFullYear()} Temu Kopling · Pergi dengan tenang.</footer>
      </main>
      {forgot && (
        <Modal title="Pemulihan akun" onClose={() => setForgot(false)}>
          <p className="muted">
            Email pemulihan belum terhubung dalam demo ini. Kamu tidak memerlukan password untuk
            membuka akun demo.
          </p>
          <Button className="full-width" onClick={enter}>
            Lanjutkan ke demo
            <ArrowRight size={17} />
          </Button>
        </Modal>
      )}
    </div>
  )
}
