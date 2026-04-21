export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST' as const;
export const USER_LOGIN_COMPLETE = 'USER_LOGIN_COMPLETE' as const;
export const USER_LOGIN_ERROR = 'USER_LOGIN_ERROR' as const;
export const RESET_USER_LOGIN = 'RESET_USER_LOGIN' as const;

export type AuthLoginPayload = {
  username: string;
  password: string;
};

export const authLogin = (payload: AuthLoginPayload) => ({
  type: USER_LOGIN,
  payload,
});

export const authLogout = () => ({
  type: RESET_USER_LOGIN,
});

