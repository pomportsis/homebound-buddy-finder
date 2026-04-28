# Homebound Buddy Finder

Vite + React + TypeScript app that shows a dog's return-home profile from an NFC collar URL.

## Dynamic mode (Firebase Firestore)

The app reads `?id=` from the URL and fetches the dog profile from Firestore.

Example URL:

`https://your-domain.com/?id=9722xxxxxxxx551`

Where `id` is the Firestore document id in collection `dogs` (e.g. chip id / UUID).

## 1) Install dependencies

```bash
npm install
```

## 2) Firebase environment variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 3) Firestore data shape

Collection: `dogs`

Document id: value from URL `?id=`

Dog document example:

```json
{
  "name": "Pepe",
  "breed": "Welsh Corgi Pembroke",
  "gender": "male",
  "dob": "March 2025",
  "color": "Brown/White",
  "microchip": "9722xxxxxxxx551",
  "traits": "Neck marking appears heart-shaped",
  "notes": "I love belly scratches",
  "friendlyWith": {
    "people": true,
    "children": true,
    "dogs": true,
    "cats": false
  },
  "imageUrl": "https://your-public-image-link.jpg",
  "owner": {
    "name": "Rafaella & Giorgos",
    "phone1": "+35799719451",
    "phone2": "+35796222481",
    "email": "gpomportsis@gmail.com",
    "location": "Afroditis 29 Aglantzia, Nicosia",
    "mapsQuery": "Afroditis 29 Aglantzia, Nicosia"
  }
}
```

> Also supported: owner in subcollection `dogs/{id}/owner/profile`.

## 4) Run

```bash
npm run dev
```
