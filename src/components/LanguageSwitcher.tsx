import { Lang } from "@/data/translations";

const flags: Record<Lang, string> = {
  en: "🇬🇧",
  el: "🇬🇷",
  ru: "🇷🇺",
};

const labels: Record<Lang, string> = {
  en: "EN",
  el: "EL",
  ru: "RU",
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
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-base font-semibold transition-all ${
            current === lang
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
          aria-label={`Switch to ${labels[lang]}`}
        >
          <span className="text-xl leading-none">{flags[lang]}</span>
          <span>{labels[lang]}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
