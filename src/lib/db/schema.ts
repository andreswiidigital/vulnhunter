import { pgTable, uuid, text, timestamp, boolean, jsonb, integer, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabela de Scans
export const scans = pgTable('scans', {
  id: uuid('id').defaultRandom().primaryKey(),
  targetUrl: text('target_url').notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Vulnerabilidades
export const vulnerabilities = pgTable('vulnerabilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  scanId: uuid('scan_id').references(() => scans.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 100 }).notNull(),
  endpoint: text('endpoint').notNull(),
  method: varchar('method', { length: 10 }),
  parameter: text('parameter'),
  severity: varchar('severity', { length: 20 }),
  description: text('description'),
  proof: jsonb('proof'),
  exploited: boolean('exploited').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de Exploits Executados
export const exploits = pgTable('exploits', {
  id: uuid('id').defaultRandom().primaryKey(),
  vulnerabilityId: uuid('vulnerability_id').references(() => vulnerabilities.id, { onDelete: 'cascade' }),
  exploitType: varchar('exploit_type', { length: 100 }).notNull(),
  payload: jsonb('payload'),
  result: jsonb('result'),
  evidence: jsonb('evidence'),
  executedAt: timestamp('executed_at').defaultNow(),
});

// Relações
export const scansRelations = relations(scans, ({ many }) => ({
  vulnerabilities: many(vulnerabilities),
}));

export const vulnerabilitiesRelations = relations(vulnerabilities, ({ one, many }) => ({
  scan: one(scans, {
    fields: [vulnerabilities.scanId],
    references: [scans.id],
  }),
  exploits: many(exploits),
}));

export const exploitsRelations = relations(exploits, ({ one }) => ({
  vulnerability: one(vulnerabilities, {
    fields: [exploits.vulnerabilityId],
    references: [vulnerabilities.id],
  }),
}));
