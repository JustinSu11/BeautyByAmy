'use client'

import { useState, useEffect } from 'react'

export interface Service {
    id: string
    name: string
    description: string | null
    variationId: string
    price: number          // in cents (e.g., 50000 = $500)
    currency: string
    rawDuration: number    // milliseconds
    formattedDuration: string  // e.g., "2 hr 30 min"
    teamMemberIds: string[]
}

export function useServices() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        fetch('/api/square/catalog').then(response => response.json()).then(data => setServices(Array.isArray(data) ? data : [])).catch(error => setError(error)).finally(() => setLoading(false))
    }, [])

    return { services, loading, error }
}