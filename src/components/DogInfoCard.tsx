import { dogData } from "@/data/dogData";

interface Props {
  t: Record<string, string>;
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2 border-b border-border last:border-0">
    <span className="text-muted-foreground font-medium">{label}</span>
    <span className="text-foreground font-semibold text-right max-w-[55%]">{value}</span>
  </div>
);

const DogInfoCard = ({ t }: Props) => {
  const genderText = dogData.gender === "male" ? t.male : t.female;
  const { friendlyWith } = dogData;
  const colorText = t[dogData.color] ?? dogData.color;
  const traitsText = t[dogData.traits] ?? dogData.traits;
  const notesText = t[dogData.notes] ?? dogData.notes;

  return (
    <section className="mx-4 mb-4">
      <div className="bg-card rounded-2xl shadow-md p-5">
        <h2 className="text-xl font-bold text-foreground mb-3">🐕 {t.dogInfo}</h2>
        <InfoRow label={t.name} value={dogData.name} />
        <InfoRow label={t.breed} value={dogData.breed} />
        <InfoRow label={t.gender} value={genderText} />
        <InfoRow label={t.dob} value={dogData.dob} />
        <InfoRow label={t.color} value={colorText} />
        <InfoRow label={t.microchip} value={dogData.microchip} />
        <InfoRow label={t.traits} value={traitsText} />
        <InfoRow label={t.medicalNotes} value={notesText} />
        <div className="pt-3">
          <p className="text-muted-foreground font-medium mb-1">{t.friendly}</p>
          <div className="flex gap-3 flex-wrap">
            {friendlyWith.people && <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">✅ {t.people}</span>}
            {friendlyWith.children && <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">✅ {t.children}</span>}
            {friendlyWith.dogs && <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">✅ {t.dogs}</span>}
            {friendlyWith.cats && <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">✅ {t.cats}</span>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DogInfoCard;
