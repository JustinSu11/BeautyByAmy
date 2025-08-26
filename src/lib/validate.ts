import { z } from 'zod'
export const CheckoutSchema = z.object({
    serviceId: z.string(),
    startsAt: z.string().datetime(),
    name: z.string().min(2),
    email: z.string().email(),
})

export type CheckoutInput = z.infer<typeof CheckoutSchema>