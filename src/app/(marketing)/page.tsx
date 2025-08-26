import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export default function Home() {
    return (
        <div>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <NavigationMenuLink href="/services">
                                View Services {/*replace with an actual service later*/}
                            </NavigationMenuLink>
                            <NavigationMenuLink>
                                View Services {/*replace with an actual service later*/}
                            </NavigationMenuLink>
                            <NavigationMenuLink>
                                View Services {/*replace with an actual service later*/}
                            </NavigationMenuLink>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}