import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { ROUTES } from '../utils';

import Home        from '../screens/HomeScreen';
import Profile     from '../screens/ProfileScreen';
import ProductList from '../screens/products/ProductList';
import ManageProducts from '../screens/admin/ManageProducts';
import ManageUsers    from '../screens/admin/ManageUsers';
import AllOrders      from '../screens/staff/AllOrders';

import { isAdmin, isStaff } from '../utils/permissions';

const Stack = createStackNavigator();

const MainNavigation: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const roles = user?.roles;

  return (
    <Stack.Navigator
      initialRouteName={ROUTES.HOME}
      screenOptions={{ headerShown: false }}
    >
      {/* ── Available to everyone ── */}
      <Stack.Screen name={ROUTES.HOME}    component={Home}        />
      <Stack.Screen name={ROUTES.PROFILE} component={Profile}     />
      <Stack.Screen name={ROUTES.PRODUCT} component={ProductList} />

      {/* ── Staff + Admin only ── */}
      <Stack.Screen
        name={ROUTES.ALL_ORDERS}
        component={AllOrders}
        options={{
          title: 'All Orders',
          // Prevent non-staff from seeing this in header/back
        }}
        listeners={!isStaff(roles) ? {
          focus: ({ navigation }: any) => navigation.goBack(),
        } : {}}
      />
      <Stack.Screen
        name={ROUTES.MANAGE_PRODUCTS}
        component={ManageProducts}
        options={{ title: 'Manage Products' }}
        listeners={!isStaff(roles) ? {
          focus: ({ navigation }: any) => navigation.goBack(),
        } : {}}
      />

      {/* ── Admin only ── */}
      <Stack.Screen
        name={ROUTES.MANAGE_USERS}
        component={ManageUsers}
        options={{ title: 'Manage Users' }}
        listeners={!isAdmin(roles) ? {
          focus: ({ navigation }: any) => navigation.goBack(),
        } : {}}
      />
    </Stack.Navigator>
  );
};

export default MainNavigation;