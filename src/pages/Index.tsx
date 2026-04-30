import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { translations, Lang } from "@/data/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import HeroSection from "@/components/HeroSection";
import DogInfoCard from "@/components/DogInfoCard";
import ContactSection from "@/components/ContactSection";
import EmergencySection from "@/components/EmergencySection";
import SiteFooter from "@/components/SiteFooter";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { firebaseEnvWarning } from "@/lib/firebase";
import { DogProfile, OwnerInfo, VetInfo } from "@/types/dog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const emptyOwner: OwnerInfo = {
  name: "",
  phone1: "",
  email: "",
  location: "",
  mapsQuery: "",
};

const emptyVet: VetInfo = {
  name: "",
  phone1: "",
  email: "",
  location: "",
  mapsQuery: "",
};

const Index = () => {
  const [lang, setLang] = useState<Lang>("en");
  const [profile, setProfile] = useState<DogProfile | null>(null);
  const [petId, setPetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const t = translations[lang];

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      setProfile(null);
      setLoading(false);
      setError(null);
      setErrorKey(null);
      return;
    }

    setPetId(id);

    const loadDog = async () => {
      try {
        setLoading(true);
        setError(null);
        setErrorKey(null);

        const dogRef = doc(db, "dogs", id);
        const dogSnap = await getDoc(dogRef);

        if (!dogSnap.exists()) {
          setError("Dog profile not found for this id.");
          setErrorKey(null);
          return;
        }

        const raw = dogSnap.data() as Partial<DogProfile> & {
          owner?: Partial<OwnerInfo>;
        };

        let owner: OwnerInfo = {
          ...emptyOwner,
          ...(raw.owner ?? {}),
        };

        // Optional fallback for structure where owner is in subcollection: dogs/{id}/owner/profile
        if (!owner.name && !owner.phone1) {
          const ownerRef = doc(db, "dogs", id, "owner", "profile");
          const ownerSnap = await getDoc(ownerRef);
          if (ownerSnap.exists()) {
            owner = {
              ...emptyOwner,
              ...(ownerSnap.data() as Partial<OwnerInfo>),
            };
          }
        }

        const normalized: DogProfile = {
          name: raw.name ?? "Unknown",
          breed: raw.breed ?? "",
          gender: raw.gender === "female" ? "female" : "male",
          dob: raw.dob ?? "",
          color: raw.color ?? "",
          microchip: raw.microchip ?? id,
          traits: raw.traits ?? "",
          notes: raw.notes ?? "",
          veterinarian: raw.veterinarian ?? "",
          friendlyWith: {
            people: raw.friendlyWith?.people ?? false,
            children: raw.friendlyWith?.children ?? false,
            dogs: raw.friendlyWith?.dogs ?? false,
            cats: raw.friendlyWith?.cats ?? false,
          },
          imageUrl: raw.imageUrl ?? "/images/dog-placeholder.jpg",
          owner,
          vet: {
            ...emptyVet,
            ...(raw.vet ?? {}),
          },
        };

        setProfile(normalized);
      } catch {
        setErrorKey("homeLoadProfileError");
      } finally {
        setLoading(false);
      }
    };

    loadDog();
  }, []);

  const stopScanner = () => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsScanning(false);
    setIsScannerOpen(false);
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const goToProfile = (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) {
      setError(t.homeEmptyIdError);
      setErrorKey(null);
      return;
    }

    const nextUrl = `${window.location.pathname}?id=${encodeURIComponent(trimmed)}`;
    window.location.href = nextUrl;
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    goToProfile(petId);
  };

  const handleOpenScanner = async () => {
    setScanError(null);

    if (!("BarcodeDetector" in window)) {
      setScanError(t.homeCameraUnsupported);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });

      streamRef.current = stream;
      setIsScannerOpen(true);
      setIsScanning(true);

      window.setTimeout(() => {
        if (!videoRef.current) {
          return;
        }

        videoRef.current.srcObject = stream;
        void videoRef.current.play();
      }, 0);

      const Detector = (window as Window & {
        BarcodeDetector: new (options?: { formats?: string[] }) => {
          detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
        };
      }).BarcodeDetector;

      const detector = new Detector({ formats: ["qr_code"] });

      scanIntervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          return;
        }

        try {
          const barcodes = await detector.detect(videoRef.current);
          const rawValue = barcodes?.[0]?.rawValue?.trim();

          if (rawValue) {
            setPetId(rawValue);
            stopScanner();
            goToProfile(rawValue);
          }
        } catch {
          // Continue scanning silently.
        }
      }, 500);
    } catch {
      setScanError(t.homeCameraDenied);
      stopScanner();
    }
  };

  if (loading && petId) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {firebaseEnvWarning && (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              Configuration error: {firebaseEnvWarning}
            </div>
          )}
          <div className="flex justify-end mb-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/vet-portal">Vet Portal</Link>
            </Button>
          </div>
          <LanguageSwitcher current={lang} onChange={setLang} />

          <div className="mt-4 rounded-2xl border bg-card text-card-foreground shadow-sm p-5 sm:p-8 lg:p-10">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.homeTitle}</h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-3xl">{t.homeDescription}</p>

            <form onSubmit={handleSearch} className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="space-y-2">
                <label htmlFor="pet-id" className="text-sm font-medium">
                  {t.homeIdLabel}
                </label>
                <Input
                  id="pet-id"
                  value={petId}
                  onChange={(e) => {
                    setPetId(e.target.value);
                    setError(null);
                  }}
                  placeholder={t.homeIdPlaceholder}
                  className="h-11"
                />
              </div>

              <Button type="submit" className="h-11 w-full sm:w-auto">
                {t.homeSearchButton}
              </Button>
            </form>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Button type="button" variant="secondary" onClick={handleOpenScanner} className="h-11 w-full sm:w-auto">
                {t.homeScanButton}
              </Button>
            </div>

            {(error || errorKey || scanError) && (
              <p className="mt-4 text-sm text-destructive">{errorKey ? t[errorKey] : error ?? scanError}</p>
            )}
          </div>
        </div>

        {isScannerOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 p-4 flex items-center justify-center">
            <div className="w-full max-w-md bg-background rounded-xl p-4 space-y-4">
              <p className="text-sm text-muted-foreground">{t.homeScanHint}</p>
              <div className="overflow-hidden rounded-lg border bg-black aspect-video">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={stopScanner}>
                {t.homeScanCancel}
              </Button>
              {!isScanning && <p className="text-xs text-muted-foreground">{t.homeCameraUnsupported}</p>}
            </div>
          </div>
        )}

        <SiteFooter t={t} />
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen grid place-items-center text-center px-6 text-destructive">{error}</div>;
  }

  if (errorKey) {
    return <div className="min-h-screen grid place-items-center text-center px-6 text-destructive">{t[errorKey]}</div>;
  }

  return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 max-w-md w-full mx-auto pb-8">
          <LanguageSwitcher current={lang} onChange={setLang} />
          <HeroSection t={t} profile={profile} />
          <DogInfoCard t={t} profile={profile} />
          <ContactSection t={t} profile={profile} />
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

        <SiteFooter t={t} />
      </div>
    
  );
};

export default Index;
