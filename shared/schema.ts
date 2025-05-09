import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export interface AuthConfig {
  type: 'form' | 'json' | 'session-replay' | 'basic';
  loginUrl?: string;
  logoutUrl?: string;
  usernameField?: string;
  passwordField?: string;
  credentials?: {
    username: string;
    password: string;
    [key: string]: string;
  };
  verificationPattern?: string;
  sessionCookies?: string[];
  headers?: Record<string, string>;
}
