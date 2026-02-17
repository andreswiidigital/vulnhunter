import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql as vercelSql } from '@vercel/postgres';
import * as schema from './schema';

export const db = drizzle(vercelSql, { schema });

export type Scan = typeof schema.scans.$inferSelect;
export type Vulnerability = typeof schema.vulnerabilities.$inferSelect;
export type Exploit = typeof schema.exploits.$inferSelect;
