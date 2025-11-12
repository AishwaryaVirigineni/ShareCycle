/**
 * Proximity Band Utilities
 * Converts distances to human-readable proximity bands
 * Matches backend proximity_band function
 */

export type ProximityBand = "0-100" | "100-250" | "250-500" | "500-1000" | ">1000";

/**
 * Convert distance in meters to proximity band
 */
export function getProximityBand(distanceM: number): ProximityBand {
  if (distanceM <= 100) {
    return "0-100";
  } else if (distanceM <= 250) {
    return "100-250";
  } else if (distanceM <= 500) {
    return "250-500";
  } else if (distanceM <= 1000) {
    return "500-1000";
  } else {
    return ">1000";
  }
}

/**
 * Get human-readable label for proximity band
 */
export function getProximityLabel(band: ProximityBand): string {
  const labels: Record<ProximityBand, string> = {
    "0-100": "in this building",
    "100-250": "very nearby",
    "250-500": "nearby",
    "500-1000": "in the area",
    ">1000": "further away",
  };
  return labels[band] || "nearby";
}

/**
 * Convert distance in kilometers to proximity band
 */
export function kmToProximityBand(km: number): ProximityBand {
  return getProximityBand(km * 1000);
}

