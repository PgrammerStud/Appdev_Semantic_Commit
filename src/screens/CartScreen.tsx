import React, { useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  Alert, Platform, ToastAndroid, Modal,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Config from 'react-native-config';
import { TrashIcon, MinusIcon, PlusIcon } from 'react-native-heroicons/outline';
import { updateQuantity, setCart, clearCart } from '../app/reducers/cart';
import { setAuthToken, removeFromCart, updateCartQuantity, getCart, clearCartOnServer} from '../services/productService';
import { useStripe } from '@stripe/stripe-react-native';
import { createPaymentIntent, confirmPayment } from '../services/stripeService';
import axios from 'axios';
import { sendNotificationToTopic } from '../services/notificationService';




interface CartItem {
  id: number;
  productId: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  quantity: number;
}

const showToast = (msg: string) => {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert('', msg);
};

const CartScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'cod' | 'stripe' | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<number | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const items: CartItem[] = useSelector((state: any) => {
    const cartItems = state.cart?.items;
    return Array.isArray(cartItems) ? cartItems : [];
  });
  const { jwtToken: token } = useSelector((state: any) => state.auth);

  const totalPrice = items.reduce(
    (sum, i) => sum + parseFloat(i.price) * i.quantity, 0
  );

  const fetchCart = async () => {
    try {
      setAuthToken(token);
      const cartData = await getCart();
      const items = Array.isArray(cartData) ? cartData : [];
      dispatch(setCart(items));
    } catch (err) {
      console.warn('Failed to refresh cart', err);
    }
  };

  const handleRemove = (item: CartItem) => {
    Alert.alert('Remove item', `Remove "${item.name}" from your cart?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await removeFromCart(item.id);
            await fetchCart();
            showToast(`${item.name} removed.`);
          } catch {
            showToast('Failed to remove item.');
          }
        },
      },
    ]);
  };

 const handleQuantityChange = async (item: CartItem, delta: number) => {
  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    handleRemove(item);
    return;
  }
  const key = `${item.id}-${delta > 0 ? 'plus' : 'minus'}`;
  try {
    setUpdatingKey(key);
    setAuthToken(token);
    console.log('🔢 updating cartItem id:', item.id, 'newQty:', newQty);
    await updateCartQuantity(item.id, newQty);
    await fetchCart();

    setFlashId(item.id);
    setTimeout(() => setFlashId(null), 800);

    showToast(`Quantity updated to ${newQty}`);
  } catch {
    showToast('Failed to update quantity.');
  } finally {
    setUpdatingKey(null);
  }
};

const handlePlaceOrder = async (): Promise<void> => {
  if (!selectedPayment) {
    showToast('Please select a payment method.');
    return;
  }

  try {
    setOrdering(true);
    setAuthToken(token);

    const orderResponse = await axios.post<{ 
      orderId: number; orderNumber: string; total: number 
    }>(
      `${Config.BACKEND_URL}/api/order/create`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const orderId: number = orderResponse.data.orderId;
    const orderNumber: string = orderResponse.data.orderNumber;

    if (selectedPayment === 'cod') {
      await confirmPayment(orderId, 'cod', token);
      await sendNotificationToTopic(
        'staff',
        '🛍️ New Order Received',
        `Order #${orderNumber} · ₱${totalPrice.toFixed(2)} · COD`,
        token,
        { orderId: String(orderId), screen: 'AllOrders' }
      );
      await clearCartOnServer();
      setCheckoutVisible(false);
      dispatch(clearCart());
      showToast('COD order placed! Pay on delivery.');

    } else if (selectedPayment === 'stripe') {
      // ✅ Don't call setOrdering again inside handleStripePayment
      const clientSecret = await createPaymentIntent(totalPrice, token);

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Web Bakery',
        style: 'automatic',
      });

      if (initError) {
        showToast(`Setup failed: ${initError.message}`);
        return;
      }

      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code === 'Canceled') showToast('Payment cancelled.');
        else showToast(`Payment failed: ${paymentError.message}`);
        return;
      }

      // ✅ Correct way to extract paymentIntentId
      const paymentIntentId = clientSecret.split('_secret_')[0];

      await confirmPayment(orderId, 'stripe', token, paymentIntentId);

      await sendNotificationToTopic(
        'staff',
        '🛍️ New Order Received',
        `Order #${orderNumber} · ₱${totalPrice.toFixed(2)} · Stripe`,
        token,
        { orderId: String(orderId), screen: 'AllOrders' }
      );
      await sendNotificationToTopic(
        'customer_self',
        '✅ Payment Confirmed!',
        `Your order #${orderNumber} was paid. We're preparing it now!`,
        token,
        { orderId: String(orderId), screen: 'Activity' }
      );
      await clearCartOnServer();
      setCheckoutVisible(false);
      dispatch(clearCart());
      showToast('Payment successful! Order placed.');
    }

  } catch (err: any) {
    console.error('❌ Order error:', err?.response?.status, err?.response?.data);
    showToast(err?.response?.data?.message || err?.message || 'Failed to place order.');
  } finally {
    setOrdering(false); // ✅ only one place that sets ordering false
  }
};


  const renderItem = ({ item }: { item: CartItem }) => (
  <View style={{
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  }}>
    {/* Product Image */}
    <Image
      source={{ uri: `${Config.BACKEND_URL}/image/${item.imageUrl}` }}
      style={{ width: 72, height: 72, borderRadius: 10 }}
      resizeMode="cover"
    />

    {/* Product Details */}
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#e74c3c', marginTop: 4 }}>
        ₱{parseFloat(item.price).toFixed(2)}
      </Text>

      {/* Quantity Controls */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
        {/* Minus button */}
        {/* Minus button */}
<TouchableOpacity
  onPress={() => handleQuantityChange(item, -1)}
  disabled={updatingKey === `${item.id}-minus`}
  style={{
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: updatingKey === `${item.id}-minus` ? '#ddd' : '#f0f0f0',
    justifyContent: 'center', alignItems: 'center',
  }}
>
  {updatingKey === `${item.id}-minus` ? (
    <ActivityIndicator size="small" color="#555" />
  ) : (
    <MinusIcon size={14} color="#555" />
  )}
</TouchableOpacity>


        {/* Quantity badge — flashes green when updated */}
        <View style={{
          minWidth: 28, height: 28, borderRadius: 8,
          backgroundColor: flashId === item.id ? '#2ecc71' : '#f0f0f0',
          justifyContent: 'center', alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{
            fontSize: 14, fontWeight: '700',
            color: flashId === item.id ? '#fff' : '#333',
            textAlign: 'center',
          }}>
            {item.quantity}
          </Text>
        </View>

        {/* Plus button */}
<TouchableOpacity
  onPress={() => handleQuantityChange(item, +1)}
  disabled={updatingKey === `${item.id}-plus`}
  style={{
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: updatingKey === `${item.id}-plus` ? '#aaa' : '#3498db',
    justifyContent: 'center', alignItems: 'center',
  }}
>
  {updatingKey === `${item.id}-plus` ? (
    <ActivityIndicator size="small" color="#fff" />
  ) : (
    <PlusIcon size={14} color="#fff" />
  )}
</TouchableOpacity>
      </View>
    </View>

    {/* Right side: subtotal + delete */}
    <View style={{ alignItems: 'flex-end', marginLeft: 10, gap: 12 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#333' }}>
        ₱{(parseFloat(item.price) * item.quantity).toFixed(2)}
      </Text>
      <TouchableOpacity
        onPress={() => handleRemove(item)}
        style={{
          width: 32, height: 32, borderRadius: 8,
          backgroundColor: '#fff0f0',
          justifyContent: 'center', alignItems: 'center',
        }}
      >
        <TrashIcon size={16} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  </View>
);

  return (
  <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>

    {/* Header */}
    <View style={{
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 14,
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#333' }}>My Cart</Text>
      <Text style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
        {`${items.length} ${items.length === 1 ? 'item' : 'items'}`}
      </Text>
    </View>

    {/* Empty state */}
    {items.length === 0 ? (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ fontSize: 48 }}>🛒</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#333' }}>Your cart is empty</Text>
        <Text style={{ fontSize: 14, color: '#999' }}>Add some products to get started!</Text>
      </View>
    ) : (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 80 }}
        ListFooterComponent={
          <View style={{
            backgroundColor: '#fff',
            borderTopWidth: 1, borderTopColor: '#eee',
            padding: 16,
            marginTop: 8,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ fontSize: 15, color: '#888' }}>Total</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#333' }}>
                ₱{totalPrice.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setSelectedPayment(null);
                setCheckoutVisible(true);
              }}
              style={{ backgroundColor: '#3498db', borderRadius: 14, padding: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        }
      />
    )}

    {/* ── PAYMENT METHOD MODAL ── */}
    <Modal
      visible={checkoutVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setCheckoutVisible(false)}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => setCheckoutVisible(false)}
        />
        <View style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: 24,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 6 }}>
            Payment Method
          </Text>
          <Text style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>
            Select how you want to pay
          </Text>

          {/* COD Option */}
          <TouchableOpacity
            onPress={() => setSelectedPayment('cod')}
            style={{
              flexDirection: 'row', alignItems: 'center',
              borderWidth: 2,
              borderColor: selectedPayment === 'cod' ? '#3498db' : '#eee',
              borderRadius: 14, padding: 16, marginBottom: 12,
              backgroundColor: selectedPayment === 'cod' ? '#f0f8ff' : '#fff',
            }}
          >
            <Text style={{ fontSize: 28, marginRight: 14 }}>💵</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#333' }}>Cash on Delivery</Text>
              <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Pay when your order arrives</Text>
            </View>
            <View style={{
              width: 22, height: 22, borderRadius: 11,
              borderWidth: 2,
              borderColor: selectedPayment === 'cod' ? '#3498db' : '#ccc',
              justifyContent: 'center', alignItems: 'center',
            }}>
              {selectedPayment === 'cod' && (
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#3498db' }} />
              )}
            </View>
          </TouchableOpacity>

          {/* Stripe Option */}
          <TouchableOpacity
            onPress={() => setSelectedPayment('stripe')}
            style={{
              flexDirection: 'row', alignItems: 'center',
              borderWidth: 2,
              borderColor: selectedPayment === 'stripe' ? '#3498db' : '#eee',
              borderRadius: 14, padding: 16, marginBottom: 24,
              backgroundColor: selectedPayment === 'stripe' ? '#f0f8ff' : '#fff',
            }}
          >
            <Text style={{ fontSize: 28, marginRight: 14 }}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#333' }}>Stripe</Text>
              <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Pay securely with card</Text>
            </View>
            <View style={{
              width: 22, height: 22, borderRadius: 11,
              borderWidth: 2,
              borderColor: selectedPayment === 'stripe' ? '#3498db' : '#ccc',
              justifyContent: 'center', alignItems: 'center',
            }}>
              {selectedPayment === 'stripe' && (
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#3498db' }} />
              )}
            </View>
          </TouchableOpacity>

          {/* Order summary */}
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between',
            marginBottom: 16, paddingTop: 16,
            borderTopWidth: 1, borderTopColor: '#eee',
          }}>
            <Text style={{ fontSize: 14, color: '#888' }}>
              {`${items.length} ${items.length === 1 ? 'item' : 'items'} · Total`}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#333' }}>
              ₱{totalPrice.toFixed(2)}
            </Text>
          </View>

          {/* Place Order button */}
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={!selectedPayment || ordering}
            style={{
              backgroundColor: !selectedPayment || ordering ? '#aaa' : '#2ecc71',
              borderRadius: 14, padding: 16, alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
              {ordering ? 'Placing Order...' : 'Place Order'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCheckoutVisible(false)}
            style={{ marginTop: 12, padding: 10, alignItems: 'center' }}
          >
            <Text style={{ color: '#aaa', fontSize: 14 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

  </View>
);
};

export default CartScreen;