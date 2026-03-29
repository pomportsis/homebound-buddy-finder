import { dogData } from "@/data/dogData";

interface Props {
  t: Record<string, string>;
}

const HeroSection = ({ t }: Props) => (
  <section className="flex flex-col items-center text-center px-4 pt-6 pb-4">
    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary shadow-lg mb-4">
      <img
        src={dogData.imageUrl}
        alt={dogData.name}
        width={160}
        height={160}
        className="w-full h-full object-cover"
      />
    </div>
    <h1 className="text-3xl font-bold text-foreground mb-2">{dogData.name}</h1>
    <p className="text-lg text-muted-foreground max-w-xs leading-relaxed">
      {t.heroMessage}
    </p>
  </section>
);

export default HeroSection;
