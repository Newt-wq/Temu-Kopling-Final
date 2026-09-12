import { Component, lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from './lib/Provider'
import { Layout } from './components/Layout'
import { Button, EmptyState, LoadingSkeleton, NotFound } from './components/ui'

const Landing = lazy(() => import('./pages/Public').then((module) => ({ default: module.Landing })))
const Auth = lazy(() => import('./pages/Public').then((module) => ({ default: module.AuthPage })))
const Customer = lazy(() =>
  import('./pages/Customer').then((module) => ({ default: module.CustomerDashboard })),
)
const CustomerTrips = lazy(() =>
  import('./pages/Customer').then((module) => ({ default: module.CustomerTrips })),
)
const History = lazy(() =>
  import('./pages/Shared').then((module) => ({ default: module.TripHistory })),
)
const Profile = lazy(() =>
  import('./pages/Shared').then((module) => ({ default: module.ProfilePage })),
)
const Notifications = lazy(() =>
  import('./pages/Shared').then((module) => ({ default: module.Notifications })),
)
const Rider = lazy(() =>
  import('./pages/Rider').then((module) => ({ default: module.RiderDashboard })),
)
const Requests = lazy(() =>
  import('./pages/Rider').then((module) => ({ default: module.RiderRequests })),
)
const RiderTrips = lazy(() =>
  import('./pages/Rider').then((module) => ({ default: module.RiderTrips })),
)
const Earnings = lazy(() =>
  import('./pages/Rider').then((module) => ({ default: module.RiderEarnings })),
)

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed)
      return (
        <main className="not-found">
          <EmptyState
            title="Halaman belum berhasil dimuat"
            description="Ada kendala saat membuka halaman. Muat ulang untuk mencoba lagi; data demo yang tersimpan tetap tersedia."
            action={<Button onClick={() => window.location.reload()}>Coba lagi</Button>}
          />
        </main>
      )
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSkeleton lines={5} />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Auth key="login" />} />
              <Route path="/register" element={<Auth key="register" register />} />
              <Route path="/app" element={<Layout role="customer" />}>
                <Route index element={<Customer />} />
                <Route path="trips" element={<CustomerTrips />} />
                <Route path="history" element={<History role="customer" />} />
                <Route path="notifications" element={<Notifications role="customer" />} />
                <Route path="profile" element={<Profile role="customer" />} />
              </Route>
              <Route path="/rider" element={<Layout role="rider" />}>
                <Route index element={<Rider />} />
                <Route path="requests" element={<Requests />} />
                <Route path="trips" element={<RiderTrips />} />
                <Route path="earnings" element={<Earnings />} />
                <Route path="notifications" element={<Notifications role="rider" />} />
                <Route path="profile" element={<Profile role="rider" />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  )
}
