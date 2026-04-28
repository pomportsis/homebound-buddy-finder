export type DogGender = "male" | "female";

export interface FriendlyWith {
  people: boolean;
  children: boolean;
  dogs: boolean;
  cats: boolean;
}

export interface OwnerInfo {
  name: string;
  phone1: string;
  phone2?: string;
  email: string;
  location: string;
  mapsQuery: string;
}

export interface VetInfo {
  name: string;
  phone1: string;
  phone2?: string;
  email: string;
  location: string;
  mapsQuery: string;
}

export interface DogProfile {
  name: string;
  breed: string;
  gender: DogGender;
  dob: string;
  color: string;
  microchip: string;
  traits: string;
  notes: string;
  veterinarian: string;
  friendlyWith: FriendlyWith;
  imageUrl: string;
  owner: OwnerInfo;
  vet: VetInfo;
}
