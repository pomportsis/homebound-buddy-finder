import { ownerData } from "@/data/dogData";

interface Props {
  t: Record<string, string>;
}

const ContactSection = ({ t }: Props) => {
  const phone1Clean = ownerData.phone1.replace(/\s/g, "");
  const phone2Clean = ownerData.phone2.replace(/\s/g, "");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ownerData.mapsQuery)}`;
  const waUrl = `https://wa.me/${phone1Clean.replace("+", "")}`;

  return (
    <section className="mx-4 mb-4">
      <div className="bg-card rounded-2xl shadow-md p-5">
        <h2 className="text-xl font-bold text-foreground mb-3">📋 {t.contactOwner}</h2>
        <div className="space-y-2 mb-5">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground font-medium">{t.owner}</span>
            <span className="text-foreground font-semibold">{ownerData.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground font-medium">{t.phone}</span>
            <a href={`tel:${phone1Clean}`} className="text-primary font-semibold underline">{ownerData.phone1}</a>
          </div>
          {ownerData.phone2 && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground font-medium">{t.phone} 2</span>
              <a href={`tel:${phone2Clean}`} className="text-primary font-semibold underline">{ownerData.phone2}</a>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground font-medium">{t.email}</span>
            <a href={`mailto:${ownerData.email}`} className="text-primary font-semibold underline text-sm">{ownerData.email}</a>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground font-medium">{t.location}</span>
            <span className="text-foreground font-semibold text-right max-w-[55%]">{ownerData.location}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <a
            href={`tel:${phone1Clean}`}
            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-call text-call-foreground font-bold text-lg shadow-md active:scale-95 transition-transform"
          >
            {t.callNow}
          </a>
          {ownerData.phone2 && (
            <a
              href={`tel:${phone2Clean}`}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-base shadow active:scale-95 transition-transform"
            >
              {t.callSecondary}
            </a>
          )}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-whatsapp text-whatsapp-foreground font-bold text-lg shadow-md active:scale-95 transition-transform"
          >
            {t.sendWhatsApp}
          </a>
          <a
            href={`mailto:${ownerData.email}`}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-base shadow active:scale-95 transition-transform"
          >
            {t.sendEmail}
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-maps text-maps-foreground font-bold text-lg shadow-md active:scale-95 transition-transform"
          >
            {t.openMaps}
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
