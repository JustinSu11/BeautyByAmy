import { SquareClient } from 'square'

const client = new SquareClient({ 
    token: process.env.SQUARE_ACCESS_TOKEN,
    baseUrl: 'https://connect.squareup.com'
});

// Helper to convert BigInt to Number recursively
function convertBigInt(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
    ))
}

//helper function to format duration from milliseconds to "X hr Y min"
function formatDuration(milliseconds) {
    if (!milliseconds) return '0 min'
    if (typeof milliseconds !== 'number') milliseconds = Number(milliseconds)
    const totalMinutes = Math.round(milliseconds/60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours === 0) return `${minutes} min`
    if (minutes === 0) return `${hours} hr`
    return `${hours} hr ${minutes} min`
}

export async function GET() {
    try {
        const response = await client.catalog.list({ types: 'ITEM'})

        // Filter for bookable appointment services only
        const services = [...response.data]
            .filter(item => item.itemData?.productType === 'APPOINTMENTS_SERVICE')
            .map(item => {
                // Get the first variation with booking enabled
                const variation = item.itemData?.variations?.find(v => 
                    v.itemVariationData?.availableForBooking
                ) || item.itemData?.variations?.[0]
                
                return {
                    id: item.id,
                    name: item.itemData?.name,
                    description: item.itemData?.descriptionPlaintext || item.itemData?.description,
                    variationId: variation?.id,
                    price: variation?.itemVariationData?.priceMoney?.amount,
                    currency: variation?.itemVariationData?.priceMoney?.currency || 'USD',
                    rawDuration: variation?.itemVariationData?.serviceDuration,
                    formattedDuration: formatDuration(variation?.itemVariationData?.serviceDuration),
                    teamMemberIds: variation?.itemVariationData?.teamMemberIds
                }
            })
            // Filter out services where variation doesn't exist
            .filter(service => service.variationId)

        console.log('Filtered services count:', services.length)

        // Convert all BigInt values before sending
        return Response.json(convertBigInt(services))
    } catch (error) {
        console.error('Error fetching services:', error)
        return Response.json({ error: 'Failed to fetch services' }, { status: 500})
    }
}