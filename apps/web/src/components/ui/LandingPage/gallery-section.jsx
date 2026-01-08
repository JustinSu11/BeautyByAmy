import { ArrowRight, ArrowLeft, GalleryVerticalEnd } from "lucide-react"

const GallerySection = () => {
    return (
        <section className="border-y border-surface-border bg-[#24211E] py-16 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                <h3 className="text-white text-2xl font-display font-medium">
                    Latest Transformations
                </h3>
                <div className="flex gap-2">
                    <button className="p-2 rounded-full border border-surface-border hover:bg-surface-border text-white transition-colors cursor-pointer" aria-label="Previous">
                        <ArrowLeft />
                    </button>
                    <button className="p-2 rounded-full border border-surface-border hover:bg-surface-border text-white transition-colors cursor-pointer" aria-label="Next">
                        <ArrowRight />
                    </button>
                </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                    alt: "Woman face eyebrow closeup",
                    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZ1N6uZumJLySXg3WFCERKMi6uS65-OVZzQHUEwm_oHAh3JuPnS1pkSjfTeeshHq00kB91YRRIpW-Aczm1X8al0ULGgTXU0oK1zf4Y8OYwCgJliprIZypbCwbkBPJx5IbMxn3--5aV7IsgiIpgzGHW3fGx-FqjOVE14nkqHUXHxbFc3KJxVfwWdl5vmRGpaJesKsUaMehss-UCh9mqskHl6mjHjpiMkSwDrYUJ2cTQj7Ziv8r6MbnEG4eYKbHU3BFiiXeuT9eBvw_9",
                    },
                    {
                    alt: "Blonde woman eyebrows styling",
                    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUefqLo_ewme_Z-8PdAtK5aO8CWVrLhoHeN8Qlo4i9WWtsRKoJlge835Wto1xF7VYfquRJK5kVJwaHy8WiRmwGs_mDz-zC4WPKLOyMY1uGAYkOmVcY8GLfh1LfXk8PptOYOO4CJGjejIcQr1Eq_zhA3E2JUM4r9FiFEDjtI4dpWa-1QZK0PsOD-9J5tmd9WsWMG2nlhjIrlvkizOGvofzsc_hqTQbzwlfkSNIXBrQKBWpa7_DPuqKQ8Xis-OMpD4Ox2rBK_o1OXYAA",
                    },
                    {
                    alt: "Makeup artist applying eyebrow tint",
                    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwmIlDHDiwdgZHwXk4gvk7AKYIIq58wiIpsR6IPev3RYzSsk_e8CEl2jUxpW8-Lso7n5zfwj-6wqW3QmGKjT8UgDK4S21RWS2xFkcAEMwLha579E3vz5_AAJqNWA13Y37nYUKtvEbaEzUwm7vXfyiWX59_84XQn584UgiC-z0_fXNzid8owGc9T7DEwKIOlN5hfnMCesq_v5vON5fED8rnRM27-_ihrTsMIQzTR6Spmv2-ZDafo5dkhgk7AuQGb6tl-ZsWYcHM6UZ0",
                    },
                    {
                    alt: "Finished eyebrow threading result",
                    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXsp_6Bd_6H7CfXEDN7AKQlwcMgEZoCcLy6I0d6VDrB8hXGoa_N_xOhogd1gAbI8uhli9PSMCBAOjyqRZ0EwL791ZAwAi-Gwoxkax1wII6sZT-Pa56qqY0-IcvFARTjQuWfgUGgjNUPY2RCkDYHGd2d_BNNs8dLA1IH-OSjIEeOQbYz61-BcH7fXJuWGqWruckrKeMiTIFqVJSmuvDaWlvmWfdCvF5nkNxBMG_pjqsIl2EQ9ml60tyoKcCbT3tPn5RoGX2Hc81Pc67",
                    },
                ].map((img) => (
                    <div
                    key={img.src}
                    className="aspect-square rounded-2xl overflow-hidden group cursor-pointer relative shadow-lg"
                    >
                    <img
                        alt={img.alt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 sepia-[20%]"
                        src={img.src}
                    />
                    <div className="absolute inset-0 bg-[#292524]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <GalleryVerticalEnd />
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </section>
    )
}

export default GallerySection