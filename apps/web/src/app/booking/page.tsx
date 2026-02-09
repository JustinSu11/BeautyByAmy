'use client'

import React from "react";
import NavigationBar from "@/components/ui/navigation-bar";
import ServiceSelectionBox from "@/components/ui/BookingPage/service-selection-box";
import FooterSection from "@/components/ui/footer-section";
import AppointmentDateAndTime from "@/components/ui/BookingPage/appointment-date-and-time";
import { BookingProvider } from '@/context/BookingContext'

export default function BookAppointmentPage() {

  return (
    <div className="bg-background-light dark:bg-background-dark font-body text-stone-800 dark:text-stone-200 min-h-screen flex flex-col selection:bg-primary selection:text-white">
        <NavigationBar />
        <BookingProvider>
            <div className="flex-grow pt-[88px] pb-20">
                <div className="max-w-7xl mx-auto px-6">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-white text-4xl md:text-5xl font-display font-medium mb-3">
                    Book Your Experience
                    </h1>
                    <p className="text-stone-400 text-lg font-light max-w-2xl">
                    Select your preferred service, specialist, and time. We look forward
                    to enhancing your natural beauty.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                    {/* 1) Select Service */}
                    <ServiceSelectionBox />

                    {/* 2) Date & Time */}
                    <AppointmentDateAndTime />

                    {/* 3) Your Details */}
                    <section className="bg-surface-dark border border-surface-border rounded-[2rem] p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-6">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-surface-dark font-bold text-sm">
                            3
                        </span>
                        <h2 className="text-2xl text-white font-display">Your Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-stone-400 text-sm font-medium">
                            First Name
                            </label>
                            <input
                            className="w-full bg-[#36302B] border border-surface-border rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                            placeholder="e.g. Jane"
                            type="text"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-stone-400 text-sm font-medium">
                            Last Name
                            </label>
                            <input
                            className="w-full bg-[#36302B] border border-surface-border rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                            placeholder="e.g. Doe"
                            type="text"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-stone-400 text-sm font-medium">
                            Email Address
                            </label>
                            <input
                            className="w-full bg-[#36302B] border border-surface-border rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                            placeholder="jane@example.com"
                            type="email"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-stone-400 text-sm font-medium">
                            Phone Number
                            </label>
                            <input
                            className="w-full bg-[#36302B] border border-surface-border rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                            placeholder="(555) 000-0000"
                            type="tel"
                            />
                        </div>
                        </div>

                        <div className="mt-6">
                        <label className="text-stone-400 text-sm font-medium">
                            Special Requests (Optional)
                        </label>
                        <textarea
                            className="w-full bg-[#36302B] border border-surface-border rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none mt-2"
                            placeholder="Allergies, specific preferences..."
                            rows={3}
                        />
                        </div>
                    </section>
                    </div>

                    {/* Summary (Right Column) */}
                    <div className="lg:col-span-4">
                    <div className="sticky top-28 space-y-6">
                        <div className="bg-surface-dark border border-surface-border rounded-[2rem] p-6 shadow-2xl shadow-black/40">
                        <h3 className="text-white text-xl font-display font-medium mb-6 pb-4 border-b border-surface-border">
                            Booking Summary
                        </h3>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[#36302B] flex items-center justify-center text-primary flex-shrink-0">
                                <span className="material-symbols-outlined">brush</span>
                            </div>
                            <div>
                                <p className="text-stone-400 text-xs uppercase tracking-wide font-bold mb-1">
                                Service
                                </p>
                                <p className="text-white font-medium">Microblading Session</p>
                                <p className="text-stone-500 text-sm">120 mins</p>
                            </div>
                            </div>

                            <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[#36302B] flex items-center justify-center text-primary flex-shrink-0">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <div>
                                <p className="text-stone-400 text-xs uppercase tracking-wide font-bold mb-1">
                                Specialist
                                </p>
                                <p className="text-white font-medium">Any Professional</p>
                            </div>
                            </div>

                            <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[#36302B] flex items-center justify-center text-primary flex-shrink-0">
                                <span className="material-symbols-outlined">event</span>
                            </div>
                            <div>
                                <p className="text-stone-400 text-xs uppercase tracking-wide font-bold mb-1">
                                Date &amp; Time
                                </p>
                                <p className="text-white font-medium">Wed, Oct 23</p>
                                <p className="text-stone-500 text-sm">11:30 AM</p>
                            </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-surface-border space-y-3">
                            <div className="flex justify-between text-stone-400">
                            <span>Subtotal</span>
                            <span>$350.00</span>
                            </div>
                            <div className="flex justify-between text-stone-400">
                            <span>Tax (Est.)</span>
                            <span>$28.00</span>
                            </div>
                            <div className="flex justify-between text-white text-lg font-bold pt-2">
                            <span>Total</span>
                            <span className="text-primary">$378.00</span>
                            </div>
                        </div>

                        <button className="w-full mt-8 h-14 rounded-full bg-primary text-surface-dark font-bold text-lg hover:bg-primary-hover hover:scale-[1.02] transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
                            Confirm Appointment
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>

                        <p className="text-center text-stone-600 text-xs mt-4">
                            Free cancellation up to 24 hours before your appointment.
                        </p>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </BookingProvider>
        <FooterSection />
    </div>
  );
}
