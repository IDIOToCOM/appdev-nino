import type { CarReviewsData } from '../api/reviews';
import {
  FETCH_CAR_REVIEWS_COMPLETE,
  FETCH_CAR_REVIEWS_ERROR,
  FETCH_CAR_REVIEWS_REQUEST,
  SUBMIT_CAR_REVIEW_COMPLETE,
  SUBMIT_CAR_REVIEW_ERROR,
  SUBMIT_CAR_REVIEW_REQUEST,
  CLEAR_CAR_REVIEWS,
} from '../action';

export type ReviewsState = {
  data: CarReviewsData | null;
  apiAvailable: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
};

const INITIAL: ReviewsState = {
  data: null,
  apiAvailable: true,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export default function reducer(
  state: ReviewsState = INITIAL,
  action: any,
): ReviewsState {
  switch (action.type) {
    case FETCH_CAR_REVIEWS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case FETCH_CAR_REVIEWS_COMPLETE:
      return {
        ...state,
        data: action.payload,
        apiAvailable: action.payload !== null,
        isLoading: false,
        error: null,
      };

    case FETCH_CAR_REVIEWS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };

    case SUBMIT_CAR_REVIEW_REQUEST:
      return { ...state, isSubmitting: true, error: null };

    case SUBMIT_CAR_REVIEW_COMPLETE:
      return {
        ...state,
        isSubmitting: false,
        data: action.payload,
        error: null,
      };

    case SUBMIT_CAR_REVIEW_ERROR:
      return {
        ...state,
        isSubmitting: false,
        error: action.error,
      };

    case CLEAR_CAR_REVIEWS:
      return INITIAL;

    default:
      return state;
  }
}
