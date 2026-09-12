import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  activeCustomer,
  activeRider,
  estimate,
  initialState,
  reducer,
  restoreState,
  roleTrips,
  stateSchema,
} from './model'
import type { AppState, Trip } from './model'

const date = '2026-09-12T16:00:00.000Z'
const requestId = 'TK-REQ-01'
const booking: Trip = {
  id: 'TK-TEST',
  pickup: 'ugm',
  destination: 'malioboro',
  service: 'motor',
  payment: 'cash',
  status: 'searching',
  origin: 'customer',
  assigned: false,
  fare: 15000,
  distance: 3.8,
  createdAt: date,
  passenger: 'Nadia Putri',
}

function transition(state: AppState, id: string, status: Trip['status']) {
  return reducer(state, { type: 'transition', id, status, date })
}

function riderState() {
  return reducer(initialState(), { type: 'session', role: 'rider' })
}

describe('booking and pricing', () => {
  it('requires distinct valid locations and preserves the existing active booking', () => {
    const empty = initialState()
    assert.deepEqual(
      reducer(empty, { type: 'book', trip: { ...booking, destination: 'ugm' } }),
      empty,
    )
    assert.deepEqual(reducer(empty, { type: 'book', trip: { ...booking, fare: -1 } }), empty)
    assert.deepEqual(reducer(empty, { type: 'book', trip: { ...booking, assigned: true } }), empty)
    assert.deepEqual(
      reducer(empty, { type: 'book', trip: { ...booking, status: 'completed' } }),
      empty,
    )
    const booked = reducer(empty, { type: 'book', trip: booking })
    assert.equal(activeCustomer(booked)?.id, booking.id)
    assert.deepEqual(reducer(booked, { type: 'book', trip: { ...booking, id: 'SECOND' } }), booked)
    assert.equal(booked.notifications[0].role, 'rider')
  })

  it('allows rebooking after cancellation', () => {
    const booked = reducer(initialState(), { type: 'book', trip: booking })
    const cancelled = transition(booked, booking.id, 'cancelled')
    assert.equal(activeCustomer(cancelled), undefined)
    const rebooked = reducer(cancelled, { type: 'book', trip: { ...booking, id: 'SECOND' } })
    assert.equal(activeCustomer(rebooked)?.id, 'SECOND')
  })

  it('quotes symmetric routes with positive estimates and separate motor/car prices', () => {
    const motor = estimate('ugm', 'malioboro', 'motor')
    const reverse = estimate('malioboro', 'ugm', 'motor')
    const car = estimate('ugm', 'malioboro', 'car')
    assert.deepEqual(motor, reverse)
    assert.ok(motor.distance > 0 && motor.minutes > 0 && motor.fare > 0)
    assert.ok(car.fare > motor.fare)
  })
})

describe('rider dispatch and trip lifecycle', () => {
  it('requires an online rider and prevents concurrent assignments', () => {
    const offline = riderState()
    assert.deepEqual(transition(offline, requestId, 'accepted'), offline)
    const online = reducer(offline, { type: 'online', value: true })
    const accepted = transition(online, requestId, 'accepted')
    assert.equal(activeRider(accepted)?.id, requestId)
    assert.deepEqual(transition(accepted, 'TK-REQ-02', 'accepted'), accepted)
    assert.deepEqual(transition(accepted, requestId, 'accepted'), accepted)
  })

  it('permits only ordered transitions, records completion, and prevents terminal changes', () => {
    const online = reducer(riderState(), { type: 'online', value: true })
    assert.deepEqual(transition(online, requestId, 'completed'), online)
    const accepted = transition(online, requestId, 'accepted')
    assert.deepEqual(transition(accepted, requestId, 'in_progress'), accepted)
    const arrived = transition(accepted, requestId, 'arrived')
    const travelling = transition(arrived, requestId, 'in_progress')
    assert.deepEqual(transition(travelling, requestId, 'cancelled'), travelling)
    const completed = transition(travelling, requestId, 'completed')
    const trip = completed.trips.find((item) => item.id === requestId)
    assert.equal(trip?.status, 'completed')
    assert.equal(trip?.completedAt, date)
    assert.equal(activeRider(completed), undefined)
    assert.deepEqual(transition(completed, requestId, 'cancelled'), completed)
    assert.deepEqual(transition(completed, requestId, 'accepted'), completed)
    assert.ok(
      completed.notifications.some((item) => item.category === 'payment' && item.role === 'rider'),
    )
  })

  it('allows a current trip to finish after the rider goes offline', () => {
    const online = reducer(riderState(), { type: 'online', value: true })
    const accepted = transition(online, requestId, 'accepted')
    const offline = reducer(accepted, { type: 'online', value: false })
    const arrived = transition(offline, requestId, 'arrived')
    const travelling = transition(arrived, requestId, 'in_progress')
    assert.equal(
      transition(travelling, requestId, 'completed').trips.find((trip) => trip.id === requestId)
        ?.status,
      'completed',
    )
  })

  it('simulates customer assignment without requiring the rider dashboard to be online', () => {
    const customer = reducer(initialState(), { type: 'session', role: 'customer' })
    const booked = reducer(customer, { type: 'book', trip: booking })
    const accepted = transition(booked, booking.id, 'accepted')
    assert.equal(activeCustomer(accepted)?.status, 'accepted')
    assert.equal(activeRider(accepted)?.id, booking.id)
    assert.equal(accepted.notifications[0].role, 'customer')
  })

  it('declines seeded and customer requests, but cannot decline an accepted trip', () => {
    const initial = initialState()
    const declined = reducer(initial, { type: 'decline', id: requestId, date })
    assert.equal(declined.trips.find((trip) => trip.id === requestId)?.status, 'cancelled')
    const booked = reducer(initial, { type: 'book', trip: booking })
    const customerDeclined = reducer(booked, { type: 'decline', id: booking.id, date })
    assert.equal(activeCustomer(customerDeclined), undefined)
    assert.equal(customerDeclined.notifications[0].role, 'customer')
    const accepted = transition(booked, booking.id, 'accepted')
    assert.deepEqual(reducer(accepted, { type: 'decline', id: booking.id, date }), accepted)
  })

  it('supports cancellation before departure and isolates customer/rider histories', () => {
    const booked = reducer(initialState(), { type: 'book', trip: booking })
    const accepted = transition(booked, booking.id, 'accepted')
    const arrived = transition(accepted, booking.id, 'arrived')
    const cancelled = transition(arrived, booking.id, 'cancelled')
    assert.equal(activeCustomer(cancelled), undefined)
    assert.equal(activeRider(cancelled), undefined)
    assert.ok(roleTrips(cancelled, 'customer').every((trip) => trip.origin === 'customer'))
    assert.ok(roleTrips(cancelled, 'rider').every((trip) => trip.assigned))
    assert.deepEqual(transition(cancelled, 'MISSING', 'accepted'), cancelled)
  })

  it('accepts one integer rating only for a completed trip', () => {
    let state = reducer(initialState(), { type: 'book', trip: booking })
    assert.deepEqual(reducer(state, { type: 'rate', id: booking.id, rating: 5 }), state)
    for (const status of ['accepted', 'arrived', 'in_progress', 'completed'] as const) {
      state = transition(state, booking.id, status)
    }
    for (const rating of [0, 6, 2.5, Number.NaN]) {
      assert.deepEqual(reducer(state, { type: 'rate', id: booking.id, rating }), state)
    }
    const rated = reducer(state, { type: 'rate', id: booking.id, rating: 4 })
    assert.equal(rated.trips.find((trip) => trip.id === booking.id)?.rating, 4)
    assert.deepEqual(reducer(rated, { type: 'rate', id: booking.id, rating: 1 }), rated)
  })
})

describe('persistence, accounts, and notifications', () => {
  it('restores a complete valid state including an active trip', () => {
    const booked = reducer(initialState(), { type: 'book', trip: booking })
    const restored = restoreState(JSON.stringify(booked))
    assert.equal(restored.recovered, false)
    assert.deepEqual(restored.state, booked)
  })

  it('recovers malformed, incomplete, or old browser data without crashing', () => {
    for (const raw of [
      'broken-json',
      'null',
      '{}',
      '{"version": 0}',
      JSON.stringify({ ...initialState(), trips: [{ ...booking, status: 'unknown' }] }),
    ]) {
      const restored = restoreState(raw)
      assert.equal(restored.recovered, true)
      assert.ok(stateSchema.safeParse(restored.state).success)
    }
    assert.equal(restoreState(null).recovered, false)
  })

  it('marks only the intended notification and role as read', () => {
    const initial = initialState()
    const customerId = initial.notifications.find((item) => item.role === 'customer')!.id
    const wrongRole = reducer(initial, { type: 'read', role: 'rider', id: customerId })
    assert.equal(wrongRole.notifications.find((item) => item.id === customerId)?.read, false)
    const read = reducer(initial, { type: 'read', role: 'customer', id: customerId })
    assert.equal(read.notifications.find((item) => item.id === customerId)?.read, true)
    const allRead = reducer(initial, { type: 'read', role: 'customer' })
    assert.ok(
      allRead.notifications.filter((item) => item.role === 'customer').every((item) => item.read),
    )
    assert.ok(
      allRead.notifications.filter((item) => item.role === 'rider').every((item) => !item.read),
    )
  })

  it('keeps roles separate and clears local session and modifications on reset', () => {
    const initial = initialState()
    const changed = reducer(initial, {
      type: 'profile',
      role: 'customer',
      profile: { ...initial.profiles.customer, name: 'Nama Baru' },
    })
    assert.equal(changed.profiles.rider, initial.profiles.rider)
    const preferred = reducer(changed, { type: 'preference', key: 'promotions', value: true })
    assert.equal(preferred.preferences.promotions, true)
    const session = reducer(preferred, { type: 'session', role: 'rider' })
    assert.equal(session.session, 'rider')
    const reset = reducer(session, { type: 'reset' })
    assert.equal(reset.session, null)
    assert.equal(reset.profiles.customer.name, initial.profiles.customer.name)
    assert.equal(reset.preferences.promotions, false)
    assert.equal(activeCustomer(reset), undefined)
  })
})
