import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * Appointment booking state management
 * Handles the multi-step appointment creation flow
 */

interface Barber {
  id: string
  name: string
  specialties: string[]
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

interface AppointmentState {
  // Selected data
  selectedBarber: Barber | null
  selectedService: Service | null
  selectedDate: Date | null
  selectedTime: string | null
  notes: string

  // Actions
  setBarber: (barber: Barber | null) => void
  setService: (service: Service | null) => void
  setDate: (date: Date | null) => void
  setTime: (time: string | null) => void
  setNotes: (notes: string) => void
  reset: () => void

  // Computed
  isComplete: () => boolean
}

const initialState = {
  selectedBarber: null,
  selectedService: null,
  selectedDate: null,
  selectedTime: null,
  notes: ''
}

export const useAppointmentStore = create<AppointmentState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setBarber: (barber) => set({ selectedBarber: barber }),
        setService: (service) => set({ selectedService: service }),
        setDate: (date) => set({ selectedDate: date }),
        setTime: (time) => set({ selectedTime: time }),
        setNotes: (notes) => set({ notes }),

        reset: () => set(initialState),

        isComplete: () => {
          const state = get()
          return !!(
            state.selectedBarber &&
            state.selectedService &&
            state.selectedDate &&
            state.selectedTime
          )
        }
      }),
      {
        name: 'appointment-storage',
        // Only persist selected data, not computed values
        partialize: (state) => ({
          selectedBarber: state.selectedBarber,
          selectedService: state.selectedService,
          selectedDate: state.selectedDate,
          selectedTime: state.selectedTime,
          notes: state.notes
        })
      }
    ),
    { name: 'AppointmentStore' }
  )
)
