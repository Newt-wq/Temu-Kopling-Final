import { z } from 'zod'

export const locations = [
  {
    id: 'ugm',
    name: 'Universitas Gadjah Mada',
    address: 'Bulaksumur, Caturtunggal, Depok',
    x: 470,
    y: 135,
  },
  {
    id: 'malioboro',
    name: 'Malioboro Mall',
    address: 'Jl. Malioboro No. 52–58, Danurejan',
    x: 280,
    y: 365,
  },
  {
    id: 'tugu',
    name: 'Tugu Yogyakarta',
    address: 'Jl. Jenderal Sudirman, Gowongan',
    x: 285,
    y: 235,
  },
  {
    id: 'station',
    name: 'Stasiun Yogyakarta',
    address: 'Jl. Pasar Kembang, Sosromenduran',
    x: 170,
    y: 310,
  },
  {
    id: 'pakuwon',
    name: 'Pakuwon Mall Jogja',
    address: 'Jl. Ring Road Utara, Condongcatur',
    x: 660,
    y: 110,
  },
  { id: 'alun', name: 'Alun-Alun Kidul', address: 'Patehan, Kecamatan Kraton', x: 300, y: 470 },
  { id: 'home', name: 'Rumah · Terban', address: 'Jl. C. Simanjuntak, Terban', x: 400, y: 200 },
  {
    id: 'office',
    name: 'Kantor · Kotabaru',
    address: 'Jl. Suroto, Kotabaru, Gondokusuman',
    x: 450,
    y: 305,
  },
] as const

const locationSchema = z
  .string()
  .refine((value) => locations.some((location) => location.id === value))
export const tripSchema = z.object({
  id: z.string(),
  pickup: locationSchema,
  destination: locationSchema,
  service: z.enum(['motor', 'car']),
  payment: z.enum(['cash', 'qris']),
  status: z.enum(['searching', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled']),
  origin: z.enum(['customer', 'request']),
  assigned: z.boolean(),
  fare: z.number().nonnegative(),
  distance: z.number().positive(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  passenger: z.string(),
})
const profileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  vehicle: z.string(),
  plate: z.string(),
})
export const stateSchema = z.object({
  version: z.literal(1),
  session: z.enum(['customer', 'rider']).nullable(),
  online: z.boolean(),
  profiles: z.object({ customer: profileSchema, rider: profileSchema }),
  trips: z.array(tripSchema),
  notifications: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      body: z.string(),
      category: z.enum(['trip', 'payment', 'system']),
      read: z.boolean(),
      role: z.enum(['customer', 'rider']),
      date: z.string(),
    }),
  ),
  preferences: z.object({ tripUpdates: z.boolean(), promotions: z.boolean() }),
})
export type AppState = z.infer<typeof stateSchema>
export type Trip = z.infer<typeof tripSchema>
export type Role = NonNullable<AppState['session']>
export type Profile = z.infer<typeof profileSchema>
export type Action =
  | { type: 'session'; role: Role | null }
  | { type: 'online'; value: boolean }
  | { type: 'profile'; role: Role; profile: Profile }
  | { type: 'preference'; key: keyof AppState['preferences']; value: boolean }
  | { type: 'book'; trip: Trip }
  | { type: 'transition'; id: string; status: Trip['status']; date: string }
  | { type: 'decline'; id: string; date: string }
  | { type: 'rate'; id: string; rating: number }
  | { type: 'read'; role: Role; id?: string }
  | { type: 'reset' }

export const money = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
export const place = (id: string) =>
  locations.find((location) => location.id === id) ?? locations[0]
export const tripDate = (date: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
export const statusLabels: Record<Trip['status'], string> = {
  searching: 'Mencari rider',
  accepted: 'Rider menuju jemput',
  arrived: 'Rider sudah tiba',
  in_progress: 'Dalam perjalanan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}
export const isActive = (trip: Trip) => !['completed', 'cancelled'].includes(trip.status)
export const activeCustomer = (state: AppState) =>
  state.trips.find((trip) => trip.origin === 'customer' && isActive(trip))
export const activeRider = (state: AppState) =>
  state.trips.find((trip) => trip.assigned && isActive(trip))
export const roleTrips = (state: AppState, role: Role) =>
  state.trips.filter((trip) => (role === 'customer' ? trip.origin === 'customer' : trip.assigned))

export function estimate(pickup: string, destination: string, service: Trip['service']) {
  const from = place(pickup)
  const to = place(destination)
  const distance = Math.max(
    1,
    Math.round((Math.hypot(to.x - from.x, to.y - from.y) / 65) * 10) / 10,
  )
  const fare =
    Math.ceil((service === 'motor' ? 5000 + distance * 2500 : 10000 + distance * 4500) / 1000) *
    1000
  return { distance, fare, minutes: Math.ceil(distance * 3 + 3) }
}

export function initialState(): AppState {
  const now = new Date()
  const date = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString()
  const historical = (
    id: string,
    pickup: string,
    destination: string,
    hours: number,
    origin: Trip['origin'],
    fare: number,
  ): Trip => ({
    id,
    pickup,
    destination,
    origin,
    assigned: true,
    service: 'motor',
    payment: 'cash',
    status: 'completed',
    fare,
    distance: estimate(pickup, destination, 'motor').distance,
    createdAt: date(hours),
    completedAt: date(hours),
    rating: 5,
    passenger: origin === 'customer' ? 'Alya Putri' : 'Dimas Pratama',
  })
  return {
    version: 1,
    session: null,
    online: false,
    profiles: {
      customer: {
        name: 'Alya Putri',
        email: 'alya@example.com',
        phone: '0812 0000 1234',
        vehicle: '',
        plate: '',
      },
      rider: {
        name: 'Bima Prasetyo',
        email: 'bima@example.com',
        phone: '0813 0000 5678',
        vehicle: 'Honda Vario 125 · Hitam',
        plate: 'AB 2048 TK',
      },
    },
    preferences: { tripUpdates: true, promotions: false },
    trips: [
      historical('TK-2403', 'ugm', 'malioboro', 24, 'customer', 18000),
      historical('TK-2402', 'station', 'home', 48, 'customer', 15000),
      historical('TK-2401', 'home', 'office', 72, 'customer', 12000),
      historical('TK-2405', 'tugu', 'pakuwon', 1, 'request', 24000),
      historical('TK-2404', 'alun', 'ugm', 2, 'request', 22000),
      {
        id: 'TK-REQ-01',
        pickup: 'ugm',
        destination: 'malioboro',
        origin: 'request',
        assigned: false,
        service: 'motor',
        payment: 'cash',
        status: 'searching',
        fare: 18000,
        distance: 4.6,
        createdAt: date(0),
        passenger: 'Nadia Rahma',
      },
      {
        id: 'TK-REQ-02',
        pickup: 'tugu',
        destination: 'pakuwon',
        origin: 'request',
        assigned: false,
        service: 'motor',
        payment: 'qris',
        status: 'searching',
        fare: 24000,
        distance: 6.1,
        createdAt: date(0),
        passenger: 'Dimas Pratama',
      },
    ],
    notifications: [
      {
        id: 'welcome-c',
        title: 'Selamat datang di Temu Kopling',
        body: 'Coba pesan perjalanan pertamamu di mode demo. Semua tarif dan rider di sini adalah ilustrasi.',
        category: 'system',
        read: false,
        role: 'customer',
        date: date(1),
      },
      {
        id: 'payment-c',
        title: 'Perjalananmu sudah selesai',
        body: 'Ringkasan perjalanan ke Malioboro Mall tersedia di riwayat.',
        category: 'trip',
        read: false,
        role: 'customer',
        date: date(24),
      },
      {
        id: 'welcome-r',
        title: 'Siap memulai hari, Bima?',
        body: 'Aktifkan status online untuk melihat permintaan perjalanan demo di sekitarmu.',
        category: 'system',
        read: false,
        role: 'rider',
        date: date(1),
      },
    ],
  }
}

const nextStatus: Partial<Record<Trip['status'], Trip['status']>> = {
  searching: 'accepted',
  accepted: 'arrived',
  arrived: 'in_progress',
  in_progress: 'completed',
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'session':
      return { ...state, session: action.role }
    case 'online':
      return { ...state, online: action.value }
    case 'profile':
      return { ...state, profiles: { ...state.profiles, [action.role]: action.profile } }
    case 'preference':
      return { ...state, preferences: { ...state.preferences, [action.key]: action.value } }
    case 'read':
      return {
        ...state,
        notifications: state.notifications.map((notice) =>
          notice.role === action.role && (!action.id || notice.id === action.id)
            ? { ...notice, read: true }
            : notice,
        ),
      }
    case 'reset':
      return initialState()
    case 'book': {
      const parsed = tripSchema.safeParse(action.trip)
      if (
        !parsed.success ||
        activeCustomer(state) ||
        action.trip.pickup === action.trip.destination ||
        action.trip.status !== 'searching' ||
        action.trip.origin !== 'customer' ||
        action.trip.assigned ||
        state.trips.some((trip) => trip.id === action.trip.id)
      )
        return state
      return {
        ...state,
        trips: [action.trip, ...state.trips],
        notifications: [
          {
            id: `${action.trip.id}-new-rider`,
            role: 'rider',
            read: false,
            date: action.trip.createdAt,
            category: 'trip',
            title: 'Permintaan perjalanan baru',
            body: `${place(action.trip.pickup).name} → ${place(action.trip.destination).name}.`,
          },
          ...state.notifications,
        ],
      }
    }
    case 'decline': {
      const trip = state.trips.find((item) => item.id === action.id)
      if (!trip || trip.assigned || trip.status !== 'searching') return state
      return reducer(state, {
        type: 'transition',
        id: action.id,
        status: 'cancelled',
        date: action.date,
      })
    }
    case 'rate':
      return {
        ...state,
        trips: state.trips.map((trip) =>
          trip.id === action.id &&
          trip.status === 'completed' &&
          !trip.rating &&
          Number.isInteger(action.rating) &&
          action.rating >= 1 &&
          action.rating <= 5
            ? { ...trip, rating: action.rating }
            : trip,
        ),
      }
    case 'transition': {
      const trip = state.trips.find((item) => item.id === action.id)
      if (!trip || !isActive(trip)) return state
      const cancelAllowed =
        action.status === 'cancelled' && ['searching', 'accepted', 'arrived'].includes(trip.status)
      if (!cancelAllowed && nextStatus[trip.status] !== action.status) return state
      if (action.status === 'accepted') {
        if (activeRider(state)) return state
        if (state.session === 'rider' && !state.online) return state
      }
      const updated: Trip = {
        ...trip,
        status: action.status,
        assigned: trip.assigned || action.status === 'accepted',
        ...(action.status === 'completed' ? { completedAt: action.date } : {}),
      }
      const roles: Role[] = trip.origin === 'customer' ? ['customer', 'rider'] : ['rider']
      return {
        ...state,
        trips: state.trips.map((item) => (item.id === trip.id ? updated : item)),
        notifications: [
          ...roles.map((role) => ({
            id: `${trip.id}-${action.status}-${role}`,
            role,
            read: false,
            date: action.date,
            category: action.status === 'completed' ? ('payment' as const) : ('trip' as const),
            title: statusLabels[action.status],
            body: `${place(trip.pickup).name} → ${place(trip.destination).name}${action.status === 'completed' ? `. Total demo ${money(trip.fare)}.` : '.'}`,
          })),
          ...state.notifications,
        ],
      }
    }
  }
}

export function restoreState(raw: string | null): { state: AppState; recovered: boolean } {
  if (!raw) return { state: initialState(), recovered: false }
  try {
    const parsed = stateSchema.safeParse(JSON.parse(raw))
    if (parsed.success) return { state: parsed.data, recovered: false }
  } catch {
    /* Invalid browser data is replaced with fresh demo data. */
  }
  return { state: initialState(), recovered: true }
}
