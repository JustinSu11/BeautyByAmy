import { ChevronRight, ArrowRight, Spool, Brush, Palette } from "lucide-react"

const ServicesSection = () => {
    return (
        <section className="bg-background-dark py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="max-w-xl">
                    <h2 className="text-white text-3xl md:text-4xl font-display font-medium tracking-tight mb-4">
                    Our Signature Services
                    </h2>
                    <p className="text-stone-400 text-lg font-light">
                    We specialize in precision techniques to enhance your natural beauty.
                    Each service is customized to your needs.
                    </p>
                </div>

                <a
                    className="text-primary font-bold hover:text-white transition-colors flex items-center gap-1 group"
                    href="#"
                >
                    See full price list
                    <ArrowRight className="transition-transform group-hover:translate-x-1"/>
                </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="group relative overflow-hidden rounded-4xl border border-surface-border bg-surface-dark p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-black/20">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
                        <div className="mb-6 inline-flex p-3 rounded-2xl bg-[#36302B] text-primary group-hover:bg-primary group-hover:text-surface-dark transition-colors border border-surface-border">
                            <Brush />
                        </div>
                        <h3 className="text-white text-2xl font-display font-medium mb-3">
                            Microblading
                        </h3>
                        <p className="text-stone-400 leading-relaxed mb-6 font-light">
                        Semi-permanent pigment for natural-looking fullness that mimics real
                        hair strokes. Wake up with perfect brows every day.
                        </p>
                        <a
                        className="inline-flex items-center text-sm font-bold text-white group-hover:text-primary transition-colors"
                        href="#"
                        >
                            Learn More
                            <ChevronRight />
                        </a>
                    </div>

                    {/* Card 2 */}
                    <div className="group relative overflow-hidden rounded-4xl border border-surface-border bg-surface-dark p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-black/20">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
                        <div className="mb-6 inline-flex p-3 rounded-2xl bg-[#36302B] text-primary group-hover:bg-primary group-hover:text-surface-dark transition-colors border border-surface-border">
                            <Spool />
                        </div>
                        <h3 className="text-white text-2xl font-display font-medium mb-3">
                        Threading
                        </h3>
                        <p className="text-stone-400 leading-relaxed mb-6 font-light">
                        Ancient technique using cotton thread for precise hair removal,
                        resulting in clean, sharply defined arches without chemicals.
                        </p>
                        <a
                        className="inline-flex items-center text-sm font-bold text-white group-hover:text-primary transition-colors"
                        href="#"
                        >
                            Learn More
                            <ChevronRight />
                        </a>
                    </div>

                    {/* Card 3 */}
                    <div className="group relative overflow-hidden rounded-4xl border border-surface-border bg-surface-dark p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-black/20">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
                        <div className="mb-6 inline-flex p-3 rounded-2xl bg-[#36302B] text-primary group-hover:bg-primary group-hover:text-surface-dark transition-colors border border-surface-border">
                            <Palette />
                        </div>
                        <h3 className="text-white text-2xl font-display font-medium mb-3">
                            Tinting
                        </h3>
                        <p className="text-stone-400 leading-relaxed mb-6 font-light">
                        Vegetable-based dye enhancement to define and darken your brows.
                            Perfect for lighter hair or those wanting a bolder look.
                        </p>
                        <a
                        className="inline-flex items-center text-sm font-bold text-white group-hover:text-primary transition-colors"
                        href="#"
                        >
                            Learn More
                            <ChevronRight />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ServicesSection