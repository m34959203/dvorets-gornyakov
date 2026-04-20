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
  video_url: z.string().url().optional().or(z.literal("")),
  embed_code: z.string().max(4000).optional().or(z.literal("")),
  category: z.string().max(100).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const eventSubscribeSchema = z.object({
  email: z.string().email(),
});

export const clubSchema = z.object({
  name_kk: z.string().min(1).max(255),
  name_ru: z.string().min(1).max(255),
  description_kk: z.string(),
  description_ru: z.string(),
  image_url: z.string().url().optional().or(z.literal("")),
  age_group: z.string().max(50).optional(),
  direction: z.string().max(100).optional(),
  instructor_id: z.string().uuid("Руководитель кружка обязателен"),
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

export const rentalRequestSchema = z.object({
  hall_id: z.string().uuid("Invalid hall ID"),
  name: z.string().min(2).max(255),
  phone: z.string().regex(/^\+?[0-9\s\-()]{10,20}$/, "Phone format: +7 7XX XXX XX XX"),
  email: z.string().email(),
  event_type: z.enum(["concert", "conference", "corporate", "school", "other"]),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format: YYYY-MM-DD"),
  time_from: z.string().regex(/^\d{2}:\d{2}$/, "Time format: HH:MM"),
  time_to: z.string().regex(/^\d{2}:\d{2}$/, "Time format: HH:MM"),
  guests: z.number().int().min(1).max(2000),
  equipment: z.array(z.enum(["mic", "projector", "lights", "streaming", "catering"])).default([]),
  message: z.string().max(2000).optional().default(""),
  website: z.string().max(0).optional(), // honeypot
});

export const rentalRequestStatusSchema = z.object({
  status: z.enum(["new", "contacted", "confirmed", "rejected", "completed"]),
  admin_note: z.string().max(4000).optional(),
});

export const hallSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(100),
  name_kk: z.string().min(1).max(255),
  name_ru: z.string().min(1).max(255),
  description_kk: z.string().default(""),
  description_ru: z.string().default(""),
  capacity: z.number().int().min(0).max(10000),
  equipment_kk: z.array(z.string()).default([]),
  equipment_ru: z.array(z.string()).default([]),
  hourly_price: z.number().int().min(0),
  event_price_from: z.number().int().min(0),
  photos: z
    .array(
      z.object({
        url: z.string(),
        alt_kk: z.string().optional().default(""),
        alt_ru: z.string().optional().default(""),
      })
    )
    .default([]),
  layout_url: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const bannerSchema = z.object({
  title: z.string().min(1).max(255),
  image_url: z.string().url(),
  link_url: z.string().url().optional().or(z.literal("")),
  position: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
  name: z.string().min(2).max(255),
  role: z.enum(["admin", "editor", "instructor"]).default("editor"),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  role: z.enum(["admin", "editor", "instructor"]).optional(),
  password: z.string().min(6).max(200).optional().or(z.literal("")),
});

export const settingsBulkSchema = z.object({
  items: z.array(z.object({
    key: z.string().min(1).max(100),
    value: z.string().max(4000),
  })).min(1).max(100),
});

export const navItemSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9][a-z0-9-_]*$/i, "Slug: a-z, 0-9, -, _"),
  title_kk: z.string().min(1).max(200),
  title_ru: z.string().min(1).max(200),
  url: z.string().min(1).max(500),
  parent_id: z.string().uuid().nullable().optional(),
  target: z.enum(["_self", "_blank"]).default("_self"),
  sort_order: z.number().int().min(0).max(100000).optional(),
  is_active: z.boolean().optional(),
});

export const navItemReorderSchema = z.object({
  direction: z.enum(["up", "down"]),
});

export const chatbotKbSchema = z.object({
  category: z.string().min(1).max(100).default("general"),
  question_kk: z.string().max(2000).default(""),
  question_ru: z.string().max(2000).default(""),
  answer_kk: z.string().max(4000).default(""),
  answer_ru: z.string().max(4000).default(""),
});

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => i.message).join(", ");
    return { error: errors };
  }
  return { data: result.data };
}
