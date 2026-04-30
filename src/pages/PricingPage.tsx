import { useState } from "react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SiteFooter from "@/components/SiteFooter";
import { Lang, translations } from "@/data/translations";

const PricingPage = () => {
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex justify-between items-center gap-3 mb-2">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
            ← Home
          </Link>
          <LanguageSwitcher current={lang} onChange={setLang} />
        </div>

        <section aria-labelledby="pricing-title" className="mt-4">
          <div className="text-center mb-8">
            <h1 id="pricing-title" className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t.footerPricingTitle}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
              {t.footerPricingNoFees}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <article className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{t.footerPlanStarterTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.footerPlanStarterPrice}</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>• {t.footerPlanStarterFeature1}</li>
                <li>• {t.footerPlanStarterFeature2}</li>
                <li>• {t.footerPlanStarterFeature3}</li>
              </ul>
            </article>

            <article className="rounded-xl border-2 border-primary/40 bg-card p-5 shadow-md relative overflow-hidden">
              <span className="absolute right-3 top-3 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {t.footerPlanPopular}
              </span>
              <h2 className="text-lg font-semibold">{t.footerPlanGrowthTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.footerPlanGrowthPrice}</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>• {t.footerPlanGrowthFeature1}</li>
                <li>• {t.footerPlanGrowthFeature2}</li>
                <li>• {t.footerPlanGrowthFeature3}</li>
                <li>• {t.footerPlanGrowthFeature4}</li>
              </ul>
            </article>

            <article className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{t.footerPlanEnterpriseTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.footerPlanEnterprisePrice}</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>• {t.footerPlanEnterpriseFeature1}</li>
                <li>• {t.footerPlanEnterpriseFeature2}</li>
                <li>• {t.footerPlanEnterpriseFeature3}</li>
              </ul>
            </article>
          </div>

          <article className="mt-5 rounded-xl border border-dashed p-5 bg-muted/30">
            <p className="text-sm font-medium">{t.footerComingSoonBadge}</p>
            <h2 className="mt-1 text-lg font-semibold">{t.footerComingSoonTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.footerComingSoonDescription}</p>
          </article>
        </section>
      </div>

      <SiteFooter t={t} />
    </div>
  );
};

export default PricingPage;
