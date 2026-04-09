'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Service } from './services-data'

export type BookingStep = 'booking' | 'info' | 'summary'

export interface CustomerInfo {
  name: string
  email: string
  phone: string
}

interface BookingState {
  step: BookingStep
  selectedService: Service | null
  selectedDate: Date | null
  selectedTime: string | null
  customerInfo: CustomerInfo
  policyAccepted: boolean
}

interface BookingContextValue extends BookingState {
  setStep: (step: BookingStep) => void
  selectService: (service: Service | null) => void
  setSelectedDate: (date: Date | null) => void
  setSelectedTime: (time: string | null) => void
  setCustomerInfo: (info: CustomerInfo) => void
  setPolicyAccepted: (accepted: boolean) => void
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

export function BookingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<BookingStep>('booking')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(emptyCustomerInfo)
  const [policyAccepted, setPolicyAccepted] = useState(false)

  const selectService = useCallback((service: Service | null) => {
    setSelectedService(service)
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
    }
  })()

  const reset = useCallback(() => {
    setStep('booking')
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setCustomerInfo(emptyCustomerInfo)
    setPolicyAccepted(false)
  }, [])

  return (
    <BookingContext.Provider
      value={{
        step,
        setStep,
        selectedService,
        selectService,
        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,
        customerInfo,
        setCustomerInfo,
        policyAccepted,
        setPolicyAccepted,
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
