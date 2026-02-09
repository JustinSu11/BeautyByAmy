import getAvailability from "@/lib/square/availability";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    const availability = await getAvailability(serviceId!)
    return Response.json(availability)
}