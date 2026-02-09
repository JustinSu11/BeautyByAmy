'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useServices } from "@/hooks/useServices"
import { useBooking } from "@/context/BookingContext"

const ServiceSelectionBox = () => {
    const { services, loading } = useServices()
    const { setSelectedService } = useBooking()

    return (
        <section className="bg-surface-dark border border-surface-border rounded-4xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-surface-dark font-bold text-sm">
                    1
                </span>
                <h2 className="text-2xl text-white font-display">
                    Select Service
                </h2>
            </div>


            {loading ? (
                <p className="text-stone-400">Loading services...</p>
            ) : (
                <Select>
                    <SelectTrigger className="w-full min-w-0 rounded-2xl bg-[#36302B] border-surface-border hover:border-primary/50 focus-visible:ring-primary focus-visible:ring-2 cursor-pointer">
                        <SelectValue className="truncate block" placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent
                        position="popper"
                        side="bottom"
                        sideOffset={8}
                        avoidCollisions={false}
                        className="overflow-y-auto overflow-x-hidden w-[var(--radix-select-trigger-width)] rounded-2xl bg-[#36302B] border border-surface-border transition-all duration-200"
                    >
                        {services.map((service) => {
                            return (
                                <SelectItem className="flex text-white hover:text-primary items-center gap-4 border border-[#36302B] hover:border-primary/50 rounded-2xl px-4 py-1 cursor-pointer text-wrap" key={service.id} value={service.variationId} onClick={() => {setSelectedService(service)}}>
                                    <div>
                                        {service.name} - ${service.price/100} ({service.formattedDuration}) 
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            )}
        </section>
    )
}

export default ServiceSelectionBox