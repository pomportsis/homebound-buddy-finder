import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import SibApiV3Sdk from "sib-api-v3-sdk";

admin.initializeApp();

const BREVO_API_KEY = defineSecret("BREVO_API_KEY");
const ADMIN_NOTIFICATION_EMAIL = defineSecret("ADMIN_NOTIFICATION_EMAIL");
const NOTIFY_SENDER_EMAIL = defineSecret("NOTIFY_SENDER_EMAIL");
const NOTIFY_SENDER_NAME = defineSecret("NOTIFY_SENDER_NAME");

type VetRequestDoc = {
  type?: "request_nfc" | "request_delete";
  petId?: string;
  petName?: string;
  species?: "dog" | "cat";
  microchip?: string;
  clinicName?: string;
  vet?: {
    name?: string;
    phone1?: string;
    phone2?: string;
    email?: string;
    location?: string;
  };
};

export const notifyVetRequestCreated = onDocumentCreated(
  {
    document: "vetRequests/{requestId}",
    secrets: [BREVO_API_KEY, ADMIN_NOTIFICATION_EMAIL, NOTIFY_SENDER_EMAIL, NOTIFY_SENDER_NAME],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data() as VetRequestDoc;
    const requestId = event.params.requestId;

    const brevoApiKey = BREVO_API_KEY.value();
    const adminEmail = ADMIN_NOTIFICATION_EMAIL.value();
    const senderEmail = NOTIFY_SENDER_EMAIL.value() || "noreply@example.com";
    const senderName = NOTIFY_SENDER_NAME.value() || "Homebound Buddy";

    if (!brevoApiKey || !adminEmail) {
      await snap.ref.update({
        notificationStatus: "failed",
        notificationError: "Missing required function secrets: BREVO_API_KEY or ADMIN_NOTIFICATION_EMAIL",
        notificationUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return;
    }

    const actionLabel = data.type === "request_delete" ? "Delete Request" : "NFC Request";
    const subject = `[Vet Portal] ${actionLabel} - Microchip ${data.microchip ?? "N/A"}`;

    const lines = [
      `Request ID: ${requestId}`,
      `Type: ${data.type ?? "unknown"}`,
      `Pet ID: ${data.petId ?? "N/A"}`,
      `Pet Name: ${data.petName ?? "N/A"}`,
      `Species: ${data.species ?? "N/A"}`,
      `Microchip: ${data.microchip ?? "N/A"}`,
      `Clinic: ${data.clinicName ?? "N/A"}`,
      "",
      "Vet info:",
      `- Name: ${data.vet?.name ?? "N/A"}`,
      `- Email: ${data.vet?.email ?? "N/A"}`,
      `- Phone 1: ${data.vet?.phone1 ?? "N/A"}`,
      `- Phone 2: ${data.vet?.phone2 ?? "N/A"}`,
      `- Location: ${data.vet?.location ?? "N/A"}`,
    ];

    const textContent = lines.join("\n");

    try {
      const client = SibApiV3Sdk.ApiClient.instance;
      client.authentications["api-key"].apiKey = brevoApiKey;

      const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();
      await emailApi.sendTransacEmail({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: adminEmail }],
        subject,
        textContent,
      });

      await snap.ref.update({
        notificationStatus: "sent",
        notificationSentAt: admin.firestore.FieldValue.serverTimestamp(),
        notificationUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Brevo send error";
      await snap.ref.update({
        notificationStatus: "failed",
        notificationError: message,
        notificationUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.error("Failed to send Brevo notification", { requestId, error: message });
    }
  },
);