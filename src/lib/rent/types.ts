export type RentalStatus = "new" | "contacted" | "confirmed" | "rejected" | "completed";
export type EventType = "concert" | "conference" | "corporate" | "school" | "other";
export type EquipmentTag = "mic" | "projector" | "lights" | "streaming" | "catering";

export interface HallPhoto {
  url: string;
  alt_kk?: string;
  alt_ru?: string;
}

export interface Hall {
  id: string;
  slug: string;
  name_kk: string;
  name_ru: string;
  description_kk: string;
  description_ru: string;
  capacity: number;
  equipment_kk: string[];
  equipment_ru: string[];
  hourly_price: number;
  event_price_from: number;
  photos: HallPhoto[];
  layout_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RentalRequest {
  id: string;
  hall_id: string;
  name: string;
  phone: string;
  email: string;
  event_type: EventType;
  event_date: string;
  time_from: string;
  time_to: string;
  guests: number;
  equipment: EquipmentTag[];
  message: string;
  status: RentalStatus;
  admin_note: string;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface RentalRequestWithHall extends RentalRequest {
  hall_name_ru: string;
  hall_name_kk: string;
  hall_slug: string;
}
