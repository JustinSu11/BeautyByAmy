import NavigationBar from "@/components/ui/navigation-bar"
import { SERVICES } from "@/data/services"
import { 
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import HeroSection from "@/components/ui/LandingPage/hero-section"
import ServicesSection from "@/components/ui/LandingPage/services-section"
import GallerySection from "@/components/ui/LandingPage/gallery-section"
import FooterSection from "@/components/ui/footer-section"

export default function Home() {
    return (
        <div className="bg-background-dark font-body text-stone-200 min-h-screen flex flex-col selection:bg-primary selection:text-white">
            <NavigationBar />

            <main className="flex-grow pt-[72px]">
                {/* HERO */}
                <HeroSection />

                {/* SERVICES */}
                <ServicesSection />

                {/* GALLERY */}
                <GallerySection />
            </main>
            {/* FOOTER */}
            <FooterSection />
        </div>
  );
}