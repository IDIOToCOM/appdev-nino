import type { Car } from './cars';
import { apiFetch } from './client';

export type FavoritesToggleResult = {
  favorited: boolean;
  favoriteIds: number[];
};

/** Favorites are optional — missing route or network issues must not break login. */
function isOptionalFavoritesFailure(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('404') ||
    m.includes('unable to connect') ||
    m.includes('request failed') ||
    m.includes('route missing') ||
    m.includes('not available on this server')
  );
}

export async function fetchFavoriteCars(token: string): Promise<Car[] | null> {
  try {
    const data = await apiFetch<{ cars: Car[] }>('/favorites', {
      auth: true,
      token,
    });
    return data.cars ?? [];
  } catch {
    return null;
  }
}

export async function toggleFavorite(
  token: string,
  carId: number,
): Promise<FavoritesToggleResult | null> {
  try {
    return await apiFetch<FavoritesToggleResult>(`/favorites/${carId}/toggle`, {
      method: 'POST',
      auth: true,
      token,
    });
  } catch {
    return null;
  }
}
