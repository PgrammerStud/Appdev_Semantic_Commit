import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, FlatList,
  TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ClipboardDocumentListIcon, ChevronLeftIcon } from 'react-native-heroicons/outline';
import { setAuthToken } from '../../services/productService';
import axios from 'axios';
import Config from 'react-native-config';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'PAID';

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING:    { bg: '#fff3cd', text: '#856404' },
  PROCESSING: { bg: '#cce5ff', text: '#004085' },
  SHIPPED:    { bg: '#d4edda', text: '#155724' },
  DELIVERED:  { bg: '#d1ecf1', text: '#0c5460' },
  CANCELLED:  { bg: '#f8d7da', text: '#721c24' },
  PAID:       { bg: '#d4edda', text: '#155724' },
};

const NEXT_STATUS: Partial<Record<string, string>> = {
  PENDING:    'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED:    'DELIVERED',
};

const statusFilters: (OrderStatus | 'ALL')[] = [
  'ALL', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED',
];

const AllOrders: React.FC = () => {
  const navigation                      = useNavigation<any>();
  const { jwtToken: token }             = useSelector((state: any) => state.auth);

  const [orders, setOrders]             = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [updatingId, setUpdatingId]     = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');

  const fetchOrders = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      const response = await axios.get(`${Config.BACKEND_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data?.['hydra:member']) {
        setOrders(data['hydra:member']);
      } else if (data?.member) {
        setOrders(data.member);
      } else {
        setOrders([]);
      }

    } catch (err: any) {
      setError('Failed to load orders');
      console.error('❌ Orders error:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async (order: Order) => {
    const normalizedStatus = order.status?.toUpperCase();
    const next = NEXT_STATUS[normalizedStatus];
    if (!next) return;

    Alert.alert(
      'Update Status',
      `Move order #${order.id} from ${normalizedStatus} → ${next}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setUpdatingId(order.id);
              await axios.post(
                `${Config.BACKEND_URL}/api/staff/orders/${order.id}/status`,
                { status: next },
                { headers: { Authorization: `Bearer ${token}` } },
              );
              setOrders(prev =>
                prev.map(o => o.id === order.id ? { ...o, status: next } : o)
              );
            } catch (err: any) {
              Alert.alert('Error', 'Failed to update order status.');
              console.error('❌ Status update error:', err.response?.data);
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(o => o.status?.toUpperCase() === filterStatus);

  const renderOrder = ({ item }: { item: Order }) => {
    const normalizedStatus = item.status?.toUpperCase();
    const colors = STATUS_COLORS[normalizedStatus] ?? { bg: '#f0f0f0', text: '#888' };
    const canMove = !!NEXT_STATUS[normalizedStatus];

    return (
      <View style={{
        backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 6,
        borderRadius: 12, padding: 14, elevation: 2,
      }}>
        {/* Order header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontWeight: '700', fontSize: 14, color: '#333' }}>
            Order #{item.id}
          </Text>
          <View style={{
            backgroundColor: colors.bg, borderRadius: 8,
            paddingHorizontal: 8, paddingVertical: 3,
          }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>
              {normalizedStatus}
            </Text>
          </View>
        </View>

        {/* Customer info */}
        <Text style={{ fontSize: 13, color: '#555', marginBottom: 2 }}>
          {item.customerName ?? 'N/A'}
        </Text>
        <Text style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
          {item.customerEmail ?? ''}
        </Text>

        {/* Items */}
        {item.items?.map(i => (
          <View key={i.id} style={{
            flexDirection: 'row', justifyContent: 'space-between',
            paddingVertical: 3, borderTopWidth: 1, borderTopColor: '#f0f0f0',
          }}>
            <Text style={{ fontSize: 12, color: '#555', flex: 1 }} numberOfLines={1}>
              {i.productName} × {i.quantity}
            </Text>
            <Text style={{ fontSize: 12, color: '#333', fontWeight: '600' }}>
              ₱{parseFloat(i.price).toFixed(2)}
            </Text>
          </View>
        ))}

        {/* Footer */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between',
          alignItems: 'center', marginTop: 10,
        }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#e74c3c' }}>
            Total: ₱{parseFloat(item.totalAmount).toFixed(2)}
          </Text>
          {canMove && (
            <TouchableOpacity
              onPress={() => handleUpdateStatus(item)}
              disabled={updatingId === item.id}
              style={{
                backgroundColor: updatingId === item.id ? '#aaa' : '#3498db',
                borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
              }}
            >
              {updatingId === item.id
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                    → {NEXT_STATUS[normalizedStatus]}
                  </Text>
              }
            </TouchableOpacity>
          )}
        </View>

        <Text style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-PH', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })
            : 'No date'
          }
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>

      {/* Header */}
      <View style={{
        backgroundColor: '#fff', paddingHorizontal: 16,
        paddingTop: 45, paddingBottom: 10,
        flexDirection: 'row', alignItems: 'center', gap: 10,
        elevation: 3,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color="#333" />
        </TouchableOpacity>
        <ClipboardDocumentListIcon size={22} color="#3498db" />
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', flex: 1 }}>
          All Orders
        </Text>
        <Text style={{ fontSize: 13, color: '#aaa' }}>
          {filteredOrders.length} orders
        </Text>
      </View>

      {/* Status filter chips */}
      <View style={{ paddingVertical: 10 }}>
        <FlatList
          data={statusFilters}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          keyExtractor={(s) => s}
          renderItem={({ item: s }) => {
            const active = filterStatus === s;
            const colors = s !== 'ALL' ? STATUS_COLORS[s] : null;
            return (
              <TouchableOpacity
                onPress={() => setFilterStatus(s)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
                  backgroundColor: active ? (colors?.bg ?? '#3498db') : '#fff',
                  borderWidth: 1,
                  borderColor: active ? (colors?.text ?? '#3498db') : '#ddd',
                }}
              >
                <Text style={{
                  fontSize: 12, fontWeight: '600',
                  color: active ? (colors?.text ?? '#fff') : '#888',
                }}>
                  {s}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchOrders()}
            style={{ padding: 10, backgroundColor: '#3498db', borderRadius: 8 }}
          >
            <Text style={{ color: '#fff' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(o) => o.id.toString()}
          renderItem={renderOrder}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(true)} />
          }
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 4 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <ClipboardDocumentListIcon size={48} color="#ddd" />
              <Text style={{ color: '#aaa', marginTop: 12, fontSize: 15 }}>
                No {filterStatus !== 'ALL' ? filterStatus.toLowerCase() : ''} orders found
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default AllOrders;