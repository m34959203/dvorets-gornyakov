import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const enrollmentSchema = z.object({
  club_id: z.string().uuid("Invalid club ID"),
  child_name: z.string().min(2, "Name is too short").max(100),
  child_age: z.number().int().min(1).max(99),
  parent_name: z.string().min(2, "Name is too short").max(100),
  phone: z.string().regex(/^\+7\s?7\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/, "Phone format: +7 7XX XXX XX XX"),
  email: z.string().email().optional().or(z.literal("")),
});

export const newsSchema = z.object({
  title_kk: z.string().min(1).max(500),
  title_ru: z.string().min(1).max(500),
  content_kk: z.string().min(1),
  content_ru: z.string().min(1),
  excerpt_kk: z.string().max(1000).optional(),
  excerpt_ru: z.string().max(1000).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  category: z.string().max(100).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const clubSchema = z.object({
  name_kk: z.string().min(1).max(255),
  name_ru: z.string().min(1).max(255),
  description_kk: z.string(),
  description_ru: z.string(),
  image_url: z.string().url().optional().or(z.literal("")),
  age_group: z.string().max(50).optional(),
  direction: z.string().max(100).optional(),
  instructor_name: z.string().max(255).optional(),
  schedule: z.array(z.object({
    day: z.string(),
    time: z.string(),
  })).optional(),
  is_active: z.boolean().optional(),
});

export const eventSchema = z.object({
  title_kk: z.string().min(1).max(500),
  title_ru: z.string().min(1).max(500),
  description_kk: z.string(),
  description_ru: z.string(),
  image_url: z.string().url().optional().or(z.literal("")),
  event_type: z.enum(["concert", "exhibition", "workshop", "festival", "competition", "other"]).optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  location: z.string().max(255).optional(),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]).optional(),
});

export const chatbotSchema = z.object({
  message: z.string().min(1).max(2000),
  locale: z.enum(["kk", "ru"]).optional(),
  history: z.array(z.object({
    role: z.enum(["user", "model"]),
    text: z.string(),
  })).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(2000),
});

export const bannerSchema = z.object({
  title: z.string().min(1).max(255),
  image_url: z.string().url(),
  link_url: z.string().url().optional().or(z.literal("")),
  position: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => i.message).join(", ");
    return { error: errors };
  }
  return { data: result.data };
}
