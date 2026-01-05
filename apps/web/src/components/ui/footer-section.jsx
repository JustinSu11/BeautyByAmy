import SpaIcon from "@/components/ui/spa-icon"
import { Instagram, Facebook } from "lucide-react"

const FooterSection = () => {
    return (
        <footer className="bg-surface-dark border-t border-surface-border">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                    <div className="flex items-center gap-3 text-white">
                    <span className="material-symbols-outlined text-primary text-3xl">
                        <SpaIcon />
                    </span>
                    <h2 className="text-xl font-bold font-display">BeautyByAmy</h2>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8">
                    <a className="text-stone-400 hover:text-white transition-colors" href="#">
                        Privacy Policy
                    </a>
                    <a className="text-stone-400 hover:text-white transition-colors" href="#">
                        Terms of Service
                    </a>
                    <a className="text-stone-400 hover:text-white transition-colors" href="#">
                        Careers
                    </a>
                    </div>

                    <div className="flex gap-4">
                    {[{platform: "IG", Icon: Instagram}, {platform: "FB", Icon: Facebook}].map(({platform, Icon}) => (
                        <a
                        key={platform}
                        className="w-10 h-10 rounded-full bg-surface-border flex items-center justify-center text-white hover:bg-primary hover:text-surface-dark transition-all"
                        href="#"
                        aria-label={platform}
                        >
                        {<Icon />}
                        </a>
                    ))}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-surface-border text-center text-stone-500 text-sm">
                    <p>© 2026 BeautyByAmy. All rights reserved. Designed for elegance.</p>
                </div>
            </div>
        </footer>
    )
}

export default FooterSection