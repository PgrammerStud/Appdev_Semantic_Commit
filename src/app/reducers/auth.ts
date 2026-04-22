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
