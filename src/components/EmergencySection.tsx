interface Props {
  t: Record<string, string>;
}

const EmergencySection = ({ t }: Props) => (
  <section className="mx-4 mb-4">
    <div className="bg-card rounded-2xl shadow-md p-5 border-2 border-primary/30">
      <h2 className="text-xl font-bold text-foreground mb-3">{t.emergencyTitle}</h2>
      <ul className="space-y-2 text-foreground">
        <li className="flex gap-2"><span>1.</span> {t.emergencyText1}</li>
        <li className="flex gap-2"><span>2.</span> {t.emergencyText2}</li>
        <li className="flex gap-2"><span>3.</span> {t.emergencyText3}</li>
        <li className="flex gap-2"><span>4.</span> {t.emergencyText4}</li>
      </ul>
    </div>
  </section>
);

export default EmergencySection;
