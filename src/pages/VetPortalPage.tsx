import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  deleteUser,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { auth, db, storage } from "@/lib/firebase";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Lang, translations } from "@/data/translations";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Pencil } from "lucide-react";

type VetUserProfile = {
  uid: string;
  clinicName: string;
  vetName: string;
  phoneCountry: string;
  phone: string;
  phone2Country?: string;
  phone2?: string;
  location: string;
  email: string;
};

const getUserDocIdFromEmail = (email: string) => email.trim().toLowerCase();

type PetCardData = {
  id: string;
  species: "dog" | "cat";
  name?: string;
  microchip?: string;
  breed?: string;
  collectionName?: "dogs" | "cats";
};

type NewPetForm = {
  species: "dog" | "cat";
  name: string;
  breed: string;
  microchip: string;
  gender: "male" | "female";
  dob: string;
  color: string;
  traits: string;
  notes: string;
  ownerName: string;
  ownerPhone1: string;
  ownerPhone2: string;
  ownerEmail: string;
  ownerLocation: string;
  friendlyPeople: boolean;
  friendlyChildren: boolean;
  friendlyDogs: boolean;
  friendlyCats: boolean;
};

const PHONE_RULES: Record<string, { label: string; dial: string; digits: number }> = {
  CY: { label: "Cyprus", dial: "+357", digits: 8 },
  GR: { label: "Greece", dial: "+30", digits: 10 },
  RU: { label: "Russia", dial: "+7", digits: 10 },
};

const countryOptions = Object.entries(PHONE_RULES);

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const validatePhone = (country: string, value: string, fieldName: string, ruleTemplate?: string) => {
  const rule = PHONE_RULES[country];
  if (!rule) {
    return `Invalid country for ${fieldName}.`;
  }

  const digits = onlyDigits(value);
  if (digits.length !== rule.digits) {
    if (ruleTemplate) {
      return ruleTemplate
        .replace("{field}", fieldName)
        .replace("{digits}", String(rule.digits))
        .replace("{country}", rule.label);
    }
    return `${fieldName} must have exactly ${rule.digits} digits for ${rule.label}.`;
  }

  return null;
};

const initialRegister = {
  clinicName: "",
  vetName: "",
  phoneCountry: "CY",
  phone: "",
  phone2Country: "CY",
  phone2: "",
  location: "",
  email: "",
  password: "",
};

const initialNewPetForm: NewPetForm = {
  species: "dog",
  name: "",
  breed: "",
  microchip: "",
  gender: "male",
  dob: "",
  color: "",
  traits: "",
  notes: "",
  ownerName: "",
  ownerPhone1: "",
  ownerPhone2: "",
  ownerEmail: "",
  ownerLocation: "",
  friendlyPeople: false,
  friendlyChildren: false,
  friendlyDogs: false,
  friendlyCats: false,
};

const VetPortalPage = () => {
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [profile, setProfile] = useState<VetUserProfile | null>(null);
  const [profileDraft, setProfileDraft] = useState<VetUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileDocId, setProfileDocId] = useState<string | null>(null);

  const [pets, setPets] = useState<PetCardData[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [petSearch, setPetSearch] = useState("");
  const [petTypeFilter, setPetTypeFilter] = useState<"all" | "dog" | "cat">("all");
  const [newPetForm, setNewPetForm] = useState<NewPetForm>(initialNewPetForm);
  const [newPetImage, setNewPetImage] = useState<File | null>(null);
  const [addingPet, setAddingPet] = useState(false);
  const [addPetMessage, setAddPetMessage] = useState<string | null>(null);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isEditPetOpen, setIsEditPetOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetCardData | null>(null);
  const [editPetForm, setEditPetForm] = useState<NewPetForm>(initialNewPetForm);
  const [editingPetImage, setEditingPetImage] = useState<File | null>(null);
  const [editPetExistingImageName, setEditPetExistingImageName] = useState<string | null>(null);
  const [editPetExistingImageUrl, setEditPetExistingImageUrl] = useState<string | null>(null);
  const [editPetMessage, setEditPetMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        setProfile(null);
        setProfileDraft(null);
        setProfileDocId(null);
        return;
      }

      setProfileLoading(true);
      setProfileMessage(null);

      try {
        const uidDocRef = doc(db, "users", currentUser.uid);
        const uidSnap = await getDoc(uidDocRef);
        if (uidSnap.exists()) {
          const data = uidSnap.data() as VetUserProfile;
        data.phoneCountry = data.phoneCountry ?? "CY";
        data.phone2Country = data.phone2Country ?? data.phoneCountry ?? "CY";
          setProfileDocId(currentUser.uid);
          setProfile(data);
          setProfileDraft(data);
          return;
        }

        const emailDocId = getUserDocIdFromEmail(currentUser.email ?? "");
        const emailDocRef = doc(db, "users", emailDocId);
        const emailSnap = await getDoc(emailDocRef);
        if (!emailSnap.exists()) {
          setProfileMessage(t.vetPortalProfileNotFound);
          setProfileLoading(false);
          return;
        }

        const data = emailSnap.data() as VetUserProfile;
        data.phoneCountry = data.phoneCountry ?? "CY";
        data.phone2Country = data.phone2Country ?? data.phoneCountry ?? "CY";
        setProfileDocId(emailDocId);
        setProfile(data);
        setProfileDraft(data);
      } catch {
        setProfileMessage(t.vetPortalProfileLoadFailed);
      } finally {
        setProfileLoading(false);
      }
    };

    void loadProfile();
  }, [currentUser]);

  useEffect(() => {
    const loadPets = async () => {
      if (!profile?.clinicName) {
        setPets([]);
        return;
      }

      await loadClinicPets(profile.clinicName);
    };

    void loadPets();
  }, [profile?.clinicName]);

  const filteredPets = useMemo(() => {
    const q = petSearch.trim().toLowerCase();
    const byType = petTypeFilter === "all" ? pets : pets.filter((pet) => pet.species === petTypeFilter);
    if (!q) {
      return byType;
    }

    return byType.filter((pet) => [pet.name, pet.microchip, pet.breed].some((field) => field?.toLowerCase().includes(q)));
  }, [petSearch, petTypeFilter, pets]);

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    setSubmitting(true);

    const phoneValidation = validatePhone(registerForm.phoneCountry, registerForm.phone, t.vetPortalPhone, t.vetPortalPhoneDigitsRule);
    if (phoneValidation) {
      setAuthError(phoneValidation);
      setSubmitting(false);
      return;
    }

    if (registerForm.phone2.trim()) {
      const phone2Validation = validatePhone(registerForm.phone2Country, registerForm.phone2, t.vetPortalPhone2, t.vetPortalPhoneDigitsRule);
      if (phone2Validation) {
        setAuthError(phone2Validation);
        setSubmitting(false);
        return;
      }
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, registerForm.email, registerForm.password);
      const uidDocId = cred.user.uid;
      const userProfile: VetUserProfile = {
        uid: cred.user.uid,
        clinicName: registerForm.clinicName,
        vetName: registerForm.vetName,
        phoneCountry: registerForm.phoneCountry,
        phone: onlyDigits(registerForm.phone),
        phone2Country: registerForm.phone2Country,
        phone2: onlyDigits(registerForm.phone2),
        location: registerForm.location,
        email: registerForm.email,
      };

      try {
        await setDoc(doc(db, "users", uidDocId), {
          ...userProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setRegisterForm(initialRegister);
        setLoginEmail("");
        setLoginPassword("");
      } catch (firestoreError) {
        await deleteUser(cred.user);
        await signOut(auth);
        throw firestoreError;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t.vetPortalRegisterFailed;
      setAuthError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setLoginEmail("");
      setLoginPassword("");
    } catch {
      setAuthError(t.vetPortalLoginFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentUser || !profileDraft || !profileDocId) return;

    setProfileMessage(null);

    const phoneValidation = validatePhone(profileDraft.phoneCountry, profileDraft.phone, t.vetPortalPhone, t.vetPortalPhoneDigitsRule);
    if (phoneValidation) {
      setProfileMessage(phoneValidation);
      return;
    }

    if ((profileDraft.phone2 ?? "").trim()) {
      const phone2Validation = validatePhone(
        profileDraft.phone2Country ?? "CY",
        profileDraft.phone2 ?? "",
        t.vetPortalPhone2,
        t.vetPortalPhoneDigitsRule,
      );
      if (phone2Validation) {
        setProfileMessage(phone2Validation);
        return;
      }
    }

    try {
      await updateDoc(doc(db, "users", profileDocId), {
        vetName: profileDraft.vetName,
        phoneCountry: profileDraft.phoneCountry,
        phone: onlyDigits(profileDraft.phone),
        phone2Country: profileDraft.phone2Country ?? "CY",
        phone2: onlyDigits(profileDraft.phone2 ?? ""),
        location: profileDraft.location,
        updatedAt: serverTimestamp(),
      });
      setProfile(profileDraft);
      setProfileMessage(t.vetPortalProfileUpdated);
    } catch {
      setProfileMessage(t.vetPortalProfileUpdateFailed);
    }
  };

  const loadClinicPets = async (clinicName: string) => {
    setPetsLoading(true);
    try {
      const [dogsSnap, catsSnap] = await Promise.all([
        getDocs(query(collection(db, "dogs"), where("veterinarian", "==", clinicName))),
        getDocs(query(collection(db, "cats"), where("veterinarian", "==", clinicName))),
      ]);

      const mapPets = (snap: Awaited<ReturnType<typeof getDocs>>, species: "dog" | "cat", collectionName: "dogs" | "cats") =>
        snap.docs.map((petDoc) => {
          const data = petDoc.data() as Omit<PetCardData, "id" | "species">;
          return {
            id: petDoc.id,
            species,
            collectionName,
            name: data.name ?? "",
            microchip: data.microchip ?? "",
            breed: data.breed ?? "",
          };
        });

      const petItems = [...mapPets(dogsSnap, "dog", "dogs"), ...mapPets(catsSnap, "cat", "cats")];
      setPets(petItems);
    } finally {
      setPetsLoading(false);
    }
  };

  const handleAddPet = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    setAddingPet(true);
    setAddPetMessage(null);

    try {
      let imageUrl = "/images/dog-placeholder.jpg";

      if (newPetImage) {
        const imageRef = ref(storage, `pets/${profile.uid}/${Date.now()}-${newPetImage.name}`);
        await uploadBytes(imageRef, newPetImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      const targetCollection = newPetForm.species === "cat" ? "cats" : "dogs";
      const microchip = newPetForm.microchip.trim();
      const docId = `${newPetForm.species === "cat" ? "C" : "D"}${microchip}`;

      await setDoc(doc(db, targetCollection, docId), {
        name: newPetForm.name,
        breed: newPetForm.breed,
        microchip,
        gender: newPetForm.gender,
        dob: newPetForm.dob,
        color: newPetForm.color,
        traits: newPetForm.traits,
        notes: newPetForm.notes,
        imageUrl,
        veterinarian: profile.clinicName,
        vet: {
          name: profile.vetName,
          phone1: profile.phone,
          phone2: profile.phone2 ?? "",
          email: profile.email,
          location: profile.location,
          mapsQuery: profile.location,
        },
        owner: {
          name: newPetForm.ownerName,
          phone1: newPetForm.ownerPhone1,
          phone2: newPetForm.ownerPhone2,
          email: newPetForm.ownerEmail,
          location: newPetForm.ownerLocation,
          mapsQuery: newPetForm.ownerLocation,
        },
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setNewPetForm(initialNewPetForm);
      setNewPetImage(null);
      setAddPetMessage(t.vetPortalPetAddedSuccess);
      setIsAddPetOpen(false);

      await loadClinicPets(profile.clinicName);
    } catch {
      setAddPetMessage(t.vetPortalPetAddFailed);
    } finally {
      setAddingPet(false);
    }
  };

  const handleOpenEditPet = async (pet: PetCardData) => {
    if (!pet.collectionName) return;
    setEditPetMessage(null);
    setEditingPet(pet);
    try {
      const snap = await getDoc(doc(db, pet.collectionName, pet.id));
      if (!snap.exists()) {
        setEditPetMessage(t.vetPortalPetNotFound);
        return;
      }
      const data = snap.data() as Record<string, unknown>;
      const owner = (data.owner as Record<string, string> | undefined) ?? {};
      const imageUrl = (data.imageUrl as string | undefined) ?? "";
      setEditPetExistingImageUrl(imageUrl || null);
      let existingName: string | null = null;
      if (imageUrl) {
        try {
          const decoded = decodeURIComponent(imageUrl);
          const fromPath = decoded.split("/").pop()?.split("?")[0] ?? "";
          existingName = fromPath || null;
        } catch {
          existingName = imageUrl.split("/").pop()?.split("?")[0] ?? null;
        }
      }
      setEditPetExistingImageName(existingName);
      setEditingPetImage(null);

      setEditPetForm({
        species: pet.species,
        name: (data.name as string) ?? "",
        breed: (data.breed as string) ?? "",
        microchip: (data.microchip as string) ?? "",
        gender: ((data.gender as "male" | "female") ?? "male"),
        dob: (data.dob as string) ?? "",
        color: (data.color as string) ?? "",
        traits: (data.traits as string) ?? "",
        notes: (data.notes as string) ?? "",
        ownerName: owner.name ?? "",
        ownerPhone1: owner.phone1 ?? "",
        ownerPhone2: owner.phone2 ?? "",
        ownerEmail: owner.email ?? "",
        ownerLocation: owner.location ?? "",
        friendlyPeople: Boolean((data.friendlyWith as Record<string, unknown> | undefined)?.people),
        friendlyChildren: Boolean((data.friendlyWith as Record<string, unknown> | undefined)?.children),
        friendlyDogs: Boolean((data.friendlyWith as Record<string, unknown> | undefined)?.dogs),
        friendlyCats: Boolean((data.friendlyWith as Record<string, unknown> | undefined)?.cats),
      });
      setIsEditPetOpen(true);
    } catch {
      setEditPetMessage(t.vetPortalPetLoadFailed);
    }
  };

  const handleEditPet = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile || !editingPet?.collectionName) return;

    setEditPetMessage(null);
    try {
      let imageUrl: string | undefined;
      if (editingPetImage) {
        const imageRef = ref(storage, `pets/${profile.uid}/${Date.now()}-${editingPetImage.name}`);
        await uploadBytes(imageRef, editingPetImage);
        imageUrl = await getDownloadURL(imageRef);

        if (editPetExistingImageUrl && !editPetExistingImageUrl.includes("/images/dog-placeholder.jpg")) {
          try {
            const oldImageRef = ref(storage, editPetExistingImageUrl);
            await deleteObject(oldImageRef);
          } catch {
            // Ignore old image cleanup failures so pet update still succeeds.
          }
        }
      }

      const payload: Record<string, unknown> = {
        name: editPetForm.name,
        breed: editPetForm.breed,
        microchip: editPetForm.microchip.trim(),
        gender: editPetForm.gender,
        dob: editPetForm.dob,
        color: editPetForm.color,
        traits: editPetForm.traits,
        notes: editPetForm.notes,
        owner: {
          name: editPetForm.ownerName,
          phone1: editPetForm.ownerPhone1,
          phone2: editPetForm.ownerPhone2,
          email: editPetForm.ownerEmail,
          location: editPetForm.ownerLocation,
          mapsQuery: editPetForm.ownerLocation,
        },
        friendlyWith: {
          people: editPetForm.friendlyPeople,
          children: editPetForm.friendlyChildren,
          dogs: editPetForm.friendlyDogs,
          cats: editPetForm.friendlyCats,
        },
        veterinarian: profile.clinicName,
        vet: {
          name: profile.vetName,
          phone1: profile.phone,
          phone2: profile.phone2 ?? "",
          email: profile.email,
          location: profile.location,
          mapsQuery: profile.location,
        },
        updatedAt: serverTimestamp(),
      };

      if (imageUrl) payload.imageUrl = imageUrl;

      await updateDoc(doc(db, editingPet.collectionName, editingPet.id), payload);
      setIsEditPetOpen(false);
      setEditingPetImage(null);
      setEditPetExistingImageName(null);
      setEditPetExistingImageUrl(null);
      await loadClinicPets(profile.clinicName);
    } catch {
      setEditPetMessage(t.vetPortalPetUpdateFailed);
    }
  };

  const handleViewPet = (pet: PetCardData) => {
    const petId = encodeURIComponent(pet.id);
    window.open(`${window.location.origin}?id=${petId}`, "_blank");
  };

  if (loadingAuth) {
    return <div className="min-h-screen grid place-items-center">{t.vetPortalLoading}</div>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background py-10 px-4">
        <div className="max-w-xl mx-auto">
          <LanguageSwitcher current={lang} onChange={setLang} />
          <Card>
            <CardHeader>
              <CardTitle>{t.vetPortalTitle}</CardTitle>
              <CardDescription>{t.vetPortalAuthDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Button variant={authMode === "login" ? "default" : "outline"} onClick={() => setAuthMode("login")}>
                  {t.vetPortalLogin}
                </Button>
                <Button variant={authMode === "register" ? "default" : "outline"} onClick={() => setAuthMode("register")}>
                  {t.vetPortalRegister}
                </Button>
              </div>

              {authMode === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t.email}</Label>
                    <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t.vetPortalPassword}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? t.vetPortalPleaseWait : t.vetPortalLogin}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">{t.vetPortalClinicName}</Label>
                    <Input
                      id="clinicName"
                      value={registerForm.clinicName}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, clinicName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vetName">{t.vetPortalVetName}</Label>
                    <Input id="vetName" value={registerForm.vetName} onChange={(e) => setRegisterForm((prev) => ({ ...prev, vetName: e.target.value }))} required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t.vetPortalPhone}</Label>
                      <div className="flex gap-2">
                        <select
                          value={registerForm.phoneCountry}
                          onChange={(e) => setRegisterForm((prev) => ({ ...prev, phoneCountry: e.target.value }))}
                          className="h-10 rounded-md border bg-background px-2 text-sm"
                        >
                          {countryOptions.map(([code, rule]) => (
                            <option key={code} value={code}>{`${code} ${rule.dial}`}</option>
                          ))}
                        </select>
                        <Input
                          id="phone"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm((prev) => ({ ...prev, phone: onlyDigits(e.target.value) }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone2">{t.vetPortalPhone2}</Label>
                      <div className="flex gap-2">
                        <select
                          value={registerForm.phone2Country}
                          onChange={(e) => setRegisterForm((prev) => ({ ...prev, phone2Country: e.target.value }))}
                          className="h-10 rounded-md border bg-background px-2 text-sm"
                        >
                          {countryOptions.map(([code, rule]) => (
                            <option key={code} value={code}>{`${code} ${rule.dial}`}</option>
                          ))}
                        </select>
                        <Input id="phone2" value={registerForm.phone2} onChange={(e) => setRegisterForm((prev) => ({ ...prev, phone2: onlyDigits(e.target.value) }))} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">{t.vetPortalLocation}</Label>
                    <Input
                      id="location"
                      value={registerForm.location}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">{t.email}</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">{t.vetPortalPassword}</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? t.vetPortalPleaseWait : t.vetPortalCreateAccount}
                  </Button>
                </form>
              )}

              {authError && <p className="text-sm text-destructive">{authError}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <LanguageSwitcher current={lang} onChange={setLang} />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t.vetPortalTitle}</h1>
          <Button variant="outline" onClick={() => void signOut(auth)}>
            {t.vetPortalLogout}
          </Button>
        </div>

        {profileLoading || !profileDraft ? (
          <Card>
            <CardContent className="pt-6">{t.vetPortalLoadingProfile}</CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList>
              <TabsTrigger value="profile">{t.vetPortalProfile}</TabsTrigger>
              <TabsTrigger value="pets">{t.vetPortalPets}</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>{t.vetPortalProfileSettings}</CardTitle>
                  <CardDescription>{t.vetPortalProfileSettingsDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-clinic">{t.vetPortalClinicName}</Label>
                      <Input id="profile-clinic" value={profileDraft.clinicName} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-vet">{t.vetPortalVetName}</Label>
                      <Input
                        id="profile-vet"
                        value={profileDraft.vetName}
                        onChange={(e) => setProfileDraft((prev) => (prev ? { ...prev, vetName: e.target.value } : prev))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="profile-phone">{t.vetPortalPhone}</Label>
                        <div className="flex gap-2">
                          <select
                            value={profileDraft.phoneCountry}
                            onChange={(e) => setProfileDraft((prev) => (prev ? { ...prev, phoneCountry: e.target.value } : prev))}
                            className="h-10 rounded-md border bg-background px-2 text-sm"
                          >
                            {countryOptions.map(([code, rule]) => (
                              <option key={code} value={code}>{`${code} ${rule.dial}`}</option>
                            ))}
                          </select>
                          <Input
                            id="profile-phone"
                            value={profileDraft.phone}
                            onChange={(e) => setProfileDraft((prev) => (prev ? { ...prev, phone: onlyDigits(e.target.value) } : prev))}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-phone2">{t.vetPortalPhone2}</Label>
                        <div className="flex gap-2">
                          <select
                            value={profileDraft.phone2Country ?? "CY"}
                            onChange={(e) => setProfileDraft((prev) => (prev ? { ...prev, phone2Country: e.target.value } : prev))}
                            className="h-10 rounded-md border bg-background px-2 text-sm"
                          >
                            {countryOptions.map(([code, rule]) => (
                              <option key={code} value={code}>{`${code} ${rule.dial}`}</option>
                            ))}
                          </select>
                          <Input
                            id="profile-phone2"
                            value={profileDraft.phone2 ?? ""}
                            onChange={(e) => setProfileDraft((prev) => (prev ? { ...prev, phone2: onlyDigits(e.target.value) } : prev))}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-location">{t.vetPortalLocation}</Label>
                      <Input
                        id="profile-location"
                        value={profileDraft.location}
                        onChange={(e) => setProfileDraft((prev) => (prev ? { ...prev, location: e.target.value } : prev))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-email">{t.email}</Label>
                      <Input id="profile-email" value={profileDraft.email} disabled />
                    </div>
                    <Button type="submit">{t.vetPortalSaveProfile}</Button>
                    {profileMessage && <p className="text-sm text-muted-foreground">{profileMessage}</p>}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pets">
              <Card>
                <CardHeader>
                  <CardTitle>{t.vetPortalClinicPets}</CardTitle>
                  <CardDescription>{t.vetPortalClinicPetsDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-end">
                    <Button type="button" onClick={() => setIsAddPetOpen(true)}>{t.vetPortalAddNewPet}</Button>
                  </div>

                  <Dialog open={isAddPetOpen} onOpenChange={setIsAddPetOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{t.vetPortalAddNewPet}</DialogTitle>
                        <DialogDescription>{t.vetPortalAddPetDialogDescription}</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddPet} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <select
                            value={newPetForm.species}
                            onChange={(e) => setNewPetForm((prev) => ({ ...prev, species: e.target.value as "dog" | "cat" }))}
                            className="h-10 rounded-md border bg-background px-2 text-sm"
                          >
                            <option value="dog">{t.vetPortalDog}</option>
                            <option value="cat">{t.vetPortalCat}</option>
                          </select>
                          <Input placeholder={t.name} value={newPetForm.name} onChange={(e) => setNewPetForm((prev) => ({ ...prev, name: e.target.value }))} required />
                          <Input placeholder={t.breed} value={newPetForm.breed} onChange={(e) => setNewPetForm((prev) => ({ ...prev, breed: e.target.value }))} required />
                          <Input placeholder={t.microchip} value={newPetForm.microchip} onChange={(e) => setNewPetForm((prev) => ({ ...prev, microchip: e.target.value }))} required />
                          <Input type="date" value={newPetForm.dob} onChange={(e) => setNewPetForm((prev) => ({ ...prev, dob: e.target.value }))} />
                          <Input placeholder={t.color} value={newPetForm.color} onChange={(e) => setNewPetForm((prev) => ({ ...prev, color: e.target.value }))} />
                          <Input placeholder={t.traits} value={newPetForm.traits} onChange={(e) => setNewPetForm((prev) => ({ ...prev, traits: e.target.value }))} />
                          <Input placeholder={t.medicalNotes} value={newPetForm.notes} onChange={(e) => setNewPetForm((prev) => ({ ...prev, notes: e.target.value }))} />
                          <Input placeholder={t.vetPortalOwnerName} value={newPetForm.ownerName} onChange={(e) => setNewPetForm((prev) => ({ ...prev, ownerName: e.target.value }))} />
                          <Input placeholder={t.vetPortalOwnerPhone} value={newPetForm.ownerPhone1} onChange={(e) => setNewPetForm((prev) => ({ ...prev, ownerPhone1: e.target.value }))} />
                          <Input placeholder={t.vetPortalOwnerPhone2} value={newPetForm.ownerPhone2} onChange={(e) => setNewPetForm((prev) => ({ ...prev, ownerPhone2: e.target.value }))} />
                          <Input placeholder={t.vetPortalOwnerEmail} type="email" value={newPetForm.ownerEmail} onChange={(e) => setNewPetForm((prev) => ({ ...prev, ownerEmail: e.target.value }))} />
                          <Input placeholder={t.vetPortalOwnerLocation} value={newPetForm.ownerLocation} onChange={(e) => setNewPetForm((prev) => ({ ...prev, ownerLocation: e.target.value }))} />
                        </div>
                        <div className="rounded-md border p-3 space-y-2">
                          <p className="text-sm font-medium">{t.vetPortalFriendlyWithTitle}</p>
                          <p className="text-xs text-muted-foreground">{t.vetPortalFriendlyWithAddDescription}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newPetForm.friendlyPeople} onChange={(e) => setNewPetForm((p) => ({ ...p, friendlyPeople: e.target.checked }))} />{t.people}</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newPetForm.friendlyChildren} onChange={(e) => setNewPetForm((p) => ({ ...p, friendlyChildren: e.target.checked }))} />{t.children}</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newPetForm.friendlyDogs} onChange={(e) => setNewPetForm((p) => ({ ...p, friendlyDogs: e.target.checked }))} />{t.dogs}</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newPetForm.friendlyCats} onChange={(e) => setNewPetForm((p) => ({ ...p, friendlyCats: e.target.checked }))} />{t.cats}</label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-pet-file">{t.vetPortalChooseFile}</Label>
                          <Input id="new-pet-file" type="file" accept="image/*" onChange={(e) => setNewPetImage(e.target.files?.[0] ?? null)} />
                          <p className="text-xs text-muted-foreground">{newPetImage?.name ?? t.vetPortalNoFileSelected}</p>
                        </div>
                        <Button type="submit" disabled={addingPet}>{addingPet ? t.vetPortalPleaseWait : t.vetPortalAddNewPet}</Button>
                        {addPetMessage && <p className="text-sm text-muted-foreground">{addPetMessage}</p>}
                      </form>
                    </DialogContent>
                  </Dialog>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input placeholder={t.vetPortalSearchPets} value={petSearch} onChange={(e) => setPetSearch(e.target.value)} />
                    <select
                      value={petTypeFilter}
                      onChange={(e) => setPetTypeFilter(e.target.value as "all" | "dog" | "cat")}
                      className="h-10 rounded-md border bg-background px-2 text-sm sm:w-40"
                    >
                      <option value="all">{t.vetPortalAll}</option>
                      <option value="dog">{t.vetPortalDog}</option>
                      <option value="cat">{t.vetPortalCat}</option>
                    </select>
                  </div>

                  {petsLoading ? (
                    <p className="text-sm text-muted-foreground">{t.vetPortalLoadingPets}</p>
                  ) : filteredPets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t.vetPortalNoPets}</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredPets.map((pet) => (
                        <div key={pet.id} className="rounded-lg border p-3 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="font-medium">{pet.name || "—"}</p>
                            <p className="text-xs text-muted-foreground uppercase">{pet.species}</p>
                            <p className="text-sm text-muted-foreground">{t.microchip}: {pet.microchip || "—"}</p>
                            <p className="text-sm text-muted-foreground">{t.breed}: {pet.breed || "—"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="outline" size="icon" onClick={() => handleViewPet(pet)} aria-label={t.vetPortalViewPet}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t.vetPortalViewPet}</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="outline" size="icon" onClick={() => void handleOpenEditPet(pet)} aria-label={t.vetPortalEditPet}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t.vetPortalEditPet}</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Dialog open={isEditPetOpen} onOpenChange={setIsEditPetOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{t.vetPortalEditPet}</DialogTitle>
                        <DialogDescription>{t.vetPortalEditPetDialogDescription}</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleEditPet} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input placeholder={t.name} value={editPetForm.name} onChange={(e) => setEditPetForm((prev) => ({ ...prev, name: e.target.value }))} required />
                          <Input placeholder={t.breed} value={editPetForm.breed} onChange={(e) => setEditPetForm((prev) => ({ ...prev, breed: e.target.value }))} required />
                          <Input placeholder={t.microchip} value={editPetForm.microchip} onChange={(e) => setEditPetForm((prev) => ({ ...prev, microchip: e.target.value }))} required />
                          <Input type="date" value={editPetForm.dob} onChange={(e) => setEditPetForm((prev) => ({ ...prev, dob: e.target.value }))} />
                          <Input placeholder={t.color} value={editPetForm.color} onChange={(e) => setEditPetForm((prev) => ({ ...prev, color: e.target.value }))} />
                          <Input placeholder={t.traits} value={editPetForm.traits} onChange={(e) => setEditPetForm((prev) => ({ ...prev, traits: e.target.value }))} />
                          <Input placeholder={t.medicalNotes} value={editPetForm.notes} onChange={(e) => setEditPetForm((prev) => ({ ...prev, notes: e.target.value }))} />
                          <Input placeholder={t.vetPortalOwnerName} value={editPetForm.ownerName} onChange={(e) => setEditPetForm((prev) => ({ ...prev, ownerName: e.target.value }))} />
                          <Input placeholder={t.vetPortalOwnerPhone} value={editPetForm.ownerPhone1} onChange={(e) => setEditPetForm((prev) => ({ ...prev, ownerPhone1: e.target.value }))} />
                          <Input placeholder={t.vetPortalOwnerPhone2} value={editPetForm.ownerPhone2} onChange={(e) => setEditPetForm((prev) => ({ ...prev, ownerPhone2: e.target.value }))} />
                          <Input placeholder={t.vetPortalOwnerEmail} type="email" value={editPetForm.ownerEmail} onChange={(e) => setEditPetForm((prev) => ({ ...prev, ownerEmail: e.target.value }))} />
                          <Input placeholder={t.vetPortalOwnerLocation} value={editPetForm.ownerLocation} onChange={(e) => setEditPetForm((prev) => ({ ...prev, ownerLocation: e.target.value }))} />
                        </div>
                        <div className="rounded-md border p-3 space-y-2">
                          <p className="text-sm font-medium">{t.vetPortalFriendlyWithTitle}</p>
                          <p className="text-xs text-muted-foreground">{t.vetPortalFriendlyWithEditDescription}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editPetForm.friendlyPeople} onChange={(e) => setEditPetForm((p) => ({ ...p, friendlyPeople: e.target.checked }))} />{t.people}</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editPetForm.friendlyChildren} onChange={(e) => setEditPetForm((p) => ({ ...p, friendlyChildren: e.target.checked }))} />{t.children}</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editPetForm.friendlyDogs} onChange={(e) => setEditPetForm((p) => ({ ...p, friendlyDogs: e.target.checked }))} />{t.dogs}</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editPetForm.friendlyCats} onChange={(e) => setEditPetForm((p) => ({ ...p, friendlyCats: e.target.checked }))} />{t.cats}</label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-pet-file">{t.vetPortalChooseFile}</Label>
                          <Input id="edit-pet-file" type="file" accept="image/*" onChange={(e) => setEditingPetImage(e.target.files?.[0] ?? null)} />
                          <p className="text-xs text-muted-foreground">{editingPetImage?.name ?? editPetExistingImageName ?? t.vetPortalNoFileSelected}</p>
                        </div>
                        <Button type="submit">{t.vetPortalEditPet}</Button>
                        {editPetMessage && <p className="text-sm text-muted-foreground">{editPetMessage}</p>}
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default VetPortalPage;