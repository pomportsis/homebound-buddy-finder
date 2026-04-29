"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyVetRequestCreated = void 0;
const admin = __importStar(require("firebase-admin"));
const firebase_functions_1 = require("firebase-functions");
const firestore_1 = require("firebase-functions/v2/firestore");
const params_1 = require("firebase-functions/params");
const sib_api_v3_sdk_1 = __importDefault(require("sib-api-v3-sdk"));
admin.initializeApp();
const BREVO_API_KEY = (0, params_1.defineSecret)("BREVO_API_KEY");
const ADMIN_NOTIFICATION_EMAIL = (0, params_1.defineSecret)("ADMIN_NOTIFICATION_EMAIL");
const NOTIFY_SENDER_EMAIL = (0, params_1.defineSecret)("NOTIFY_SENDER_EMAIL");
const NOTIFY_SENDER_NAME = (0, params_1.defineSecret)("NOTIFY_SENDER_NAME");
exports.notifyVetRequestCreated = (0, firestore_1.onDocumentCreated)({
    document: "vetRequests/{requestId}",
    secrets: [BREVO_API_KEY, ADMIN_NOTIFICATION_EMAIL, NOTIFY_SENDER_EMAIL, NOTIFY_SENDER_NAME],
}, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const data = snap.data();
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
        const client = sib_api_v3_sdk_1.default.ApiClient.instance;
        client.authentications["api-key"].apiKey = brevoApiKey;
        const emailApi = new sib_api_v3_sdk_1.default.TransactionalEmailsApi();
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
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown Brevo send error";
        await snap.ref.update({
            notificationStatus: "failed",
            notificationError: message,
            notificationUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        firebase_functions_1.logger.error("Failed to send Brevo notification", { requestId, error: message });
    }
});
//# sourceMappingURL=index.js.map