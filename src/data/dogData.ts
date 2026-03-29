// ============================================
// EDIT YOUR DOG & OWNER INFO HERE
// Replace all [PLACEHOLDER] values with real data
// ============================================

export const dogData = {
  name: "[DOG_NAME]",
  breed: "[BREED]",
  gender: "male" as "male" | "female", // "male" or "female"
  dob: "[DOB]", // e.g. "2020-05-15"
  color: "[COLOR]",
  microchip: "[MICROCHIP]",
  notes: "[NOTES]", // medical notes / allergies
  traits: "Scar on left ear, brown spot on belly", // identifying marks
  friendlyWith: {
    people: true,
    children: true,
    dogs: true,
  },
  imageUrl: "/images/dog-placeholder.jpg", // replace with your dog's photo
};

export const ownerData = {
  name: "[OWNER_NAME]",
  phone1: "[PHONE1]", // e.g. "+30 6912345678"
  phone2: "[PHONE2]",
  email: "[EMAIL]",
  location: "[LOCATION]", // e.g. "Athens, Greece"
  mapsQuery: "[LOCATION]", // used in Google Maps link
};
