'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Service } from '@/hooks/useServices'

// Below is what will be in the context
interface BookingContextType {
    selectedService: Service | null
    setSelectedService: (service: Service | null) => void
    // Add more as needed
}

// Create the context
const BookingContext = createContext<BookingContextType | undefined>(undefined)

// Create a provider component
export function BookingProvider({ children }: { children: ReactNode }) {
    const [selectedService, setSelectedService] = useState<Service | null>(null)

    return (
    <BookingContext.Provider value={{ selectedService, setSelectedService}}>
        {children}
    </BookingContext.Provider>)
}

export function useBooking() {
    const context = useContext(BookingContext)
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider component')
    }
    console.log('Variation ID from context:', context.selectedService?.variationId)
    return context
}