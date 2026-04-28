import { DogProfile } from "@/types/dog";

interface Props {
  t: Record<string, string>;
  profile: DogProfile;
}

const HeroSection = ({ t, profile }: Props) => (
  <section className="flex flex-col items-center text-center px-4 pt-6 pb-4">
    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary shadow-lg mb-4">
      <img
        src={profile.imageUrl || "/images/dog-placeholder.jpg"}
        alt={profile.name}
        width={160}
        height={160}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "/images/dog-placeholder.jpg";
        }}
      />
    </div>
    <h1 className="text-3xl font-bold text-foreground mb-2">{profile.name}</h1>
    <p className="text-lg text-muted-foreground max-w-xs leading-relaxed">
      {t.heroMessage}
    </p>
  </section>
);

export default HeroSection;
