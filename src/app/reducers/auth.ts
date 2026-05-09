import {
  USER_LOGIN,
  USER_LOGIN_COMPLETED,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  USER_LOGIN_RESET,
  USER_REGISTER,
  USER_REGISTER_COMPLETED,
  USER_REGISTER_ERROR,
  USER_REGISTER_REQUEST,
  USER_REGISTER_RESET,
  USER_LOGOUT,
  GOOGLE_LOGIN,
  GOOGLE_LOGIN_COMPLETED,
  GOOGLE_LOGIN_ERROR,
} from '../action';

export interface AuthAction {
  type: string;
  payload?: any;
}

export interface AuthState {
  data: any;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isLoggedIn: boolean;
  isRegistered: boolean;
  jwtToken?: string;             // ✅ renamed
  user?: {
    id: string;                  // ✅ backend field
    email: string;
    name?: string;               // ✅ backend field
    roles?: string[];            // ✅ backend field
    photo?: string;              // ✅ backend field
  };
}

const INITIAL_STATE: AuthState = {
  data: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
  isLoggedIn: false,
  isRegistered: false,
};

export default function reducer(state = INITIAL_STATE, action: AuthAction): AuthState {
  console.log(action.type);
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return {
        ...state,
        data: null,
        isLoading: true,
        isError: false,
        errorMessage: null,
      };

    case USER_LOGIN_COMPLETED:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isError: false,
        isLoggedIn: true,
        errorMessage: null,
      };

    case USER_LOGIN_ERROR:
      return {
        ...state,
        data: null,
        isLoading: false,
        isError: true,
        isLoggedIn: false,
        errorMessage: action.payload,
      };

    case USER_LOGIN_RESET:
      return INITIAL_STATE;

    case USER_REGISTER_REQUEST:
      return {
        ...state,
        data: null,
        isLoading: true,
        isError: false,
        errorMessage: null,
      };

    case USER_REGISTER_COMPLETED:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isError: false,
        isRegistered: true,
        errorMessage: null,
      };

    case USER_REGISTER_ERROR:
      return {
        ...state,
        data: null,
        isLoading: false,
        isError: true,
        isRegistered: false,
        errorMessage: action.payload,
      };

    case USER_REGISTER_RESET:
      return INITIAL_STATE;

    case USER_LOGOUT:
      return INITIAL_STATE;

    case GOOGLE_LOGIN:
      return {
        ...state,
        isLoading: true,
        isError: false,
        errorMessage: null,
      };

    case GOOGLE_LOGIN_COMPLETED:
  return {
    ...state,
    data: action.payload,
    isLoading: false,
    isError: false,
    isLoggedIn: true,
    errorMessage: null,
    jwtToken: action.payload.jwtToken,            // ✅
    user: action.payload.user,
  };

    case GOOGLE_LOGIN_ERROR:
  return {
    ...state,
    data: null,
    isLoading: false,
    isError: true,
    isLoggedIn: false,
    errorMessage: action.payload,
    jwtToken: undefined,        // ✅
    user: undefined,
  };

    default:
      return state;
  }
}

export const userLogin = (payload: any) => ({
  type: USER_LOGIN,
  payload,
});

export const userRegister = (payload: any) => ({
  type: USER_REGISTER,
  payload,
});

export const resetLogin = () => ({
  type: USER_LOGIN_RESET,
});

export const resetRegister = () => ({
  type: USER_REGISTER_RESET,
});

export const userLogout = () => ({
  type: USER_LOGOUT,
});

export const googleLogin = (payload: any) => ({
  type: GOOGLE_LOGIN,
  payload,
});

export const googleLoginCompleted = (payload: any) => ({
  type: GOOGLE_LOGIN_COMPLETED,
  payload,
});

export const googleLoginError = (error: string) => ({
  type: GOOGLE_LOGIN_ERROR,
  payload: error,
});
