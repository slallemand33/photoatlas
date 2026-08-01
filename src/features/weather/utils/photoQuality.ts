import type { CloudPhotoQuality } from "../types";

export function getCloudPhotoQuality(cloudCover: number): CloudPhotoQuality {
  if (cloudCover <= 10) return { stars: 5, label: "Excellent" };
  if (cloudCover <= 30) return { stars: 4, label: "Très bon" };
  if (cloudCover <= 50) return { stars: 3, label: "Bon" };
  if (cloudCover <= 75) return { stars: 2, label: "Moyen" };
  return { stars: 1, label: "Mauvais" };
}
