// ============================================
// EDIT YOUR DOG & OWNER INFO HERE
// Replace all [PLACEHOLDER] values with real data
// ============================================

export const dogData = {
  name: "Pepe",
  breed: "Welsh Corgi Pembroke",
  gender: "male" as "male" | "female",
  dob: "March of 2025", 
  color: "Golden - White",
  microchip: "9722xxxxxxxx551",
  notes: "I love belly scratches",
  traits: "Neck marking appears heart-shaped when viewed sideways",
  friendlyWith: {
    people: true,
    children: true,
    dogs: true,
    cats: true
  },
  imageUrl: new URL("../../assets/pepe.jpg", import.meta.url).href,
};

export const ownerData = {
  name: "Rafaella & Giorgos",
  phone1: "+35799719451",
  phone2: "+35796222481",
  email: "gpomportsis@gmail.com",
  location: "Afroditis 29 Aglantzia, Nicosia",
  mapsQuery: "Αφροδίτης+29,+Αγλαντζιά+2101,+Κύπρος",
};
