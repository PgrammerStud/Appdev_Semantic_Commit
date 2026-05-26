import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  SafeAreaView, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import {
  ArrowLeftIcon, PhoneIcon, MagnifyingGlassIcon,
  PencilSquareIcon, MapPinIcon, PaperAirplaneIcon,
  PhotoIcon, ClipboardDocumentListIcon, TruckIcon,
} from 'react-native-heroicons/outline';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Config from 'react-native-config';

// ── Types ─────────────────────────────────────────────────────
interface Message {
  id: string;
  text: string;
  sender: 'me' | 'customer';
  time: string;
  seen?: boolean;
}

interface CustomerDelivery {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  initials: string;
  preview: string;
  time: string;
  orderId: string;
  orderTotal: number;
  itemCount: number;
  unreadCount?: number;
  isOnline?: boolean;
  distance?: number; // in km
}

interface DeliveryOrder {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

// ── JWT helper ─────────────────────────────────────────────────
declare function atob(data: string): string;
const decodeJwtPayload = (token: string): any => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return JSON.parse(decodeURIComponent(escape(atob ? atob(padded) : require('base-64').decode(padded))));
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() > payload.exp * 1000;
};

// ── Status helpers ────────────────────────────────────────────
const statusColor = (status: string) => {
  switch (status) {
    case 'Out for delivery':
    case 'Processing':   return '#3498db';
    case 'Preparing':
    case 'Pending':      return '#f39c12';
    case 'Completed':
    case 'Delivered':    return '#2ecc71';
    case 'Cancelled':    return '#e74c3c';
    default:             return '#aaa';
  }
};

const statusBg = (status: string) => {
  switch (status) {
    case 'Out for delivery':
    case 'Processing':   return '#e8f4fd';
    case 'Preparing':
    case 'Pending':      return '#fef9e7';
    case 'Completed':
    case 'Delivered':    return '#eafaf1';
    case 'Cancelled':    return '#fdecea';
    default:             return '#f0f0f0';
  }
};

// ── Mock delivery orders ──────────────────────────────────────
const MOCK_DELIVERIES: CustomerDelivery[] = [
  {
    id: '1',
    customerId: 'cust_001',
    customerName: 'John Garcia',
    customerPhone: '+63 912 3456 789',
    customerAddress: '123 Main St, Quezon City',
    initials: 'JG',
    preview: "Order #ORD-2041 ready for delivery",
    time: '5m ago',
    orderId: '#ORD-2041',
    orderTotal: 1250.50,
    itemCount: 3,
    unreadCount: 1,
    isOnline: true,
    distance: 2.3,
  },
  {
    id: '2',
    customerId: 'cust_002',
    customerName: 'Maria Santos',
    customerPhone: '+63 923 4567 890',
    customerAddress: '456 Oak Ave, Makati',
    initials: 'MS',
    preview: "Order #ORD-2042 needs to be picked up",
    time: '15m ago',
    orderId: '#ORD-2042',
    orderTotal: 875.25,
    itemCount: 2,
    isOnline: false,
    distance: 5.8,
  },
  {
    id: '3',
    customerId: 'cust_003',
    customerName: 'Robert Reyes',
    customerPhone: '+63 934 5678 901',
    customerAddress: '789 Pine Rd, Cebu',
    initials: 'RR',
    preview: "Order #ORD-2040 delivered. Thank you!",
    time: 'Yesterday',
    orderId: '#ORD-2040',
    orderTotal: 2100.00,
    itemCount: 5,
    isOnline: false,
  },
];

const MOCK_MESSAGES: Message[] = [
  { id: '1', text: "Hi! Is my order on the way?", sender: 'customer', time: '2:10 PM' },
  { id: '2', text: "Yes! I'm picking it up now. Should be there in 15 mins", sender: 'me', time: '2:11 PM', seen: true },
  { id: '3', text: "Great! I'll be waiting at the gate", sender: 'customer', time: '2:12 PM' },
];

// ── Pending Deliveries Tab ────────────────────────────────────
const PendingDeliveriesTab: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const { jwtToken: token } = useSelector((state: any) => state.auth);

  const loadDeliveries = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      if (!token) {
        setError('Not logged in. Please restart the app.');
        return;
      }

      if (isTokenExpired(token)) {
        setError('Session expired. Please log out and log in again.');
        return;
      }

      // TODO: Replace with actual API call to fetch pending deliveries
      // const baseUrl = (Config.BACKEND_URL as string).replace('http://', 'https://');
      // const response = await axios.get(`${baseUrl}/api/pending-deliveries`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // setDeliveries(response.data);

      // Mock data for now
      setDeliveries([]);
    } catch (e: any) {
      console.log('[Deliveries] error:', e?.response?.status);
      setError('Failed to load deliveries. Tap to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadDeliveries(); }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading pending deliveries…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <TruckIcon size={48} color="#ddd" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadDeliveries()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (deliveries.length === 0) {
    return (
      <View style={styles.centered}>
        <TruckIcon size={56} color="#ddd" />
        <Text style={styles.emptyTitle}>No pending deliveries</Text>
        <Text style={styles.emptySubtitle}>All orders have been delivered!</Text>
      </View>
    );
  }

  const renderOrder = ({ item }: { item: DeliveryOrder }) => {
    const isOpen = expanded === item.id;
    const sc = statusColor(item.status);
    const sb = statusBg(item.status);

    return (
      <TouchableOpacity
        style={styles.deliveryCard}
        activeOpacity={0.8}
        onPress={() => setExpanded(isOpen ? null : item.id)}
      >
        <View style={styles.deliveryCardTop}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.customerName}>{item.customerName}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: sb }]}>
            <Text style={[styles.statusPillText, { color: sc }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.addressRow}>
          <MapPinIcon size={14} color="#999" />
          <Text style={styles.addressText} numberOfLines={1}>{item.customerAddress}</Text>
        </View>

        <View style={styles.deliveryTotal}>
          <Text style={styles.deliveryTotalLabel}>Total</Text>
          <Text style={styles.deliveryTotalAmount}>
            ₱{parseFloat(String(item.totalAmount)).toFixed(2)}
          </Text>
        </View>

        {isOpen && (
          <View style={styles.orderItems}>
            <View style={styles.orderItemsDivider} />
            {item.items?.map(oi => (
              <View key={oi.id} style={styles.orderItemRow}>
                <Text style={styles.orderItemName} numberOfLines={1}>{oi.productName}</Text>
                <Text style={styles.orderItemQty}>×{oi.quantity}</Text>
                <Text style={styles.orderItemPrice}>₱{parseFloat(String(oi.price)).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.expandHint}>{isOpen ? '▲ Hide details' : '▼ View details'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={deliveries}
      keyExtractor={item => item.id.toString()}
      renderItem={renderOrder}
      contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadDeliveries(true)} colors={['#3498db']} />
      }
    />
  );
};

// ── Customer list ─────────────────────────────────────────────
const CustomerList: React.FC<{
  tab: 'All' | 'Pending' | 'Delivered';
  onTabChange: (t: 'All' | 'Pending' | 'Delivered') => void;
  onOpen: (c: CustomerDelivery) => void;
}> = ({ tab, onTabChange, onOpen }) => {
  const [search, setSearch] = useState('');
  const pending = MOCK_DELIVERIES.filter(c => ['Out for delivery', 'Preparing'].includes(c.orderId.substring(0, 3)));
  const delivered = MOCK_DELIVERIES.filter(c => !['Out for delivery', 'Preparing'].includes(c.orderId.substring(0, 3)));

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Deliveries</Text>
            <View style={styles.badgeDot} />
          </View>
          <PencilSquareIcon size={22} color="#3498db" />
        </View>
        <View style={styles.searchBar}>
          <MagnifyingGlassIcon size={16} color="#999" />
          <TextInput
            placeholder="Search customers..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.tabs}>
        {(['All', 'Pending', 'Delivered'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => onTabChange(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'Pending' ? (
        <PendingDeliveriesTab />
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <Text style={styles.sectionLabel}>Pending deliveries</Text>
          {pending.length === 0 ? (
            <Text style={styles.emptySection}>No pending deliveries</Text>
          ) : (
            pending.map(c => <CustomerItem key={c.id} customer={c} onPress={() => onOpen(c)} />)
          )}
          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Delivered</Text>
          {delivered.length === 0 ? (
            <Text style={styles.emptySection}>No delivered orders</Text>
          ) : (
            delivered.map(c => <CustomerItem key={c.id} customer={c} onPress={() => onOpen(c)} />)
          )}
        </ScrollView>
      )}
    </>
  );
};

// ── Customer item row ─────────────────────────────────────────
const CustomerItem: React.FC<{ customer: CustomerDelivery; onPress: () => void }> = ({ customer, onPress }) => {
  return (
    <TouchableOpacity style={styles.customerItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, styles.avatarCustomer]}>
        <Text style={styles.avatarText}>{customer.initials}</Text>
        {customer.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.customerRow}>
          <Text style={styles.customerName}>{customer.customerName}</Text>
          <Text style={styles.convoTime}>{customer.time}</Text>
        </View>
        <Text style={styles.phoneText}>{customer.customerPhone}</Text>
        <Text style={styles.addressText} numberOfLines={1}>{customer.customerAddress}</Text>
        <View style={styles.orderInfoRow}>
          <Text style={{ fontSize: 11, color: '#3498db', fontWeight: '600' }}>
            {customer.orderId} · {customer.itemCount} items · ₱{customer.orderTotal.toFixed(2)}
          </Text>
          {customer.distance && (
            <Text style={{ fontSize: 10, color: '#999' }}>
              {customer.distance} km away
            </Text>
          )}
        </View>
      </View>
      {!!customer.unreadCount && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{customer.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ── Chat screen ───────────────────────────────────────────────
const ChatScreen: React.FC<{ customer: CustomerDelivery; onBack: () => void }> = ({ customer, onBack }) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now().toString(), text, sender: 'me', time }]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeftIcon size={22} color="#3498db" />
        </TouchableOpacity>
        <View style={[styles.avatar, styles.avatarCustomer, { width: 38, height: 38 }]}>
          <Text style={[styles.avatarText, { fontSize: 13 }]}>{customer.initials}</Text>
          {customer.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatName}>{customer.customerName}</Text>
          <Text style={styles.chatPhone}>{customer.customerPhone}</Text>
        </View>
        <PhoneIcon size={22} color="#3498db" />
      </View>

      <View style={styles.deliveryBanner}>
        <View style={styles.orderIcon}>
          <TruckIcon size={18} color="#3498db" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderLabel}>Order</Text>
          <Text style={styles.orderId}>{customer.orderId}</Text>
          <Text style={styles.deliveryAddress}>{customer.customerAddress}</Text>
        </View>
        <MapPinIcon size={20} color="#3498db" />
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        <View style={styles.systemMsg}>
          <Text style={styles.systemMsgText}>📦 Order assigned for delivery</Text>
        </View>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.bubbleRow, msg.sender === 'me' && { justifyContent: 'flex-end' }]}>
            {msg.sender === 'customer' && (
              <View style={styles.miniAvatar}>
                <Text style={styles.miniAvatarText}>{customer.initials}</Text>
              </View>
            )}
            <View style={{ maxWidth: '75%' }}>
              <View style={[styles.bubble, msg.sender === 'me' ? styles.bubbleMe : styles.bubbleThem]}>
                <Text style={[styles.bubbleText, msg.sender === 'me' && { color: '#fff' }]}>{msg.text}</Text>
              </View>
              <Text style={[styles.bubbleTime, msg.sender === 'me' && { textAlign: 'right' }]}>
                {msg.time}{msg.seen ? ' · Seen' : ''}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <PhotoIcon size={24} color="#999" />
        <TextInput
          style={styles.msgInput}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
          multiline
          returnKeyType="send"
          onSubmitEditing={send}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <PaperAirplaneIcon size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ── Main RiderMessagesScreen ──────────────────────────────────
const RiderMessageScreen: React.FC = () => {
  const [selected, setSelected] = useState<CustomerDelivery | null>(null);
  const [tab, setTab] = useState<'All' | 'Pending' | 'Delivered'>('All');

  if (selected) {
    return (
      <SafeAreaView style={styles.container}>
        <ChatScreen customer={selected} onBack={() => setSelected(null)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomerList tab={tab} onTabChange={setTab} onOpen={setSelected} />
    </SafeAreaView>
  );
};

export default RiderMessageScreen;

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#f5f5f5' },
  centered:             { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  loadingText:          { fontSize: 14, color: '#999', marginTop: 10 },
  errorText:            { fontSize: 14, color: '#e74c3c', marginTop: 10, textAlign: 'center' },
  emptyTitle:           { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 10 },
  emptySubtitle:        { fontSize: 12, color: '#999', marginTop: 5, textAlign: 'center' },
  emptySection:         { fontSize: 12, color: '#aaa', paddingHorizontal: 16, paddingVertical: 10, fontStyle: 'italic' },
  retryBtn:             { marginTop: 12, backgroundColor: '#3498db', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryBtnText:         { color: '#fff', fontSize: 13, fontWeight: '600' },

  header:               { backgroundColor: '#fff', paddingTop: 12, paddingBottom: 10, paddingHorizontal: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  headerTop:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headerTitle:          { fontSize: 20, fontWeight: '700', color: '#333' },
  badgeDot:             { width: 8, height: 8, backgroundColor: '#e74c3c', borderRadius: 4, marginLeft: 6 },
  searchBar:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 12, paddingHorizontal: 10, height: 40, gap: 8 },
  searchInput:          { flex: 1, fontSize: 13, color: '#333' },
  tabs:                 { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  tab:                  { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:            { borderBottomColor: '#3498db' },
  tabText:              { fontSize: 13, color: '#aaa' },
  tabTextActive:        { color: '#3498db', fontWeight: '600' },
  sectionLabel:         { fontSize: 11, color: '#aaa', paddingHorizontal: 16, paddingVertical: 6, textTransform: 'uppercase', letterSpacing: 0.5 },

  deliveryCard:         { backgroundColor: '#fff', marginHorizontal: 8, marginVertical: 4, borderRadius: 12, padding: 12, elevation: 1 },
  deliveryCardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  orderNumber:          { fontSize: 14, fontWeight: '600', color: '#333' },
  customerName:         { fontSize: 12, color: '#666', marginTop: 2 },
  statusPill:           { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
  statusPillText:       { fontSize: 11, fontWeight: '600' },
  addressRow:           { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  addressText:          { flex: 1, fontSize: 11, color: '#666' },
  deliveryTotal:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 0.5, borderTopColor: '#eee' },
  deliveryTotalLabel:   { fontSize: 11, color: '#999' },
  deliveryTotalAmount:  { fontSize: 13, fontWeight: '600', color: '#333' },
  orderItems:           { marginTop: 8 },
  orderItemsDivider:    { height: 0.5, backgroundColor: '#eee', marginBottom: 8 },
  orderItemRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  orderItemName:        { flex: 1, fontSize: 11, color: '#666' },
  orderItemQty:         { fontSize: 11, color: '#999', marginHorizontal: 8 },
  orderItemPrice:       { fontSize: 11, fontWeight: '600', color: '#333' },
  expandHint:           { fontSize: 10, color: '#3498db', textAlign: 'center', marginTop: 6, fontWeight: '500' },

  customerItem:         { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#fff', marginHorizontal: 8, marginVertical: 2, borderRadius: 10 },
  avatar:               { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  avatarCustomer:       { backgroundColor: '#f0e8ff' },
  avatarText:           { fontSize: 15, fontWeight: '600', color: '#9b59b6' },
  onlineDot:            { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, backgroundColor: '#2ecc71', borderRadius: 5.5, borderWidth: 2, borderColor: '#fff' },
  customerRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  phoneText:            { fontSize: 11, color: '#666', marginTop: 1 },
  orderInfoRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 },
  unreadBadge:          { width: 24, height: 24, borderRadius: 12, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center' },
  unreadBadgeText:      { color: '#fff', fontSize: 11, fontWeight: '600' },
  convoTime:            { fontSize: 11, color: '#aaa' },

  chatHeader:           { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  backBtn:              { padding: 8 },
  chatName:             { fontSize: 15, fontWeight: '600', color: '#333' },
  chatPhone:            { fontSize: 11, color: '#999', marginTop: 2 },

  deliveryBanner:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f4fd', marginHorizontal: 8, marginVertical: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, gap: 8 },
  orderIcon:            { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  orderLabel:           { fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 },
  orderId:              { fontSize: 12, fontWeight: '600', color: '#333' },
  deliveryAddress:      { fontSize: 10, color: '#666', marginTop: 1 },

  systemMsg:            { alignSelf: 'center', backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginVertical: 4 },
  systemMsgText:        { fontSize: 12, color: '#666', fontStyle: 'italic' },

  bubbleRow:            { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  miniAvatar:           { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0e8ff', justifyContent: 'center', alignItems: 'center' },
  miniAvatarText:       { fontSize: 11, fontWeight: '600', color: '#9b59b6' },
  bubble:               { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleThem:           { backgroundColor: '#f0f0f0' },
  bubbleMe:             { backgroundColor: '#3498db' },
  bubbleText:           { fontSize: 13, color: '#333' },
  bubbleTime:           { fontSize: 10, color: '#999', marginTop: 2 },

  inputBar:             { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', elevation: 2 },
  msgInput:             { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#333', maxHeight: 100 },
  sendBtn:              { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center' },
});
