"use client";

import { useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

const COPY = {
  ru: {
    headerTitle: "Бронирование зала",
    headerSub: "Опишите пожелания — AI-помощник оформит заявку",
    greet:
      "Здравствуйте! Помогу забронировать зал Дворца горняков. Какой зал нужен (Большой 650 / Камерный 120 / Репетиционный 40), на какую дату и время?",
    placeholder: "Опишите, что нужно…",
    placeholderDone: "Заявка оформлена",
    error: "Произошла ошибка. Попробуйте позже или позвоните: +7 (71063) 6-23-30.",
    created: "Заявка принята!",
    refLabel: "Номер заявки",
  },
  kk: {
    headerTitle: "Зал брондау",
    headerSub: "Тілегіңізді жазыңыз — AI-көмекші өтінімді ресімдейді",
    greet:
      "Сәлеметсіз бе! Тау-кеншілер сарайының залын брондауға көмектесем. Қандай зал керек (Үлкен 650 / Камералық 120 / Жаттығу 40), қай күн мен уақытқа?",
    placeholder: "Не керек екенін жазыңыз…",
    placeholderDone: "Өтінім ресімделді",
    error: "Қате орын алды. Кейінірек көріңіз немесе қоңырау шалыңыз: +7 (71063) 6-23-30.",
    created: "Өтінім қабылданды!",
    refLabel: "Өтінім нөмірі",
  },
};

export default function RentBookingChat({
  locale,
  hall,
}: {
  locale: "kk" | "ru";
  hall?: { id: "big" | "chamber" | "rehearsal"; name: string };
}) {
  const t = COPY[locale];
  // Если зал предвыбран (страница зала) — приветствие пропускает вопрос «какой зал».
  const greet = hall
    ? locale === "kk"
      ? `Сәлеметсіз бе! «${hall.name}» залын (${hall.id}) брондаймыз. Қай күн мен уақытқа?`
      : `Здравствуйте! Бронируем зал «${hall.name}» (${hall.id}). На какую дату и время?`
    : t.greet;
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: greet }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const send = async () => {
    if (!input.trim() || isLoading || ref) return;
    const text = input.trim();
    const next = [...messages, { role: "user" as const, text }];
    setMessages(next);
    setInput("");
    setIsLoading(true);
    try {
      const r = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          locale,
          history: next.slice(-10).map((m) => ({ role: m.role === "assistant" ? "model" : "user", text: m.text })),
        }),
      });
      const data = await r.json();
      const reply: string = data.data?.reply || t.error;
      setMessages((p) => [...p, { role: "assistant", text: reply }]);
      const bref: string | undefined = data.data?.booking?.ref;
      if (bref) setRef(bref);
    } catch {
      setMessages((p) => [...p, { role: "assistant", text: t.error }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dg-bchat">
      <div className="dg-bchat-head">
        <h3>{t.headerTitle}</h3>
        <p>{t.headerSub}</p>
      </div>

      <div className="dg-bchat-body">
        {messages.map((m, i) => (
          <div key={i} className={"dg-bchat-row " + m.role}>
            {m.role === "assistant" && <span className="dg-bchat-ava bot" aria-hidden="true">AI</span>}
            <div className={"dg-bchat-bubble " + m.role}>{m.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="dg-bchat-row assistant">
            <span className="dg-bchat-ava bot" aria-hidden="true">AI</span>
            <div className="dg-bchat-bubble assistant dg-bchat-typing"><span /><span /><span /></div>
          </div>
        )}
        {ref && (
          <div className="dg-bchat-ok">
            <strong>{t.created}</strong>
            <span>{t.refLabel}: №{ref}</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="dg-bchat-foot">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={ref ? t.placeholderDone : t.placeholder}
          disabled={!!ref || isLoading}
          aria-label={t.placeholder}
        />
        <button onClick={send} disabled={!input.trim() || isLoading || !!ref} aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
