'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Service } from './services-data'

export type BookingStep = 'booking' | 'info' | 'summary' | 'confirmed'

export interface CustomerInfo {
  name: string
  email: string
  phone: string
}

interface BookingState {
  step: BookingStep
  services: Service[]
  selectedService: Service | null
  selectedDate: Date | null
  selectedTime: string | null        // HH:mm in business timezone — display only
  selectedSlotStartAt: string | null // UTC ISO from Square — used for booking submission
  customerInfo: CustomerInfo
  policyAccepted: boolean
  confirmedNeedsWaiver: boolean | null
}

interface BookingContextValue extends BookingState {
  setStep: (step: BookingStep) => void
  selectService: (service: Service | null) => void
  setSelectedDate: (date: Date | null) => void
  /** Select a time slot. Provide both the display time (HH:mm) and Square's UTC startAt. */
  selectTimeSlot: (time: string | null, startAt: string | null) => void
  setCustomerInfo: (info: CustomerInfo) => void
  setPolicyAccepted: (accepted: boolean) => void
  confirm: (needsWaiver: boolean) => void
  totalPrice: number
  totalDuration: number
  canProceed: boolean
  reset: () => void
}

const BookingContext = createContext<BookingContextValue | null>(null)

const emptyCustomerInfo: CustomerInfo = { name: '', email: '', phone: '' }

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function BookingProvider({
  children,
  services,
  initialServiceId,
}: {
  children: ReactNode
  services: Service[]
  initialServiceId?: string
}) {
  const [step, setStep] = useState<BookingStep>('booking')
  // State initializer runs once on mount — pre-selects the service with no visible flash
  const [selectedService, setSelectedService] = useState<Service | null>(() =>
    initialServiceId ? (services.find((s) => s.id === initialServiceId) ?? null) : null,
  )
  const [selectedDate, _setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedSlotStartAt, setSelectedSlotStartAt] = useState<string | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(emptyCustomerInfo)
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [confirmedNeedsWaiver, setConfirmedNeedsWaiver] = useState<boolean | null>(null)

  const confirm = useCallback((needsWaiver: boolean) => {
    setConfirmedNeedsWaiver(needsWaiver)
    setStep('confirmed')
  }, [])

  // Cascade: changing service clears date and time (availability differs per service)
  const selectService = useCallback((service: Service | null) => {
    setSelectedService(service)
    _setSelectedDate(null)
    setSelectedTime(null)
    setSelectedSlotStartAt(null)
  }, [])

  // Cascade: changing date clears the selected time slot
  const setSelectedDate = useCallback((date: Date | null) => {
    _setSelectedDate(date)
    setSelectedTime(null)
    setSelectedSlotStartAt(null)
  }, [])

  // Set both the display time (HH:mm) and Square's UTC startAt together
  const selectTimeSlot = useCallback((time: string | null, startAt: string | null) => {
    setSelectedTime(time)
    setSelectedSlotStartAt(startAt)
  }, [])

  const totalPrice = selectedService?.price ?? 0
  const totalDuration = selectedService?.duration ?? 0

  const canProceed = (() => {
    switch (step) {
      case 'booking':
        return selectedService !== null && selectedDate !== null && selectedTime !== null
      case 'info':
        return (
          customerInfo.name.trim().length >= 2 &&
          isValidEmail(customerInfo.email) &&
          customerInfo.phone.replace(/\D/g, '').length >= 7
        )
      case 'summary':
        return policyAccepted
      case 'confirmed':
        return true
    }
  })()

  const reset = useCallback(() => {
    setStep('booking')
    setSelectedService(null)
    _setSelectedDate(null)
    setSelectedTime(null)
    setSelectedSlotStartAt(null)
    setCustomerInfo(emptyCustomerInfo)
    setPolicyAccepted(false)
    setConfirmedNeedsWaiver(null)
  }, [])

  return (
    <BookingContext.Provider
      value={{
        step,
        setStep,
        services,
        selectedService,
        selectService,
        selectedDate,
        setSelectedDate,
        selectedTime,
        selectedSlotStartAt,
        selectTimeSlot,
        customerInfo,
        setCustomerInfo,
        policyAccepted,
        setPolicyAccepted,
        confirmedNeedsWaiver,
        confirm,
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
