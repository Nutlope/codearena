import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
};

export const battles = pgTable(
  "battles",
  {
    id: serial("id").primaryKey(),
    prompt: text("prompt").notNull(),
    creatorCookie: text("creator_cookie_id").notNull(),
    ...timestamps,
  },
  (table) => {
    return {
      creatorCookieIdx: index("creator_cookie_idx").on(table.creatorCookie),
    };
  },
);

export type Battle = typeof battles.$inferSelect;

export const battlesRelations = relations(battles, ({ many }) => ({
  apps: many(apps),
}));

export const apps = pgTable(
  "apps",
  {
    id: serial("id").primaryKey(),
    battleId: integer("battle_id")
      .notNull()
      .references(() => battles.id),
    model: text("model").notNull(),
    didWin: boolean("did_win").notNull(),
    code: text("code").notNull(),
    trimmedCode: text("trimmed_code").notNull(),
    totalTime: integer("total_time"),
    isMultiCall: boolean("is_multi_call").notNull().default(false),
    completionTokens: integer("completion_tokens"),
    ...timestamps,
  },
  (table) => {
    return {
      modelIdx: index("model_idx").on(table.model),
      didWinIdx: index("did_win_idx").on(table.didWin),
    };
  },
);

export type App = typeof apps.$inferSelect;

export const appsRelations = relations(apps, ({ one }) => ({
  battle: one(battles, {
    fields: [apps.battleId],
    references: [battles.id],
  }),
}));
