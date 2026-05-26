import { API_BASE_URL } from '../config/api';
import type { Car } from '../app/api/cars';

const UPLOAD_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

function isRasterImagePath(path: string): boolean {
  return /\.(jpe?g|png|webp)$/i.test(path);
}

/** Server default placeholder (SVG) — not loadable in React Native Image. */
export function isSvgCarImageUrl(imageUrl?: string | null): boolean {
  if (!imageUrl || imageUrl.trim() === '') {
    return false;
  }
  const lower = imageUrl.trim().toLowerCase();
  return lower.endsWith('.svg') || lower.includes('/defaults/');
}

export function resolveCarImageUri(imageUrl?: string | null): string | null {
  if (!imageUrl || imageUrl.trim() === '') {
    return null;
  }
  const trimmed = imageUrl.trim();
  if (!isRasterImagePath(trimmed)) {
    return null;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const uri = `${API_BASE_URL}${path}`;
  return uri.includes('?') ? uri : `${uri}?v=1`;
}

export function isVectorCarImage(uri: string): boolean {
  return uri.toLowerCase().includes('.svg');
}

/**
 * Ordered image URLs to try. Empty = show in-app text placeholder.
 * Does not guess /images/cars/{id}.jpg when API already sent an SVG default.
 */
export function getCarImageCandidates(
  car: Pick<Car, 'id' | 'type' | 'imageUrl'>,
): string[] {
  const fromApi = resolveCarImageUri(car.imageUrl);
  if (fromApi) {
    return [fromApi];
  }

  if (isSvgCarImageUrl(car.imageUrl)) {
    return [];
  }

  if (!car.imageUrl || car.imageUrl.trim() === '') {
    return UPLOAD_EXTENSIONS.map(
      ext => `${API_BASE_URL}/images/cars/${car.id}.${ext}`,
    );
  }

  const trimmed = car.imageUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return [trimmed];
  }
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return [`${API_BASE_URL}${path}`];
}

/** Primary image URL — prefers API raster `imageUrl`. */
export function getCarImageUrl(car: Pick<Car, 'id' | 'type' | 'imageUrl'>): string {
  return getCarImageCandidates(car)[0] ?? '';
}

/** @deprecated Use getCarImageCandidates — only extension guesses when API has no imageUrl. */
export function getCarImageFallbackUrls(
  car: Pick<Car, 'id' | 'type' | 'imageUrl'>,
): string[] {
  const candidates = getCarImageCandidates(car);
  if (candidates.length <= 1) {
    return [];
  }
  return candidates.slice(1);
}
