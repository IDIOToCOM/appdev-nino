import type { Car } from '../api/cars';
import {
  CLEAR_CAR_DETAIL,
  FETCH_CAR_COMPLETE,
  FETCH_CAR_ERROR,
  FETCH_CAR_REQUEST,
  FETCH_CARS_COMPLETE,
  FETCH_CARS_ERROR,
  FETCH_CARS_REQUEST,
} from '../action';

export type CarsState = {
  list: Car[];
  popular: Car[];
  selected: Car | null;
  isLoadingList: boolean;
  isLoadingDetail: boolean;
  isError: boolean;
  error: string | null;
};

const INITIAL_STATE: CarsState = {
  list: [],
  popular: [],
  selected: null,
  isLoadingList: false,
  isLoadingDetail: false,
  isError: false,
  error: null,
};

export default function reducer(
  state: CarsState = INITIAL_STATE,
  action: any,
): CarsState {
  switch (action.type) {
    case FETCH_CARS_REQUEST:
      return {
        ...state,
        isLoadingList: true,
        isError: false,
        error: null,
      };

    case FETCH_CARS_COMPLETE: {
      const payload = action.payload;
      const list = Array.isArray(payload) ? payload : (payload?.cars ?? []);
      const popular = Array.isArray(payload)
        ? []
        : (payload?.popularCars ?? []);

      return {
        ...state,
        list,
        popular,
        isLoadingList: false,
        isError: false,
        error: null,
      };
    }

    case FETCH_CARS_ERROR:
      return {
        ...state,
        isLoadingList: false,
        isError: true,
        error: action.error || 'Failed to load vehicles',
      };

    case FETCH_CAR_REQUEST:
      return {
        ...state,
        isLoadingDetail: true,
        isError: false,
        error: null,
      };

    case FETCH_CAR_COMPLETE:
      return {
        ...state,
        selected: action.payload ?? null,
        isLoadingDetail: false,
        isError: false,
        error: null,
      };

    case FETCH_CAR_ERROR:
      return {
        ...state,
        isLoadingDetail: false,
        isError: true,
        error: action.error || 'Failed to load vehicle',
      };

    case CLEAR_CAR_DETAIL:
      return {
        ...state,
        selected: null,
        isLoadingDetail: false,
        isError: false,
        error: null,
      };

    default:
      return state;
  }
}
