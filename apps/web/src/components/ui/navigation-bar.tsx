import SpaIcon from "./spa-icon";

const NavigationBar = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-surface-border bg-background-dark/90 backdrop-blur-md px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
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
                    <button className="hidden sm:flex h-10 items-center justify-center rounded-full bg-primary px-6 text-background-dark text-sm font-bold hover:bg-primary-hover hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/20 cursor-pointer">
                    Book Now
                    </button>

                    <button className="md:hidden text-white" aria-label="Open menu">
                    <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default NavigationBar