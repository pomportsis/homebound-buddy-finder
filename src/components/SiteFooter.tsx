type SiteFooterProps = {
  t?: Record<string, string>;
};

const SiteFooter = ({ t }: SiteFooterProps) => {
  const links = [
    { href: "#", label: t?.footerTerms ?? "Terms & Conditions" },
    { href: "#", label: t?.footerPrivacy ?? "Privacy Policy" },
    { href: "/pricing", label: t?.footerPricing ?? "Pricing" },
    { href: "#", label: t?.footerAbout ?? "About Us" },
  ];

  return (
    <footer className="border-t mt-8 py-6 px-4">
      <div className="mx-auto max-w-5xl">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline">
              {link.label}
            </a>
          ))}
        </nav>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          ©{" "}
          <a
            href="https://pomwareltd.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Pomware
          </a>{" "}
          2026. {t?.footerCopyright ?? "All rights reserved."}
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;