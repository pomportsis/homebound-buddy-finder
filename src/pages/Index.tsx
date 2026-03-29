import { useState } from "react";
import { translations, Lang } from "@/data/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import HeroSection from "@/components/HeroSection";
import DogInfoCard from "@/components/DogInfoCard";
import ContactSection from "@/components/ContactSection";
import EmergencySection from "@/components/EmergencySection";

const Index = () => {
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto pb-8">
      <LanguageSwitcher current={lang} onChange={setLang} />
      <HeroSection t={t} />
      <DogInfoCard t={t} />
      <ContactSection t={t} />
      <EmergencySection t={t} />

      {/* NFC Note */}
      <p className="text-center text-xs text-muted-foreground px-6 mb-4">
        📡 {t.nfcNote}
      </p>

      {/* Footer */}
      <footer className="text-center py-6 px-4">
        <p className="text-muted-foreground font-medium">{t.footerThank}</p>
      </footer>
    </div>
  );
};

export default Index;
