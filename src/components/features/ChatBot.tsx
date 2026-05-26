"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import Button from "@/components/ui/Button";

interface Message {
  role: "user" | "model";
  text: string;
}

interface ChatBotProps {
  locale: Locale;
  messages: Record<string, string>;
}

export default function ChatBot({ locale, messages: t }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: "model", text: t.greeting },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: text.trim() };
    setChatMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          locale,
          history: chatMessages.slice(-10).map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      const botMessage: Message = {
        role: "model",
        text: data.data?.reply || data.error || "Error",
      };
      setChatMessages((prev) => [...prev, botMessage]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "model", text: locale === "kk" ? "Қате орын алды" : "Произошла ошибка" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Внешнее открытие чата (CTA «Спросить помощника») с автоотправкой реплики.
  const sendRef = useRef(sendMessage);
  sendRef.current = sendMessage;
  useEffect(() => {
    const onOpen = (e: Event) => {
      setIsOpen(true);
      const msg = (e as CustomEvent).detail?.message as string | undefined;
      if (msg) setTimeout(() => sendRef.current(msg), 120);
    };
    window.addEventListener("dg:open-chat", onOpen);
    return () => window.removeEventListener("dg:open-chat", onOpen);
  }, []);

  // Подсказки при открытии (отправляются как реплики).
  const suggestions: { icon: string; text: string }[] = [
    { icon: "🏛", text: locale === "kk" ? "Зал жалдағым келеді" : "Хочу арендовать зал" },
    { icon: "🎤", text: locale === "kk" ? "Үйірмеге жазылғым келеді" : "Хочу записаться в кружок" },
    { icon: "📅", text: locale === "kk" ? "Осы аптада не бар?" : "Что на этой неделе?" },
  ];

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = locale === "kk" ? "kk-KZ" : "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 right-4 w-12 h-12 sm:bottom-6 sm:right-6 sm:w-14 sm:h-14 z-50 rounded-full shadow-lg flex items-center justify-center transition-all",
          isOpen ? "bg-gray-600 rotate-90" : "bg-[#E07A4A] hover:bg-[#ec8a5a] chatbot-bubble"
        )}
        aria-label={locale === "kk" ? "Чат-көмекші" : "Чат-помощник"}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col chatbot-bubble">
          {/* Header */}
          <div className="bg-[#E07A4A] text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="font-semibold">{t.title}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80 min-h-[200px]">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "chat-message flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-3 py-2 rounded-xl text-sm",
                    msg.role === "user"
                      ? "bg-[#E07A4A] text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm text-gray-500">
                  {t.thinking}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions (показываем в начале диалога) */}
          {chatMessages.length <= 1 && !isLoading && (
            <div className="px-3 pb-1 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.text}
                  type="button"
                  onClick={() => sendMessage(s.text)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#E07A4A]/40 text-[#7A3D18] hover:bg-[#E07A4A]/10 transition-colors"
                >
                  {s.icon} {s.text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleVoice}
                className={cn(
                  "p-2 rounded-lg transition-colors shrink-0",
                  isListening
                    ? "bg-red-100 text-red-600"
                    : "hover:bg-gray-100 text-gray-400"
                )}
                title={isListening ? t.voiceStop : t.voiceStart}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#E07A4A]"
                disabled={isLoading}
              />
              <Button type="submit" size="sm" disabled={!input.trim() || isLoading} className="!bg-[#E07A4A] hover:!bg-[#ec8a5a] focus:!ring-[#E07A4A]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
