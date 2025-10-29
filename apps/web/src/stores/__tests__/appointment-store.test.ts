import { describe, it, expect, beforeEach } from 'vitest'
import { useAppointmentStore } from '../appointment-store'

describe('AppointmentStore', () => {
  beforeEach(() => {
    useAppointmentStore.getState().reset()
  })

  it('should initialize with default values', () => {
    const state = useAppointmentStore.getState()

    expect(state.selectedBarber).toBeNull()
    expect(state.selectedService).toBeNull()
    expect(state.selectedDate).toBeNull()
    expect(state.selectedTime).toBeNull()
    expect(state.notes).toBe('')
  })

  it('should set barber', () => {
    const barber = {
      id: '1',
      name: 'John Doe',
      specialties: ['haircut', 'beard']
    }

    useAppointmentStore.getState().setBarber(barber)

    expect(useAppointmentStore.getState().selectedBarber).toEqual(barber)
  })

  it('should set service', () => {
    const service = {
      id: '1',
      name: 'Haircut',
      duration: 30,
      price: 25
    }

    useAppointmentStore.getState().setService(service)

    expect(useAppointmentStore.getState().selectedService).toEqual(service)
  })

  it('should set date', () => {
    const date = new Date('2024-12-01')

    useAppointmentStore.getState().setDate(date)

    expect(useAppointmentStore.getState().selectedDate).toEqual(date)
  })

  it('should set time', () => {
    const time = '10:00'

    useAppointmentStore.getState().setTime(time)

    expect(useAppointmentStore.getState().selectedTime).toBe(time)
  })

  it('should set notes', () => {
    const notes = 'Prefer short hair'

    useAppointmentStore.getState().setNotes(notes)

    expect(useAppointmentStore.getState().notes).toBe(notes)
  })

  it('should reset state', () => {
    const { setBarber, setService, setDate, setTime, setNotes, reset } =
      useAppointmentStore.getState()

    // Set some values
    setBarber({ id: '1', name: 'John', specialties: [] })
    setService({ id: '1', name: 'Cut', duration: 30, price: 25 })
    setDate(new Date())
    setTime('10:00')
    setNotes('Test notes')

    // Reset
    reset()

    const state = useAppointmentStore.getState()
    expect(state.selectedBarber).toBeNull()
    expect(state.selectedService).toBeNull()
    expect(state.selectedDate).toBeNull()
    expect(state.selectedTime).toBeNull()
    expect(state.notes).toBe('')
  })

  it('should return false for isComplete when data is incomplete', () => {
    const { isComplete } = useAppointmentStore.getState()

    expect(isComplete()).toBe(false)
  })

  it('should return true for isComplete when all required data is set', () => {
    const { setBarber, setService, setDate, setTime, isComplete } =
      useAppointmentStore.getState()

    setBarber({ id: '1', name: 'John', specialties: [] })
    setService({ id: '1', name: 'Cut', duration: 30, price: 25 })
    setDate(new Date())
    setTime('10:00')

    expect(isComplete()).toBe(true)
  })
})
