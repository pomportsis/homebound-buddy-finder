import { DogProfile } from "@/types/dog";

interface Props {
  t: Record<string, string>;
  profile: DogProfile;
}

const ContactSection = ({ t, profile }: Props) => {
  const { owner } = profile;
  const { vet } = profile;
  const hasOwnerName = Boolean(owner.name?.trim());
  const hasOwnerPhone1 = Boolean(owner.phone1?.trim());
  const hasOwnerPhone2 = Boolean(owner.phone2?.trim());
  const hasOwnerEmail = Boolean(owner.email?.trim());
  const hasOwnerLocation = Boolean(owner.location?.trim());
  const hasOwnerMapsQuery = Boolean(owner.mapsQuery?.trim());

  const hasVetName = Boolean(vet.name?.trim());
  const hasVetPhone1 = Boolean(vet.phone1?.trim());
  const hasVetPhone2 = Boolean(vet.phone2?.trim());
  const hasVetEmail = Boolean(vet.email?.trim());
  const hasVetLocation = Boolean(vet.location?.trim());
  const hasVetMapsQuery = Boolean(vet.mapsQuery?.trim());

  const phone1Clean = owner.phone1.replace(/\s/g, "");
  const phone2Clean = (owner.phone2 ?? "").replace(/\s/g, "");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(owner.mapsQuery)}`;
  const waUrl = `https://wa.me/${phone1Clean.replace("+", "")}`;
  const vetPhone1Clean = vet.phone1.replace(/\s/g, "");
  const vetPhone2Clean = (vet.phone2 ?? "").replace(/\s/g, "");
  const vetMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vet.mapsQuery)}`;

  return (
    <section className="mx-4 mb-4">
      <div className="bg-card rounded-2xl shadow-md p-5">
        <h2 className="text-xl font-bold text-foreground mb-3">📋 {t.contactOwner}</h2>
        <div className="space-y-2 mb-5">
          {hasOwnerName && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground font-medium">{t.owner}</span>
              <span className="text-foreground font-semibold">{owner.name}</span>
            </div>
          )}
          {hasOwnerPhone1 && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground font-medium">{t.phone}</span>
              <a href={`tel:${phone1Clean}`} className="text-primary font-semibold underline">{owner.phone1}</a>
            </div>
          )}
          {hasOwnerPhone2 && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground font-medium">{t.phone} 2</span>
              <a href={`tel:${phone2Clean}`} className="text-primary font-semibold underline">{owner.phone2}</a>
            </div>
          )}
          {hasOwnerEmail && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground font-medium">{t.email}</span>
              <a href={`mailto:${owner.email}`} className="text-primary font-semibold underline text-sm">{owner.email}</a>
            </div>
          )}
          {hasOwnerLocation && (
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground font-medium">{t.location}</span>
              <span className="text-foreground font-semibold text-right max-w-[55%]">{owner.location}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {hasOwnerPhone1 && (
            <a
              href={`tel:${phone1Clean}`}
              className="flex items-center justify-center gap-2 py-4 rounded-xl bg-call text-call-foreground font-bold text-lg shadow-md active:scale-95 transition-transform"
            >
              {t.callNow}
            </a>
          )}
          {hasOwnerPhone2 && (
            <a
              href={`tel:${phone2Clean}`}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-base shadow active:scale-95 transition-transform"
            >
              {t.callSecondary}
            </a>
          )}
          {hasOwnerPhone1 && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-4 rounded-xl bg-whatsapp text-whatsapp-foreground font-bold text-lg shadow-md active:scale-95 transition-transform"
            >
              {t.sendWhatsApp}
            </a>
          )}
          {hasOwnerEmail && (
            <a
              href={`mailto:${owner.email}`}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-base shadow active:scale-95 transition-transform"
            >
              {t.sendEmail}
            </a>
          )}
          {hasOwnerMapsQuery && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-4 rounded-xl bg-maps text-maps-foreground font-bold text-lg shadow-md active:scale-95 transition-transform"
            >
              {t.openMaps}
            </a>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-md p-5 mt-4">
        <h2 className="text-xl font-bold text-foreground mb-3">🏥 {t.contactVet}</h2>
        <div className="space-y-2 mb-5">
          {hasVetName && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground font-medium">{t.vet}</span>
              <span className="text-foreground font-semibold">{vet.name}</span>
            </div>
          )}
          {hasVetPhone1 && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground font-medium">{t.phone}</span>
              <a href={`tel:${vetPhone1Clean}`} className="text-primary font-semibold underline">{vet.phone1}</a>
            </div>
          )}
          {hasVetPhone2 && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground font-medium">{t.phone} 2</span>
              <a href={`tel:${vetPhone2Clean}`} className="text-primary font-semibold underline">{vet.phone2}</a>
            </div>
          )}
          {hasVetEmail && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground font-medium">{t.email}</span>
              <a href={`mailto:${vet.email}`} className="text-primary font-semibold underline text-sm">{vet.email}</a>
            </div>
          )}
          {hasVetLocation && (
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground font-medium">{t.location}</span>
              <span className="text-foreground font-semibold text-right max-w-[55%]">{vet.location}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {hasVetPhone1 && (
            <a
              href={`tel:${vetPhone1Clean}`}
              className="flex items-center justify-center gap-2 py-4 rounded-xl bg-call text-call-foreground font-bold text-lg shadow-md active:scale-95 transition-transform"
            >
              {t.callNow}
            </a>
          )}
          {hasVetPhone2 && (
            <a
              href={`tel:${vetPhone2Clean}`}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-base shadow active:scale-95 transition-transform"
            >
              {t.callSecondary}
            </a>
          )}
          {hasVetEmail && (
            <a
              href={`mailto:${vet.email}`}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-base shadow active:scale-95 transition-transform"
            >
              {t.sendEmail}
            </a>
          )}
          {hasVetMapsQuery && (
            <a
              href={vetMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-4 rounded-xl bg-maps text-maps-foreground font-bold text-lg shadow-md active:scale-95 transition-transform"
            >
              {t.openMaps}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
