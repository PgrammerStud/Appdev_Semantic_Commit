interface RouteNames {
  // Auth
  LOGIN:    string;
  REGISTER: string;

  // Main
  HOME:    string;
  PROFILE: string;
  PRODUCT: string;

  // Staff
  ALL_ORDERS: string;

  // Admin
  MANAGE_PRODUCTS: string;
  MANAGE_USERS:    string;
}

const ROUTES: RouteNames = {
  // Auth
  LOGIN:    'Login',
  REGISTER: 'Register',

  // Main
  HOME:    'Home',
  PROFILE: 'Profile',
  PRODUCT: 'Product',

  // Staff
  ALL_ORDERS: 'AllOrders',

  // Admin
  MANAGE_PRODUCTS: 'ManageProducts',
  MANAGE_USERS:    'ManageUsers',
};

export default ROUTES;