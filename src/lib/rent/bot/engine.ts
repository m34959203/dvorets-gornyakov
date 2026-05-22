// Диалоговый движок бронирования зала — общий для Telegram и WhatsApp.
// Чистая FSM: advance(state, input, ctx) -> { reply, options?, state, completed? }.
// Канальный слой рендерит options (TG inline-кнопки / WA нумерованный список)
// и сопоставляет ответ пользователя обратно в option.value.

export type BotLocale = "ru" | "kk";

export type BotStep =
  | "lang"
  | "hall"
  | "date"
  | "time"
  | "guests"
  | "etype"
  | "name"
  | "phone"
  | "email"
  | "confirm"
  | "done";

export interface BotDraft {
  hall_id?: string;
  hall_name?: string;
  event_date?: string; // YYYY-MM-DD
  time_from?: string; // HH:MM
  time_to?: string; // HH:MM
  guests?: number;
  event_type?: "concert" | "conference" | "corporate" | "school" | "other";
  name?: string;
  phone?: string;
  email?: string;
}

export interface BotState {
  step: BotStep;
  data: BotDraft;
  locale: BotLocale;
}

export interface BotOption {
  label: string;
  value: string;
}

export interface HallLite {
  id: string;
  name_ru: string;
  name_kk: string;
}

export interface EngineCtx {
  halls: HallLite[];
}

export interface CompletedBooking {
  hall_id: string;
  hall_name: string;
  event_date: string;
  time_from: string;
  time_to: string;
  guests: number;
  event_type: NonNullable<BotDraft["event_type"]>;
  name: string;
  phone: string;
  email: string;
}

export interface EngineResult {
  reply: string;
  options?: BotOption[];
  state: BotState;
  /** Заполняется на финальном подтверждении — канал создаёт заявку. */
  completed?: CompletedBooking;
}

const T = (locale: BotLocale, ru: string, kk: string) => (locale === "kk" ? kk : ru);

const ETYPE_OPTS = (l: BotLocale): BotOption[] => [
  { value: "concert", label: T(l, "Концерт", "Концерт") },
  { value: "conference", label: T(l, "Конференция", "Конференция") },
  { value: "corporate", label: T(l, "Корпоратив", "Корпоратив") },
  { value: "school", label: T(l, "Школьное мероприятие", "Мектеп іс-шарасы") },
  { value: "other", label: T(l, "Другое", "Басқа") },
];

const hallOpts = (ctx: EngineCtx, l: BotLocale): BotOption[] =>
  ctx.halls.map((h) => ({ value: h.id, label: l === "kk" ? h.name_kk : h.name_ru }));

const yesNo = (l: BotLocale): BotOption[] => [
  { value: "yes", label: T(l, "✅ Подтвердить", "✅ Растау") },
  { value: "no", label: T(l, "✖️ Отменить", "✖️ Бас тарту") },
];

/** Сопоставляет произвольный ввод с option.value: по value, по 1-индексу, по тексту. */
export function resolveOption(input: string, options: BotOption[]): string | null {
  const raw = input.trim();
  const byValue = options.find((o) => o.value === raw);
  if (byValue) return byValue.value;
  const idx = parseInt(raw, 10);
  if (!Number.isNaN(idx) && idx >= 1 && idx <= options.length) return options[idx - 1].value;
  const lower = raw.toLowerCase();
  const byLabel = options.find((o) => o.label.toLowerCase().includes(lower) && lower.length >= 2);
  return byLabel ? byLabel.value : null;
}

function parseDate(input: string): string | null {
  const s = input.trim();
  let y: number, m: number, d: number;
  let mm = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (mm) {
    y = +mm[1]; m = +mm[2]; d = +mm[3];
  } else {
    mm = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
    if (!mm) return null;
    d = +mm[1]; m = +mm[2]; y = +mm[3];
  }
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (dt < today) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseTimeRange(input: string): { from: string; to: string } | null {
  const times = input.match(/(\d{1,2}):(\d{2})/g);
  if (!times || times.length < 2) return null;
  const norm = (t: string) => {
    const [h, mn] = t.split(":");
    const hh = +h, mm = +mn;
    if (hh > 23 || mm > 59) return null;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };
  const from = norm(times[0]);
  const to = norm(times[1]);
  if (!from || !to || to <= from) return null;
  return { from, to };
}

const PHONE_RE = /^\+?[0-9\s\-()]{10,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function etypeLabel(l: BotLocale, v: string): string {
  return ETYPE_OPTS(l).find((o) => o.value === v)?.label ?? v;
}

export function initialState(): BotState {
  return { step: "lang", data: {}, locale: "kk" };
}

/** Стартовое сообщение (после /start). presetHall — если пришёл диплинк rent_<slug>. */
export function greeting(locale: BotLocale): EngineResult {
  return {
    reply:
      "🏛 Дворец горняков · Бронирование зала\n— — —\nТіл / Язык:",
    options: [
      { value: "ru", label: "Русский" },
      { value: "kk", label: "Қазақша" },
    ],
    state: { step: "lang", data: {}, locale },
  };
}

const ask = {
  hall: (l: BotLocale, ctx: EngineCtx): EngineResult => ({
    reply: T(l, "Выберите зал:", "Залды таңдаңыз:"),
    options: hallOpts(ctx, l),
    state: { step: "hall", data: {}, locale: l },
  }),
};

/**
 * Главный шаг FSM. Возвращает следующий вопрос и новое состояние.
 * Для шагов с options input уже должен быть сопоставлен каналом ИЛИ
 * передаётся сырой текст (resolveOption применяется внутри).
 */
export function advance(state: BotState, input: string, ctx: EngineCtx): EngineResult {
  const l = state.locale;
  const data = { ...state.data };
  const raw = input.trim();

  switch (state.step) {
    case "lang": {
      const v = resolveOption(raw, [
        { value: "ru", label: "Русский" },
        { value: "kk", label: "Қазақша" },
      ]);
      const locale: BotLocale = v === "ru" ? "ru" : "kk";
      // Зал мог быть предустановлен диплинком
      if (data.hall_id) {
        return {
          reply: T(locale, `Зал: ${data.hall_name}\nУкажите дату (например 25.12.2026):`, `Зал: ${data.hall_name}\nКүнді жазыңыз (мысалы 25.12.2026):`),
          state: { step: "date", data, locale },
        };
      }
      return { ...ask.hall(locale, ctx), state: { step: "hall", data, locale } };
    }

    case "hall": {
      const v = resolveOption(raw, hallOpts(ctx, l));
      const hall = ctx.halls.find((h) => h.id === v);
      if (!hall) {
        return { reply: T(l, "Не понял. Выберите зал из списка:", "Түсінбедім. Тізімнен залды таңдаңыз:"), options: hallOpts(ctx, l), state };
      }
      data.hall_id = hall.id;
      data.hall_name = l === "kk" ? hall.name_kk : hall.name_ru;
      return {
        reply: T(l, "Укажите дату мероприятия (например 25.12.2026):", "Іс-шара күнін жазыңыз (мысалы 25.12.2026):"),
        state: { step: "date", data, locale: l },
      };
    }

    case "date": {
      const date = parseDate(raw);
      if (!date) {
        return { reply: T(l, "Неверная дата. Формат ДД.ММ.ГГГГ, не раньше сегодня:", "Қате күн. Формат КК.АА.ЖЖЖЖ, бүгіннен ерте емес:"), state };
      }
      data.event_date = date;
      return { reply: T(l, "Время? Например 14:00-18:00:", "Уақыты? Мысалы 14:00-18:00:"), state: { step: "time", data, locale: l } };
    }

    case "time": {
      const tr = parseTimeRange(raw);
      if (!tr) {
        return { reply: T(l, "Неверное время. Укажите диапазон, например 14:00-18:00:", "Қате уақыт. Аралықты жазыңыз, мысалы 14:00-18:00:"), state };
      }
      data.time_from = tr.from;
      data.time_to = tr.to;
      return { reply: T(l, "Сколько гостей ожидается?", "Қанша қонақ күтілуде?"), state: { step: "guests", data, locale: l } };
    }

    case "guests": {
      const n = parseInt(raw.replace(/\D/g, ""), 10);
      if (Number.isNaN(n) || n < 1 || n > 2000) {
        return { reply: T(l, "Введите число гостей (1–2000):", "Қонақ санын енгізіңіз (1–2000):"), state };
      }
      data.guests = n;
      return { reply: T(l, "Формат мероприятия:", "Іс-шара форматы:"), options: ETYPE_OPTS(l), state: { step: "etype", data, locale: l } };
    }

    case "etype": {
      const v = resolveOption(raw, ETYPE_OPTS(l));
      if (!v) {
        return { reply: T(l, "Выберите формат из списка:", "Тізімнен форматты таңдаңыз:"), options: ETYPE_OPTS(l), state };
      }
      data.event_type = v as BotDraft["event_type"];
      return { reply: T(l, "Ваше имя:", "Атыңыз:"), state: { step: "name", data, locale: l } };
    }

    case "name": {
      if (raw.length < 2) {
        return { reply: T(l, "Укажите имя (минимум 2 символа):", "Атыңызды жазыңыз (кемінде 2 таңба):"), state };
      }
      data.name = raw.slice(0, 255);
      return { reply: T(l, "Телефон для связи (например +7 701 123 45 67):", "Байланыс телефоны (мысалы +7 701 123 45 67):"), state: { step: "phone", data, locale: l } };
    }

    case "phone": {
      if (!PHONE_RE.test(raw)) {
        return { reply: T(l, "Неверный телефон. Пример: +7 701 123 45 67", "Қате телефон. Мысалы: +7 701 123 45 67"), state };
      }
      data.phone = raw;
      return { reply: T(l, "Email (или отправьте «-», чтобы пропустить):", "Email (немесе өткізу үшін «-» жіберіңіз):"), state: { step: "email", data, locale: l } };
    }

    case "email": {
      if (raw === "-" || raw === "" || /пропустить|өткізу|skip/i.test(raw)) {
        data.email = "";
      } else if (EMAIL_RE.test(raw)) {
        data.email = raw;
      } else {
        return { reply: T(l, "Неверный email. Введите корректный или «-»:", "Қате email. Дұрысын немесе «-» енгізіңіз:"), state };
      }
      const summary = T(
        l,
        `Проверьте заявку:\n\n🏛 Зал: ${data.hall_name}\n📅 ${data.event_date}, ${data.time_from}–${data.time_to}\n👥 Гостей: ${data.guests}\n🎭 ${etypeLabel(l, data.event_type!)}\n👤 ${data.name}\n📞 ${data.phone}\n✉️ ${data.email || "—"}\n\nВсё верно?`,
        `Өтінімді тексеріңіз:\n\n🏛 Зал: ${data.hall_name}\n📅 ${data.event_date}, ${data.time_from}–${data.time_to}\n👥 Қонақтар: ${data.guests}\n🎭 ${etypeLabel(l, data.event_type!)}\n👤 ${data.name}\n📞 ${data.phone}\n✉️ ${data.email || "—"}\n\nБәрі дұрыс па?`
      );
      return { reply: summary, options: yesNo(l), state: { step: "confirm", data, locale: l } };
    }

    case "confirm": {
      const v = resolveOption(raw, yesNo(l));
      if (v === "yes") {
        return {
          reply: T(l, "✅ Заявка отправлена! Администратор свяжется с вами для подтверждения.", "✅ Өтінім жіберілді! Растау үшін әкімші сізбен байланысады."),
          state: { step: "done", data, locale: l },
          completed: {
            hall_id: data.hall_id!,
            hall_name: data.hall_name!,
            event_date: data.event_date!,
            time_from: data.time_from!,
            time_to: data.time_to!,
            guests: data.guests!,
            event_type: data.event_type!,
            name: data.name!,
            phone: data.phone!,
            email: data.email ?? "",
          },
        };
      }
      if (v === "no") {
        return { reply: T(l, "Заявка отменена. Чтобы начать заново — отправьте /start.", "Өтінім тоқтатылды. Қайта бастау үшін /start жіберіңіз."), state: { step: "done", data: {}, locale: l } };
      }
      return { reply: T(l, "Подтвердить заявку?", "Өтінімді растайсыз ба?"), options: yesNo(l), state };
    }

    case "done":
    default:
      return { reply: T(l, "Чтобы оформить бронь — отправьте /start.", "Брондау үшін /start жіберіңіз."), state: { step: "done", data: {}, locale: l } };
  }
}
