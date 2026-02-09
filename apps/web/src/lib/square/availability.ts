import { SquareClient } from 'square';

const client = new SquareClient({ token: process.env.SQUARE_ACCESS_TOKEN });

//Get availability from current date + 1 year
async function getAvailability(serviceVariationId: string) {
    try {
        const response = await client.bookings.searchAvailability({
            query: {
                filter: {
                    startAtRange: {
                        startAt: new Date().toISOString(),
                        endAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
                    },
                    segmentFilters: [{
                        serviceVariationId: serviceVariationId
                    }]
                }
            }
        })
        return response
    } catch (error) {
        console.error('Error fetching availability:', error);
        throw error
    }
}

export default getAvailability