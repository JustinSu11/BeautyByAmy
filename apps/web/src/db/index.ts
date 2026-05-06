// apps/web/src/db/index.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// DATABASE_URL is only required at request time, not at build time.
// The placeholder prevents neon() from throwing during Next.js static analysis;
// any actual query will fail fast if DATABASE_URL is not set at runtime.
const sql = neon(process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@placeholder/placeholder')
export const db = drizzle(sql, { schema })
