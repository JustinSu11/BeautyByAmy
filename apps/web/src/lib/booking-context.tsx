'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Service } from './services-data'

export type BookingStep = 'services' | 'datetime' | 'summary'

interface BookingState {
  step: BookingStep
  selectedServices: Service[]
  selectedDate: Date | null
  selectedTime: string | null
}

interface BookingContextValue extends BookingState {
  setStep: (step: BookingStep) => void
  toggleService: (service: Service) => void
  isServiceSelected: (serviceId: string) => boolean
  setSelectedDate: (date: Date | null) => void
  setSelectedTime: (time: string | null) => void
  totalPrice: number
  totalDuration: number
  canProceed: boolean
  reset: () => void
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<BookingStep>('services')
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const toggleService = useCallback((service: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id)
      if (exists) return prev.filter((s) => s.id !== service.id)
      return [...prev, service]
    })
  }, [])

  const isServiceSelected = useCallback(
    (serviceId: string) => selectedServices.some((s) => s.id === serviceId),
    [selectedServices]
  )

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0)

  const canProceed =
    (step === 'services' && selectedServices.length > 0) ||
    (step === 'datetime' && selectedDate !== null && selectedTime !== null) ||
    step === 'summary'

  const reset = useCallback(() => {
    setStep('services')
    setSelectedServices([])
    setSelectedDate(null)
    setSelectedTime(null)
  }, [])

  return (
    <BookingContext.Provider
      value={{
        step,
        setStep,
        selectedServices,
        toggleService,
        isServiceSelected,
        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,
        totalPrice,
        totalDuration,
        canProceed,
        reset,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}
