/** Half-star display — matches CarReviewSummary::getStarRatingDisplay(). */
export function starRatingDisplay(average: number | null | undefined): number | null {
  if (average == null || Number.isNaN(average)) {
    return null;
  }
  return Math.round(average * 2) / 2;
}

export function starsText(rating: number, max = 5): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = max - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}
