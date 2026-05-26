import { apiFetch } from './client';

export type ReviewSummary = {
  reviewCount: number;
  averageRating: number | null;
};

export type CarReview = {
  id?: number;
  rating: number;
  comment?: string | null;
  authorDisplayName?: string;
  createdAt?: string;
};

export type CarReviewsData = {
  summary: ReviewSummary;
  reviews: CarReview[];
  userReview?: CarReview | null;
  canSubmitReview: boolean;
};

function isNotFound(message: string): boolean {
  return message.includes('404') || message.toLowerCase().includes('not found');
}

export async function fetchCarReviews(
  token: string | null,
  carId: number,
): Promise<CarReviewsData | null> {
  try {
    return await apiFetch<CarReviewsData>(`/cars/${carId}/reviews`, {
      auth: !!token,
      token,
    });
  } catch (error: any) {
    if (isNotFound(error?.message || '')) {
      return null;
    }
    throw error;
  }
}

export async function submitCarReview(
  token: string,
  carId: number,
  body: { rating: number; comment?: string },
): Promise<void> {
  await apiFetch(`/cars/${carId}/reviews`, {
    method: 'POST',
    auth: true,
    token,
    body,
  });
}
