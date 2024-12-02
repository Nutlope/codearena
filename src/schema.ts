import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
};

export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  creatorCookie: text("creator_cookie_id").notNull(),
  ...timestamps,
});

export const battlesRelations = relations(battles, ({ many }) => ({
  apps: many(apps),
}));

export const apps = pgTable("participants", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id")
    .notNull()
    .references(() => battles.id),
  model: text("model").notNull(),
  didWin: boolean("did_win").notNull(),
  code: text("code").notNull(),
  ...timestamps,
});

export const appsRelations = relations(apps, ({ one }) => ({
  battle: one(battles, {
    fields: [apps.battleId],
    references: [battles.id],
  }),
}));