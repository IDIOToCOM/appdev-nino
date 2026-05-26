import type { Car } from '../app/api/cars';

/** Minimum average star rating to count as “great reviews”. */
export const POPULAR_MIN_RATING = 4;

/** Must have at least this many renter reviews. */
export const POPULAR_MIN_REVIEW_COUNT = 1;

export function hasGreatReviews(car: Car): boolean {
  const count = car.reviewCount ?? 0;
  const rating = car.averageRating ?? 0;
  return count >= POPULAR_MIN_REVIEW_COUNT && rating >= POPULAR_MIN_RATING;
}

/** Fleet vehicles with great reviews, best rated first (client fallback). */
export function pickPopularCars(cars: Car[], limit = 8): Car[] {
  return [...cars]
    .filter(hasGreatReviews)
    .sort((a, b) => {
      const byRating = (b.averageRating ?? 0) - (a.averageRating ?? 0);
      if (byRating !== 0) {
        return byRating;
      }
      return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
    })
    .slice(0, limit);
}
