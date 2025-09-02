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

export default function Home() {
    return (
        <div>
            <NavigationBar />
            <div>
                {SERVICES.map((service) => (
                    <Card key={service.id} className="m-4 p-4">
                        <CardAction>
                            <CardHeader className="text-xl font-bold">
                                {service.name}
                            </CardHeader>
                            <CardContent>
                                <p>Price: {service.price}</p>
                            </CardContent>
                            <CardFooter>
                                <p>Time: {service.time}</p>
                            </CardFooter>
                        </CardAction>
                    </Card>
                ))}
            </div>
        </div>
    )
}