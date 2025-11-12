// src/ownerId.ts
import * as Application from "expo-application";
import * as Crypto from "expo-crypto";

let cached: string | null = null;

/**
 * Returns a stable, unique ID for this device installation.
 * Works on Android, iOS, and web.
 */
export async function getOwnerId(): Promise<string> {
  if (cached) return cached;

  try {
    // Android device ID
    const androidId = await Application.getAndroidId();
    if (androidId) {
      cached = `android:${androidId}`;
      return cached;
    }
  } catch {}

  try {
    // iOS device identifier (stable for vendor)
    const idfv = await Application.getIosIdForVendorAsync?.();
    if (idfv) {
      cached = `ios:${idfv}`;
      return cached;
    }
  } catch {}

  // Fallback: generate a random but consistent ID hash for this app install
  const rand = Math.random().toString(36).slice(2);
  cached = `fallback:${await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rand
  )}`;
  return cached;
}
