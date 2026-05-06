import { useState } from "react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SiteFooter from "@/components/SiteFooter";
import { Lang, translations } from "@/data/translations";

const demoImages = [
  "/images/dog-placeholder.jpg",
  "/images/dog-placeholder.jpg",
  "/images/dog-placeholder.jpg",
];

const AboutPage = () => {
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

        <section className="relative mt-4 overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/15 via-background to-purple-500/15 p-6 sm:p-10">
          <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-primary/15 blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-purple-400/15 blur-3xl animate-pulse" />

          <div className="relative z-10">
            <p className="inline-flex rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              Real-world pet recovery solution
            </p>
            <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-balance">
              Custom pet collars with name engraving + NFC/QR rescue profile
            </h1>
            <p className="mt-4 max-w-3xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              LostBuddy helps people return lost pets faster. Every collar is personalized with your pet&apos;s name and includes an NFC and/or QR profile link so anyone can scan and contact you instantly.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-background/75 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-2xl font-semibold">NFC + QR</p>
                <p className="text-sm text-muted-foreground mt-1">Tap or scan to open a live pet profile.</p>
              </div>
              <div className="rounded-2xl border bg-background/75 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-2xl font-semibold">IP67 Ready</p>
                <p className="text-sm text-muted-foreground mt-1">Water and dust resistant for everyday pet life.</p>
              </div>
              <div className="rounded-2xl border bg-background/75 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-2xl font-semibold">One-time Pay</p>
                <p className="text-sm text-muted-foreground mt-1">No subscriptions, no commissions, no hidden fees.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <h2 className="text-lg font-semibold">What is IP67?</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              IP67 means the tag/collar unit is protected against dust ingress and temporary water immersion (up to 1 meter for around 30 minutes). Perfect for walks, rain, and active pets.
            </p>
          </article>
          <article className="rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <h2 className="text-lg font-semibold">Built for vets & pet shops</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Includes an Admin Panel where veterinary clinics and pet shops can manage pets, profiles, and NFC requests in one place.
            </p>
          </article>
          <article className="rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <h2 className="text-lg font-semibold">Transparent pricing</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              One-time payment model. No monthly subscriptions. No platform commissions. No surprise costs.
            </p>
          </article>
        </section>

        <section className="mt-8 space-y-6">
          {demoImages.map((src, index) => {
            const isReversed = index % 2 !== 0;

            return (
              <article
                key={`${src}-${index}`}
                className={`group grid items-center gap-5 rounded-2xl border bg-card p-3 sm:p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 lg:grid-cols-2 ${
                  isReversed ? "" : ""
                }`}
              >
                <div className={`relative overflow-hidden rounded-xl border ${isReversed ? "lg:order-2" : "lg:order-1"}`}>
                  <img
                    src={src}
                    alt={t.aboutDemoImageAlt}
                    className="h-full w-full min-h-[240px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-3 bottom-3 rounded-lg border bg-background/80 px-3 py-2 text-xs text-muted-foreground backdrop-blur">
                    {t.aboutDemoImageCaption}
                  </div>
                </div>

                <div className={`px-1 sm:px-2 ${isReversed ? "lg:order-1" : "lg:order-2"}`}>
                  <p className="inline-flex rounded-full border px-3 py-1 text-xs text-muted-foreground">0{index + 1}</p>
                  <h2 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight">
                    {index === 0 && "Custom collar design with pet name + smart tag"}
                    {index === 1 && "Fast rescue flow: finder scans, owner gets contacted"}
                    {index === 2 && "Business dashboard for vets and pet shops"}
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {index === 0 && "Personalized collars designed for comfort, visibility, and instant identification."}
                    {index === 1 && "The profile opens in seconds with essential contact details and emergency notes."}
                    {index === 2 && "Manage profiles, requests, and customer pets through a clean and simple admin workflow."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">NFC</span>
                    <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-700">Dog Collar</span>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700">Scan Journey</span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-8 rounded-2xl border bg-card p-5 sm:p-7 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{t.aboutCompanyTitle}</h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">{t.aboutCompanyDescription}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">{t.aboutCompanyRefLabel}</p>
              <p className="mt-1 font-medium">{t.aboutCompanyRefValue}</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">{t.aboutContactLabel}</p>
              <p className="mt-1 font-medium">{t.aboutContactValue}</p>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter t={t} />
    </div>
  );
};

export default AboutPage;