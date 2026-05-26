import axios from 'axios';
import Config from 'react-native-config';

const api = axios.create({
  baseURL: Config.BACKEND_URL,
});
console.log('🌐 BACKEND_URL:', JSON.stringify(Config.BACKEND_URL));
console.log('🌐 ALL CONFIG:', JSON.stringify(Config)); 

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.response.use(
  response => response,
  error => {
    const status  = error.response?.status;
    const message = error.response?.data?.message
                 ?? error.response?.data?.detail
                 ?? error.message
                 ?? 'Unknown error';

    console.error(`🔴 API Error [${status}]:`, message);

    // Sentry.captureException(error); // uncomment if using Sentry

    // Auto-handle auth errors globally
    if (status === 401) {
      console.warn('🔐 Unauthorized — token may be expired');
      // dispatch(logout()); // if you have access to store
    }

    if (status === 403) {
      console.warn('🚫 Forbidden — insufficient permissions');
    }

    if (status >= 500) {
      console.error('🔥 Server error — backend may be down');
    }

    return Promise.reject(error);
  }
);



export const getProducts = async () => {
  try {
    const response = await api.get('/api/products');
    return response.data.member;
  } catch (error: any) {
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Body:', JSON.stringify(error.response?.data));
    throw error;
  }
};

export const addToCart = async (productId: number, quantity: number = 1) => {
  try {
    console.log('🔑 Auth header:', api.defaults.headers.common['Authorization']);
    const response = await api.post(
      `/api/add-to-cart/${productId}`,
      new URLSearchParams({ quantity: String(quantity) }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Failed to add to cart:', error);
    throw error;
  }
};

export const getCart = async () => {
  try {
    console.log('🔑 Auth header:', api.defaults.headers.common['Authorization']);
    const response = await api.get('/api/cart');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch cart:', error);
    throw error;
  }
};

export const removeFromCart = async (cartItemId: number) => {
  try {
    const response = await api.post(
      `/api/remove-from-cart/${cartItemId}`,
      {},
    );
    return response.data;
  } catch (error) {
    console.error('❌ Failed to remove from cart:', error);
    throw error;
  }
};

export const updateCartQuantity = async (cartItemId: number, quantity: number) => {
  try {
    const params = new URLSearchParams();
    params.append('quantity', String(quantity));
    
    const response = await api.post(
      `/api/cart/update/${cartItemId}`,
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Failed to update cart quantity:', error);
    throw error;
  }
};


export const clearCartOnServer = async () => {
  try {
    const response = await api.post('/api/cart/clear');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to clear cart on server:', error);
    throw error;
  }
};

// ── Staff + Admin ──────────────────────────────────────────────

export const upsertProduct = async (productData: {
  id?: number;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
}) => {
  try {
    const response = productData.id
      ? await api.put(`/api/products/${productData.id}`, productData)
      : await api.post('/api/products', productData);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to upsert product:', error.response?.status);
    console.error('❌ Body:', JSON.stringify(error.response?.data));
    throw error;
  }
};

export const deleteProduct = async (productId: number) => {
  try {
    const response = await api.delete(`/api/products/${productId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to delete product:', error.response?.status);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await api.get('/api/orders');
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch orders:', error.response?.status);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  try {
    const response = await api.post(
      `/api/orders/${orderId}/status`,
      { status },
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to update order status:', error.response?.status);
    throw error;
  }
};

// ── Admin only ─────────────────────────────────────────────────

export const getAllUsers = async () => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch users:', error.response?.status);
    console.error('❌ Body:', JSON.stringify(error.response?.data));
    throw error;
  }
};

export const assignRole = async (userId: string, role: string) => {
  try {
    const response = await api.post(`/api/users/${userId}/role`, { role });
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to assign role:', error.response?.status);
    console.error('❌ Body:', JSON.stringify(error.response?.data));
    throw error;
  }
};