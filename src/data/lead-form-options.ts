/** Опции полей формы заявки — для клиента и квалификации в CRM */

export const leadMessengerOptions = [
  { value: "call", label: "Звонок" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
] as const;

export const leadBudgetOptions = [
  { value: "", label: "Пока не определился" },
  { value: "до 5 млн", label: "До 5 млн ₽" },
  { value: "5–8 млн", label: "5–8 млн ₽" },
  { value: "8–12 млн", label: "8–12 млн ₽" },
  { value: "12–18 млн", label: "12–18 млн ₽" },
  { value: "от 18 млн", label: "От 18 млн ₽" },
] as const;

export const leadLandOptions = [
  { value: "yes", label: "Есть участок" },
  { value: "no", label: "Ещё нет" },
  { value: "searching", label: "В поиске" },
] as const;

export function messengerLabel(value: string): string {
  return leadMessengerOptions.find((o) => o.value === value)?.label ?? value;
}
