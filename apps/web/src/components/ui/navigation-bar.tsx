'use client';

import SpaIcon from "./spa-icon";
import { useRouter } from "next/navigation";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react";

const NavigationBar = () => {
    const router = useRouter();

    return (
        <header className="fixed top-0 left-0 right-0 width-inherit z-50 border-b border-surface-border bg-background-dark/90 backdrop-blur-md px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3 text-white cursor-pointer" onClick={() => router.push('/')}>
                    <SpaIcon className="text-4xl text-primary" />
                    <h2 className="text-white text-xl font-bold tracking-tight font-display">
                        BeautyByAmy
                    </h2>
                </div>

                <nav className="hidden md:flex flex-1 justify-center gap-10">
                    <a
                    className="text-stone-300 hover:text-primary text-sm font-medium transition-colors"
                    href="#"
                    >
                    Services
                    </a>
                    <a
                    className="text-stone-300 hover:text-primary text-sm font-medium transition-colors"
                    href="#"
                    >
                    Gallery
                    </a>
                    <a
                    className="text-stone-300 hover:text-primary text-sm font-medium transition-colors"
                    href="#"
                    >
                    About
                    </a>
                    <a
                    className="text-stone-300 hover:text-primary text-sm font-medium transition-colors"
                    href="#"
                    >
                    Contact
                    </a>
                </nav>

                <div className="flex items-center gap-4">
                    <button className="hidden sm:flex h-10 items-center justify-center rounded-full bg-primary px-6 text-background-dark text-sm font-bold hover:bg-primary-hover hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/20 cursor-pointer" type="button" onClick={() => router.push('/booking')}>
                    Book Now
                    </button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="md:hidden text-white" aria-label="Open menu">
                                <Menu className="text-primary" />
                            </button>
                        </SheetTrigger>
                        <SheetContent className="border-b border-surface-border bg-background-dark">
                            <SheetHeader>
                                <SheetTitle>
                                    <SpaIcon className="size-8 text-primary justify-self-center" />
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col justify-center">
                                <a
                                className="text-stone-300 active:bg-primary active:text-background-dark text-sm font-medium transition-colors px-6 py-4"
                                href="/services"
                                >
                                    Services
                                </a>
                                <a
                                className="text-stone-300 active:bg-primary active:text-background-dark text-sm font-medium transition-colors px-6 py-4"
                                href="/gallery"
                                >
                                    Gallery
                                </a>
                                <a
                                className="text-stone-300 active:bg-primary active:text-background-dark text-sm font-medium transition-colors px-6 py-4"
                                href="/about"
                                >
                                    About
                                </a>
                                <a
                                className="text-stone-300 active:bg-primary active:text-background-dark text-sm font-medium transition-colors px-6 py-4"
                                href="/contact"
                                >
                                    Contact
                                </a>
                            </nav>
                            <SheetFooter>
                                <button className="sm:flex h-10 items-center justify-center rounded-full bg-primary px-6 text-background-dark text-sm font-bold active:bg-primary-hover active:scale-105 transition-all duration-200 shadow-lg shadow-primary/20" type="button" onClick={() => router.push('/booking')}>
                                    Book Now
                                </button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}

export default NavigationBar