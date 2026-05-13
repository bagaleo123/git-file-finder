// Lightweight i18n for UI strings + AI language preference.
// Persists choice in localStorage. No external libs.
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "th" | "ru";

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  th: "ภาษาไทย",
  ru: "Русский",
};

type Dict = Record<string, string>;
const STRINGS: Record<Lang, Dict> = {
  en: {
    "nav.calculator": "Calculator",
    "nav.scan": "Contract Scan",
    "nav.ottax": "OT & Tax",
    "nav.fight": "Fight Back",
    "nav.docs": "Documents",
    "nav.map": "Justice Map",
    "nav.chat": "AI Chat",
    "nav.cases": "My Cases",
    "nav.signin": "Sign In",
    "chat.placeholder": "Ask about your case…",
    "chat.empty": "Start by uploading your contract or any letter from your employer. Then ask anything.",
    "upload.title": "Upload contract / CV",
    "upload.hint": "Drag & drop, or click to browse — .txt, .md, .pdf, .doc",
    "upload.dropping": "Drop the file to upload",
    "scan.button": "Scan Contract",
    "scan.analyzing": "Analyzing…",
    "scan.paste": "Paste contract text here…",
    "lang.label": "Language",
  },
  th: {
    "nav.calculator": "เครื่องคำนวณ",
    "nav.scan": "ตรวจสัญญา",
    "nav.ottax": "OT และภาษี",
    "nav.fight": "สู้กลับ",
    "nav.docs": "เอกสาร",
    "nav.map": "แผนที่ความยุติธรรม",
    "nav.chat": "AI แชท",
    "nav.cases": "คดีของฉัน",
    "nav.signin": "เข้าสู่ระบบ",
    "chat.placeholder": "ถามเกี่ยวกับคดีของคุณ…",
    "chat.empty": "เริ่มต้นด้วยการอัปโหลดสัญญาหรือจดหมายจากนายจ้าง แล้วถามได้เลย",
    "upload.title": "อัปโหลดสัญญา / CV",
    "upload.hint": "ลากวาง หรือคลิกเพื่อเลือก — .txt, .md, .pdf, .doc",
    "upload.dropping": "ปล่อยไฟล์เพื่ออัปโหลด",
    "scan.button": "สแกนสัญญา",
    "scan.analyzing": "กำลังวิเคราะห์…",
    "scan.paste": "วางข้อความสัญญาที่นี่…",
    "lang.label": "ภาษา",
  },
  ru: {
    "nav.calculator": "Калькулятор",
    "nav.scan": "Анализ договора",
    "nav.ottax": "Сверхурочные и налог",
    "nav.fight": "Защити права",
    "nav.docs": "Документы",
    "nav.map": "Карта правосудия",
    "nav.chat": "AI Чат",
    "nav.cases": "Мои дела",
    "nav.signin": "Войти",
    "chat.placeholder": "Спросите о вашем деле…",
    "chat.empty": "Начните с загрузки контракта или письма от работодателя. Потом спросите что угодно.",
    "upload.title": "Загрузить контракт / CV",
    "upload.hint": "Перетащите или нажмите — .txt, .md, .pdf, .doc",
    "upload.dropping": "Отпустите файл для загрузки",
    "scan.button": "Анализировать",
    "scan.analyzing": "Анализирую…",
    "scan.paste": "Вставьте текст контракта здесь…",
    "lang.label": "Язык",
  },
};

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = (localStorage.getItem("lang") as Lang | null);
    if (saved && saved in STRINGS) setLangState(saved);
    else {
      const nav = navigator.language.toLowerCase();
      if (nav.startsWith("th")) setLangState("th");
      else if (nav.startsWith("ru")) setLangState("ru");
    }
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };
  const t = (k: string) => STRINGS[lang][k] ?? STRINGS.en[k] ?? k;
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
