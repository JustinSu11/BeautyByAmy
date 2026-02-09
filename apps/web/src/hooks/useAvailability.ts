'use client'

import { StringToBoolean } from 'class-variance-authority/types'
import { useState, useEffect } from 'react'
import { types } from 'util'

interface AvailabilityData{
    availabilities: {
        startAt: string
        locationId: string
        appointmentSegments: {
            durationMinutes: number
            serviceVariationId: string
            teamMemberId: string
            serviceVariationVersion: number
        }[]
    }[]
}
export function useAvailability(variationId: string | null) {
    const [availability, setAvailability] = useState<AvailabilityData | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        if (!variationId) {
            setAvailability(null)
            return
        }

        setLoading(true)
        fetch(`/api/square/availability?variationId=${variationId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch availability, This error was printed from useAvailability.ts')
            }
            return response.json()
    })
        .then(data => setAvailability(data))
        .finally(() => setLoading(false))

    }, [variationId])

    return { availability, loading }
}