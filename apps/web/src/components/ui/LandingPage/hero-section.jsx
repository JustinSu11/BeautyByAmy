import { MonitorPlay } from "lucide-react"

const HeroSection = () => {
    return (
        <section className="relative min-h-150 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="hero-image-container w-full h-full">
                    <img
                        alt="Close up of woman's face with perfect eyebrows"
                        className="w-full h-full object-cover object-center opacity-60 grayscale-20"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLtkkcPmrH4iuyCNYPcVDrxCaG7u7JlYTwmFw1WL42EZcROBLy0x-wEfI-gQJFHYRhL5TSjXEJJ36VVPVQ6mFa34ozVGKpw85AdP0_i5H1WK9wWd2R5JXrxQc3N8L7c73-JXEQqnDm4ledJrLPxU1SfahjjmDL5brDqbujkAeA9OODE-0cFXL8VdIjQ_rHmAxhisxRnmO7unfn0hDZFLJ3CJWpRZTXIJhNO6xZkQbq8LIfx3UN4-KH6Y1cuAvEUcnVg5IpAprEOIuU"
                    />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-background-dark via-background-dark/60 to-transparent" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-center max-w-4xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Accepting New Clients
                </div>

                <h1 className="text-white text-5xl md:text-7xl font-medium font-display leading-tight tracking-tight mb-6 drop-shadow-lg">
                Frame Your Face.
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-[#E7CBA9] italic">
                    Perfect Your Look.
                </span>
                </h1>

                <p className="text-stone-300 text-lg md:text-xl font-light leading-relaxed mb-10 max-w-2xl mx-auto text-balance">
                Expert microblading, threading, and tinting services tailored to your
                unique facial structure. Discover the power of perfect arches in a serene
                environment.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="h-12 px-8 rounded-full bg-primary text-surface-dark text-base font-bold hover:bg-[#E8CBA8] hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/25 w-full sm:w-auto cursor-pointer">
                    View Availability
                </button>

                <button className="h-12 px-8 rounded-full bg-stone-800/50 border border-stone-600 text-stone-100 text-base font-medium hover:bg-stone-800 backdrop-blur-sm hover:scale-105 transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer">
                    <MonitorPlay className="text-primary" />
                    Watch Process
                </button>
                </div>
            </div>
        </section>
    )
}

export default HeroSection