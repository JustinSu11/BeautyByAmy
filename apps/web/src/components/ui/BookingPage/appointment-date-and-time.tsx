'use client'

import { useState, useEffect } from 'react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import 'react-day-picker/style.css'
import { useAvailability } from '@/hooks/useAvailability'
import { useBooking } from '@/context/BookingContext'

const AppointmentDateAndTime = () => {
    const { selectedService } = useBooking()
    const [selectedDate, setSelectedDate] = useState<Date>()
    const { availability, loading } = useAvailability(selectedService ? selectedService.variationId : null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    useEffect(() => {
        if (availability) {
            console.log('Availability response: ', availability)
        }
    }, [availability])

    useEffect(() => {
        if (availability && selectedDate) {
            console.log('Selected date:', selectedDate.toDateString())
            console.log('Total slots:', availability.availabilities?.length)
            
            // Logging to debug
            availability.availabilities?.slice(0, 5).forEach(slot => {
                const slotDate = new Date(slot.startAt)
                console.log('Slot date:', slotDate.toDateString(), 'Time:', slot.startAt)
            })
        }
    }, [availability, selectedDate])

    return (
        <section className="bg-surface-dark border border-surface-border rounded-4xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-surface-dark font-bold text-sm">
                2
                </span>
                <h2 className="text-2xl text-white font-display">Date &amp; Time</h2>
            </div> 

            <div className="mb-8">
                <DayPicker animate mode="single" selected={selectedDate} onSelect={setSelectedDate} endMonth={new Date(new Date().setFullYear(new Date().getFullYear() + 1))} classNames={{
                    today: 'text-primary font-bold',
                    button_next: 'text-primary cursor-pointer',
                    button_previous: 'text-primary cursor-pointer',
                    chevron: 'fill-current',
                    root: `${getDefaultClassNames().root} justify-self-center`
                }} modifiersClassNames={{
                    selected: 'bg-primary rounded-full !text-background-dark font-bold',
                }} disabled={{ 
                    dayOfWeek: [0, 6],

                }} />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {loading ? (
                    <p className="text-stone-400 col-span-full">
                        Loading time slots...
                    </p>
                ) : !selectedDate ? (
                    <p className="text-stone-400 col-span-full">
                        Select a date
                    </p>
                ) : availability?.availabilities?.filter(slot => {
                // Filter slots that match the selected date
                const slotDate = new Date(slot.startAt)
                return slotDate.toDateString() === selectedDate.toDateString()
                }).map((slot) => {
                    const time = new Date(slot.startAt)
                    const timeString = time.toLocaleTimeString(
                        'en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        })
                    const isSelected = selectedTime === slot.startAt
                    return (
                        <button
                        key={slot.startAt}
                        onClick={() => setSelectedTime(slot.startAt)}
                        className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                    isSelected 
                        ? 'bg-primary border border-primary text-surface-dark font-bold shadow-md'
                        : 'border border-surface-border text-stone-300 hover:border-primary hover:text-primary'
                }`}
                    >
                        {timeString}
                        </button>
                    )
                }) || (
                    <p className="text-stone-400 col-span-full">
                        No available slots for the selected date.
                    </p>
                )}
            </div>
        </section>
    )
    
}

export default AppointmentDateAndTime