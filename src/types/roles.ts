export type Role = 'ROLE_CUSTOMER' | 'ROLE_STAFF' | 'ROLE_ADMIN';

export type Permission =
  | 'browseProducts'
  | 'manageCart'
  | 'placeOrders'
  | 'manageProducts'
  | 'viewAllOrders'
  | 'updateOrderStatus'
  | 'manageUsers'
  | 'assignRoles';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ROLE_CUSTOMER: [
    'browseProducts',
    'manageCart',
    'placeOrders',
  ],
  ROLE_STAFF: [
    'browseProducts',
    'manageCart',
    'placeOrders',
    'manageProducts',
    'viewAllOrders',
    'updateOrderStatus',
  ],
  ROLE_ADMIN: [
    'browseProducts',
    'manageCart',
    'placeOrders',
    'manageProducts',
    'viewAllOrders',
    'updateOrderStatus',
    'manageUsers',
    'assignRoles',
  ],
};