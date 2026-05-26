import type { HealthData } from '../api/health';
import {
  FETCH_HEALTH_COMPLETE,
  FETCH_HEALTH_ERROR,
  FETCH_HEALTH_REQUEST,
} from '../action';

export type HealthState = {
  data: HealthData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
};

const INITIAL_STATE: HealthState = {
  data: null,
  isLoading: false,
  isError: false,
  error: null,
};

export default function reducer(
  state: HealthState = INITIAL_STATE,
  action: any,
): HealthState {
  switch (action.type) {
    case FETCH_HEALTH_REQUEST:
      return {
        ...state,
        isLoading: true,
        isError: false,
        error: null,
      };

    case FETCH_HEALTH_COMPLETE:
      return {
        ...state,
        data: action.payload ?? null,
        isLoading: false,
        isError: false,
        error: null,
      };

    case FETCH_HEALTH_ERROR:
      return {
        ...state,
        data: null,
        isLoading: false,
        isError: true,
        error: action.error || 'Unable to reach Uto Mobility. Try again shortly.',
      };

    default:
      return state;
  }
}
