import { toast } from "sonner";

// Единые success-тосты для админских мутаций (3с, нейтрально — не SaaS-зелёнка).
// «Сохранено» одинаково для create/update — оператор не различает их в момент клика.
export const toastSaved = (locale: "kk" | "ru") =>
  toast.success(locale === "kk" ? "Сақталды" : "Сохранено");

export const toastDeleted = (locale: "kk" | "ru") =>
  toast.success(locale === "kk" ? "Жойылды" : "Удалено");
