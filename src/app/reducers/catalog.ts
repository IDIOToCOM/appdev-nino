import { REHYDRATE } from 'redux-persist';
import { CLEAR_CATALOG_RENTAL_WINDOW, SET_CATALOG_RENTAL_WINDOW } from '../action';
import { suggestedRentalDates } from '../../utils/bookingDates';
import { normalizeRentalSchedule } from '../../utils/rentalSchedule';

export type RentalWindow = {
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
};

export type CatalogState = {
  rentalWindow: RentalWindow | null;
};

const defaults = suggestedRentalDates();

const INITIAL: CatalogState = {
  rentalWindow: normalizeRentalSchedule({
    pickupDate: defaults.pickupDate,
    returnDate: defaults.returnDate,
    pickupTime: '9:00 AM',
    returnTime: '5:00 PM',
  }),
};

export default function reducer(
  state: CatalogState = INITIAL,
  action: any,
): CatalogState {
  switch (action.type) {
    case SET_CATALOG_RENTAL_WINDOW: {
      const prev =
        state.rentalWindow ??
        ({
          ...suggestedRentalDates(),
          pickupTime: '9:00 AM',
          returnTime: '5:00 PM',
        } as RentalWindow);
      return {
        ...state,
        rentalWindow: normalizeRentalSchedule({ ...prev, ...action.payload }),
      };
    }

    case CLEAR_CATALOG_RENTAL_WINDOW:
      return { ...state, rentalWindow: null };

    case REHYDRATE: {
      const incoming = action.payload?.catalog?.rentalWindow as RentalWindow | null;
      if (incoming) {
        return {
          ...state,
          rentalWindow: normalizeRentalSchedule(incoming),
        };
      }
      return state;
    }

    default:
      return state;
  }
}
