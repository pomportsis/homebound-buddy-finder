import { Lang } from "@/data/translations";

const flags: Record<Lang, string> = {
  en: "🇬🇧",
  el: "🇬🇷",
  ru: "🇷🇺",
};

interface Props {
  current: Lang;
  onChange: (lang: Lang) => void;
}

const LanguageSwitcher = ({ current, onChange }: Props) => {
  const langs: Lang[] = ["en", "el", "ru"];

  return (
    <div className="flex justify-center gap-2 py-3">
      {langs.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          className={`px-4 py-2 rounded-lg text-lg font-medium transition-all ${
            current === lang
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
          aria-label={`Switch to ${lang}`}
        >
          {flags[lang]} {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
