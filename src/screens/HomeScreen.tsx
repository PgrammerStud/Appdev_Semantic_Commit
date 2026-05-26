import React, { useState, useEffect } from 'react';
import {
  Image, Text, TouchableOpacity, View, FlatList,
  ActivityIndicator, Modal, SafeAreaView, TextInput,
  ToastAndroid, Platform, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { userLogout } from '../app/reducers/auth';
import { setCart, clearCart } from '../app/reducers/cart';
import {
  getProducts, getCart, addToCart, setAuthToken,
} from '../services/productService';
import Config from 'react-native-config';
import CartScreen from './CartScreen';
import { Product } from '../types/product';
import { canAccess, isStaff, isAdmin } from '../utils/permissions';
import ROUTES from '../utils/routes';
import { signOutUser } from '../services/authService'; 
import axios from 'axios';
// Replace your logo line with a local require:
const LOGO = require('../assets/images/logo1.png');

import {
  MagnifyingGlassIcon, BellIcon, HomeIcon,
  ShoppingCartIcon, ChatBubbleLeftIcon,
  ClipboardDocumentListIcon, PlusIcon,
  Cog6ToothIcon, UsersIcon, ShieldCheckIcon,
} from 'react-native-heroicons/outline';
import MessagesScreen from './MessageScreen';

// ── Tab type: staff/admin don't get cart ──────────────────────
type CustomerTab = 'home' | 'cart' | 'messages' | 'activity';
type StaffTab    = 'home' | 'messages' | 'activity';
type TabName     = CustomerTab | StaffTab;

const showToast = (message: string) => {
  if (Platform.OS === 'android') ToastAndroid.show(message, ToastAndroid.SHORT);
  else Alert.alert('', message);
};



const HomeScreen: React.FC = () => {
  const dispatch    = useDispatch();
  const navigation  = useNavigation<any>();

  // ── Auth state ───────────────────────────────────────────────
  const { user, jwtToken: token } = useSelector((state: any) => state.auth);
  const roles = user?.roles ?? [];

  // ── Derived role flags ───────────────────────────────────────
  const userIsStaff   = isStaff(roles);   // true for ROLE_STAFF and ROLE_ADMIN
  const userIsAdmin   = isAdmin(roles);   // true for ROLE_ADMIN only
  const userIsCustomer = !userIsStaff;    // pure customer

  // ── Local state ──────────────────────────────────────────────
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [activeTab, setActiveTab]       = useState<TabName>('home');
  const [addingId, setAddingId]         = useState<number | null>(null);

  // ── Cart count (customers only, but safe to compute always) ──
  const cartItems = useSelector((state: any) => {
    const items = state.cart?.items;
    return Array.isArray(items) ? items : [];
  });
  const cartCount = cartItems.reduce((sum: number, i: any) => sum + i.quantity, 0);

  // ── Logout ───────────────────────────────────────────────────
 const handleLogout = async () => {
  setProfileVisible(false);

  // ✅ Capture token BEFORE Redux clears it
  const tokenSnapshot = token;

  // ✅ Pass token directly — signOutUser handles the backend call
  await signOutUser(tokenSnapshot);

  // ✅ THEN clear Redux state
  dispatch(userLogout());
  dispatch(clearCart());
};

  // ── Fetch products ───────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthToken(token);
      const data = await getProducts();
      setProducts(data);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch cart (customers only) ──────────────────────────────
  const fetchCart = async () => {
    if (userIsStaff) return; // staff/admin have no cart
    try {
      setAuthToken(token);
      const cartData = await getCart();
      dispatch(setCart(Array.isArray(cartData) ? cartData : []));
    } catch (err) {
      console.warn('Failed to load cart from server', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  // ── Add to cart (customers only) ─────────────────────────────
  const handleAddToCart = async (product: Product) => {
    if (!userIsCustomer || addingId !== null) return;
    try {
      setAddingId(product.id);
      setAuthToken(token);
      await addToCart(product.id, 1);
      await fetchCart();
      showToast(`${product.name} added to cart!`);
    } catch {
      showToast('Failed to add to cart. Please try again.');
    } finally {
      setAddingId(null);
    }
  };

   // This will trigger ErrorBoundary

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Role-aware tab bar ────────────────────────────────────────
  // Customers: Home | Cart | Messages | Activity
  // Staff/Admin: Home | Messages | Activity
  const tabs = [
    { name: 'home' as TabName,     icon: HomeIcon,                  label: 'Home'     },
    ...(userIsCustomer
      ? [{ name: 'cart' as TabName, icon: ShoppingCartIcon, label: 'Cart' }]
      : []
    ),
    { name: 'messages' as TabName, icon: ChatBubbleLeftIcon,        label: 'Messages' },
    { name: 'activity' as TabName, icon: ClipboardDocumentListIcon, label: 'Activity' },
  ];

  // ── Role badge shown in header ────────────────────────────────
  const roleBadge = userIsAdmin
    ? { label: 'Admin',    color: '#8e44ad', bg: '#f3e5f5' }
    : userIsStaff
    ? { label: 'Staff',    color: '#f39c12', bg: '#fff8e1' }
    : null; // customers see no badge

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>

      {/* ── HEADER ── */}
      <View style={{
        backgroundColor: '#fff',
        paddingTop: 45, paddingBottom: 10,
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.06,
        shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
      }}>   

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10,

           paddingHorizontal: 16,  
         }}>

           <Image
            source={LOGO}
            style={{ width: 80, height: 36, marginLeft: -16 }}  
            resizeMode="contain"
          />

          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#f0f0f0', borderRadius: 12,
            paddingHorizontal: 10, height: 42,
          }}>
            <MagnifyingGlassIcon size={18} color="#999" />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1, marginLeft: 8, fontSize: 14, color: '#333' }}
            />
          </View>

          <TouchableOpacity style={{
            width: 42, height: 42, borderRadius: 21,
            backgroundColor: '#f0f0f0',
            justifyContent: 'center', alignItems: 'center',
          }}>
            <BellIcon size={20} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setProfileVisible(true)}>
            {user?.photo ? (
              <Image
                source={{ uri: user.photo }}
                style={{ width: 42, height: 42, borderRadius: 21 }}
              />
            ) : (
              <View style={{
                width: 42, height: 42, borderRadius: 21,
                backgroundColor: userIsAdmin ? '#8e44ad' : userIsStaff ? '#f39c12' : '#3498db',
                justifyContent: 'center', alignItems: 'center',
              }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                  {user?.name?.charAt(0).toUpperCase() ?? '?'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Role badge row — only visible to staff/admin */}
        {roleBadge && (
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            marginTop: 8, gap: 6,
          }}>
            <ShieldCheckIcon size={14} color={roleBadge.color} />
            <View style={{
              backgroundColor: roleBadge.bg, borderRadius: 6,
              paddingHorizontal: 8, paddingVertical: 2,
            }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: roleBadge.color }}>
                {roleBadge.label} view
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: '#aaa' }}>
              Managing as {user?.name ?? 'user'}
            </Text>
          </View>
        )}
      </View>

      {/* ── STAFF / ADMIN ACTION BAR ── */}
      {userIsStaff && (
        <View style={{
          flexDirection: 'row', gap: 8,
          paddingHorizontal: 12, paddingVertical: 10,
          backgroundColor: '#fff',
          borderBottomWidth: 1, borderBottomColor: '#eee',
        }}>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.ALL_ORDERS)}
            style={{
              flex: 1, flexDirection: 'row', alignItems: 'center',
              justifyContent: 'center', gap: 6,
              backgroundColor: '#3498db', borderRadius: 10, paddingVertical: 9,
            }}
          >
            <ClipboardDocumentListIcon size={16} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
              All Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.MANAGE_PRODUCTS)}
            style={{
              flex: 1, flexDirection: 'row', alignItems: 'center',
              justifyContent: 'center', gap: 6,
              backgroundColor: '#f39c12', borderRadius: 10, paddingVertical: 9,
            }}
          >
            <Cog6ToothIcon size={16} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
              Products
            </Text>
          </TouchableOpacity>

          {/* Admin-only: Manage Users */}
          {userIsAdmin && (
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.MANAGE_USERS)}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center',
                justifyContent: 'center', gap: 6,
                backgroundColor: '#8e44ad', borderRadius: 10, paddingVertical: 9,
              }}
            >
              <UsersIcon size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                Users
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── PROFILE MODAL ── */}
      <Modal
        visible={profileVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={() => setProfileVisible(false)}
        >
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: '#fff',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 28, alignItems: 'center',
          }}>
            {user?.photo ? (
              <Image
                source={{ uri: user.photo }}
                style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 12 }}
              />
            ) : (
              <View style={{
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: userIsAdmin ? '#8e44ad' : userIsStaff ? '#f39c12' : '#3498db',
                justifyContent: 'center', alignItems: 'center', marginBottom: 12,
              }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 32 }}>
                  {user?.name?.charAt(0).toUpperCase() ?? '?'}
                </Text>
              </View>
            )}

            {/* Role badge inside modal */}
            {roleBadge && (
              <View style={{
                backgroundColor: roleBadge.bg, borderRadius: 8,
                paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: roleBadge.color }}>
                  {roleBadge.label}
                </Text>
              </View>
            )}

            <Text style={{ fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 4 }}>
              {user?.name ?? 'User'}
            </Text>
            <Text style={{ fontSize: 14, color: '#888', marginBottom: 28 }}>
              {user?.email ?? ''}
            </Text>

            <TouchableOpacity
              onPress={handleLogout}
              style={{
                width: '100%', padding: 14,
                backgroundColor: '#e74c3c', borderRadius: 12, alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setProfileVisible(false)}
              style={{ marginTop: 12, padding: 10 }}
            >
              <Text style={{ color: '#aaa', fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── TAB CONTENT ── */}
      {activeTab === 'cart' && userIsCustomer ? (
        <CartScreen />
      ) : activeTab === 'messages' ? (        // ← ADD THIS
      <MessagesScreen />    
      ) : loading ? (
        <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
          <TouchableOpacity
            onPress={fetchProducts}
            style={{ padding: 10, backgroundColor: '#3498db', borderRadius: 8 }}
          >
            <Text style={{ color: '#fff' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View style={{
              flex: 1, margin: 6, backgroundColor: '#fff',
              borderRadius: 12, overflow: 'hidden', elevation: 3,
            }}>
              <Image
                source={{ uri: `${Config.BACKEND_URL}/image/${item.imageUrl}` }}
                style={{ width: '100%', height: 150 }}
                resizeMode="cover"
              />
              <View style={{ padding: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 11, color: '#aaa', marginTop: 2 }} numberOfLines={1}>
                  {item.description}
                </Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  justifyContent: 'space-between', marginTop: 6,
                }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#e74c3c' }}>
                    ₱{parseFloat(item.price).toFixed(2)}
                  </Text>

                  {/* ── ROLE-GATED ACTION BUTTON ── */}
                  {userIsCustomer ? (
                    // Customer: Add to cart
                    <TouchableOpacity
                      onPress={() => handleAddToCart(item)}
                      disabled={addingId === item.id}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        backgroundColor: addingId === item.id ? '#aaa' : '#3498db',
                        justifyContent: 'center', alignItems: 'center',
                      }}
                    >
                      {addingId === item.id
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <PlusIcon size={16} color="#fff" />
                      }
                    </TouchableOpacity>
                  ) : (
                    // Staff / Admin: Edit button
                    <TouchableOpacity
                      onPress={() => navigation.navigate(ROUTES.MANAGE_PRODUCTS, { productId: item.id })}
                      style={{
                        paddingHorizontal: 8, height: 28, borderRadius: 8,
                        backgroundColor: '#f39c12',
                        justifyContent: 'center', alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* ── BOTTOM NAV BAR ── */}
      <View style={{
        flexDirection: 'row', backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#eee',
        paddingBottom: 8, paddingTop: 8, elevation: 10,
        position: 'absolute', bottom: 0, left: 0, right: 0,
      }}>
        {tabs.map(({ name, icon: Icon, label }) => {
          const isActive = activeTab === name;
          return (
            <TouchableOpacity
              key={name}
              onPress={() => setActiveTab(name)}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}
            >
              <View style={{ position: 'relative' }}>
                <Icon size={24} color={isActive ? '#3498db' : '#bbb'} />
                {/* Cart badge — only renders if customer and has items */}
                {name === 'cart' && userIsCustomer && cartCount > 0 && (
                  <View style={{
                    position: 'absolute', top: -4, right: -6,
                    backgroundColor: '#e74c3c', borderRadius: 8,
                    minWidth: 16, height: 16,
                    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>
                      {cartCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{
                fontSize: 10, marginTop: 3,
                color: isActive ? '#3498db' : '#bbb',
                fontWeight: isActive ? '600' : '400',
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

    </SafeAreaView>
  );
};

export default HomeScreen;