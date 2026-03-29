import { Lang } from "@/data/translations";

const labels: Record<Lang, string> = {
  en: "EN",
  el: "EL",
  ru: "RU",
};

const flagNames: Record<Lang, string> = {
  en: "United States",
  el: "Greece",
  ru: "Russia",
};

interface Props {
  current: Lang;
  onChange: (lang: Lang) => void;
}

const FlagIcon = ({ lang }: { lang: Lang }) => {
  if (lang === "en") {
    return (
      <svg viewBox="0 0 24 16" className="h-4 w-6 rounded-sm" aria-hidden="true">
        <rect width="24" height="16" fill="#fff" />
        <g fill="#B22234">
          <rect y="0" width="24" height="1.23" />
          <rect y="2.46" width="24" height="1.23" />
          <rect y="4.92" width="24" height="1.23" />
          <rect y="7.38" width="24" height="1.23" />
          <rect y="9.84" width="24" height="1.23" />
          <rect y="12.3" width="24" height="1.23" />
          <rect y="14.77" width="24" height="1.23" />
        </g>
        <rect width="10.4" height="8.6" fill="#3C3B6E" />
      </svg>
    );
  }

  if (lang === "el") {
    return (
      <svg viewBox="0 0 27 18" className="h-4 w-6 rounded-sm" aria-hidden="true">
        <rect width="27" height="18" fill="#0D5EAF" />
        <g fill="#fff">
          <rect y="2" width="27" height="2" />
          <rect y="6" width="27" height="2" />
          <rect y="10" width="27" height="2" />
          <rect y="14" width="27" height="2" />
          <rect width="10" height="10" fill="#0D5EAF" />
          <rect x="4" width="2" height="10" />
          <rect y="4" width="10" height="2" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 16" className="h-4 w-6 rounded-sm" aria-hidden="true">
      <rect width="24" height="16" fill="#fff" />
      <rect width="24" height="5.33" fill="#fff" />
      <rect y="5.33" width="24" height="5.34" fill="#22408C" />
      <rect y="10.67" width="24" height="5.33" fill="#D52B1E" />
    </svg>
  );
};

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
          <span className="inline-flex items-center" aria-label={`${flagNames[lang]} flag`}>
            <FlagIcon lang={lang} />
          </span>
          <span>{labels[lang]}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
