import CryptoJS from "crypto-js";

/**
 * Global shared keys for simple cross-app payload encryption.
 * In production, these must be handled via secure environment variables.
 */
const SECRET_KEY = process.env.NEXT_PUBLIC_AUTH_PAYLOAD_SECRET || "instanvi-auth-default-secret-3x#k9";

import { User } from "@/types/auth";

export interface AuthPayload {
  token?: string;
  organizationId?: string;
  organizationName?: string;
  user?: User;
}

export const EncryptionUtils = {
  /**
   * Encrypts a plain object into a secure URL-safe string.
   */
  encrypt: <T extends object>(data: T): string => {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
      
      // Make it URL safe
      return encodeURIComponent(encrypted);
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error("Secure communication failure");
    }
  },

  /**
   * Decrypts a secure string back into its original object format.
   */
  decrypt: <T>(encryptedStr: string): T | null => {
    try {
      if (!encryptedStr) return null;
      
      const decoded = decodeURIComponent(encryptedStr);
      const bytes = CryptoJS.AES.decrypt(decoded, SECRET_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) return null;
      return JSON.parse(decryptedString) as T;
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  }
};
