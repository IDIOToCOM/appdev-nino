import type { Car } from '../api/cars';
import { SET_FAVORITES, SET_FAVORITE_IDS, TOGGLE_FAVORITE } from '../action';

export type CustomerPrefsState = {
  favoriteIds: number[];
  favoriteCars: Car[];
};

const INITIAL: CustomerPrefsState = {
  favoriteIds: [],
  favoriteCars: [],
};

function normalize(state: CustomerPrefsState): CustomerPrefsState {
  const favoriteIds = [...new Set(state?.favoriteIds ?? [])];
  const idSet = new Set(favoriteIds);
  const favoriteCars = (state?.favoriteCars ?? []).filter(c => idSet.has(c.id));
  return { favoriteIds, favoriteCars };
}

export default function reducer(
  state: CustomerPrefsState = INITIAL,
  action: any,
): CustomerPrefsState {
  state = normalize(state);

  switch (action.type) {
    case TOGGLE_FAVORITE: {
      const carId = action.payload.carId as number;
      const car = action.payload.car as Car | undefined;
      const has = state.favoriteIds.includes(carId);
      if (has) {
        return {
          ...state,
          favoriteIds: state.favoriteIds.filter(id => id !== carId),
          favoriteCars: state.favoriteCars.filter(c => c.id !== carId),
        };
      }
      const favoriteCars = car
        ? [...state.favoriteCars.filter(c => c.id !== carId), car]
        : state.favoriteCars;
      return {
        ...state,
        favoriteIds: [...state.favoriteIds, carId],
        favoriteCars,
      };
    }

    case SET_FAVORITES: {
      const payload = action.payload as {
        favoriteIds?: number[];
        favoriteCars?: Car[];
      };
      return {
        favoriteIds: payload.favoriteIds ?? [],
        favoriteCars: payload.favoriteCars ?? [],
      };
    }

    case SET_FAVORITE_IDS: {
      const favoriteIds = action.payload ?? [];
      const idSet = new Set(favoriteIds);
      return {
        ...state,
        favoriteIds,
        favoriteCars: state.favoriteCars.filter(c => idSet.has(c.id)),
      };
    }

    default:
      return state;
  }
}
