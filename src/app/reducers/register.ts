import {
  USER_REGISTER_COMPLETE,
  USER_REGISTER_ERROR,
  USER_REGISTER_REQUEST,
} from '../action';

export type RegisterState = {
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isSuccess: boolean;
};

const INITIAL_STATE: RegisterState = {
  isLoading: false,
  isError: false,
  error: null,
  isSuccess: false,
};

export default function reducer(
  state: RegisterState = INITIAL_STATE,
  action: any,
): RegisterState {
  switch (action.type) {
    case USER_REGISTER_REQUEST:
      return {
        ...state,
        isLoading: true,
        isError: false,
        error: null,
        isSuccess: false,
      };

    case USER_REGISTER_COMPLETE:
      return {
        ...state,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
      };

    case USER_REGISTER_ERROR:
      return {
        ...state,
        isLoading: false,
        isError: true,
        error: action.error || 'Registration failed',
        isSuccess: false,
      };

    default:
      return state;
  }
}
