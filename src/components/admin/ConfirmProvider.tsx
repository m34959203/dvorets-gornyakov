"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Опасное действие (удаление) — красная кнопка. По умолчанию true. */
  danger?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(() => Promise.resolve(false));

/** Замена нативного window.confirm: `const ok = await confirm({ message })`. */
export const useConfirm = (): ConfirmFn => useContext(ConfirmContext);

export function ConfirmProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: "kk" | "ru";
}) {
  const [state, setState] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const confirm = useCallback<ConfirmFn>(
    (opts) => new Promise<boolean>((resolve) => setState({ opts, resolve })),
    []
  );

  const close = useCallback(
    (value: boolean) => {
      setState((s) => {
        s?.resolve(value);
        return null;
      });
    },
    []
  );

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) close(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            {state.opts.title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{state.opts.title}</h3>
            )}
            <p className="text-sm text-gray-600 leading-relaxed">{state.opts.message}</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => close(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {state.opts.cancelLabel ?? T("Болдырмау", "Отмена")}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => close(true)}
                className={
                  "px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors " +
                  (state.opts.danger === false
                    ? "bg-[#E07A4A] hover:bg-[#c96a3f]"
                    : "bg-red-600 hover:bg-red-700")
                }
              >
                {state.opts.confirmLabel ?? T("Иә", "Подтвердить")}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
