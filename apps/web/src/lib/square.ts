import { Client, Environment } from 'square'

const environment =
  process.env.NODE_ENV === 'production'
    ? Environment.Production
    : Environment.Sandbox

export const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment,
})
