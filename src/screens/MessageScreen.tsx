declare function atob(data: string): string;
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  SafeAreaView, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import RiderMessageScreen from './RiderMessageScreen';
import AdminMessageScreen from './AdminMessageScreen';
import {
  ArrowLeftIcon, PhoneIcon, MagnifyingGlassIcon,
  PencilSquareIcon, MapPinIcon, PaperAirplaneIcon,
  PhotoIcon, ClipboardDocumentListIcon,
} from 'react-native-heroicons/outline';
import axios from 'axios';
import Config from 'react-native-config';

// ── Types ─────────────────────────────────────────────────────
interface Message {
  id: string;
  text: string;
  sender: 'me' | 'rider';
  time: string;
  seen?: boolean;
}

interface Conversation {
  id: string;
  riderName: string;
  initials: string;
  preview: string;
  time: string;
  orderId: string;
  orderStatus: 'Out for delivery' | 'Preparing' | 'Completed' | 'Confirmed';
  unreadCount?: number;
  isOnline?: boolean;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

// ── JWT helper (outside component, no library needed) ─────────
const decodeJwtPayload = (token: string): any => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    // works in React Native's Hermes/JSC engine
    return JSON.parse(decodeURIComponent(escape(atob ? atob(padded) : require('base-64').decode(padded))));
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  const expiredAt = new Date(payload.exp * 1000);
  console.log('[JWT] expires:', expiredAt.toLocaleString());
  console.log('[JWT] now:    ', new Date().toLocaleString());
  console.log('[JWT] expired?', Date.now() > payload.exp * 1000);
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

// ── Mock data ─────────────────────────────────────────────────
const CONVERSATIONS: Conversation[] = [
  { id: '1', riderName: 'Miguel Santos', initials: 'MS', preview: "I'm almost there, maybe 5 mins!", time: '2m ago', orderId: '#ORD-2041', orderStatus: 'Out for delivery', unreadCount: 2, isOnline: true },
  { id: '2', riderName: 'Carlo Reyes',   initials: 'CR', preview: 'Got it, picking up now 👍',       time: '18m ago', orderId: '#ORD-2039', orderStatus: 'Preparing' },
  { id: '3', riderName: 'Jay Mendoza',   initials: 'JM', preview: 'Your order has been delivered. Enjoy!', time: 'Yesterday', orderId: '#ORD-2035', orderStatus: 'Completed' },
];

const MOCK_MESSAGES: Message[] = [
  { id: '1', text: "Hi! I have your order. I'm on my way 🛵", sender: 'rider', time: '2:14 PM' },
  { id: '2', text: "Okay, thank you! I'll be at the front gate", sender: 'me', time: '2:15 PM', seen: true },
  { id: '3', text: "I'm almost there, maybe 5 mins!", sender: 'rider', time: '2:18 PM' },
];

// ── API call ──────────────────────────────────────────────────
const fetchOrdersFromApi = async (token: string): Promise<Order[]> => {
  // Force https regardless of Config
  const baseUrl = (Config.BACKEND_URL as string).replace('http://', 'https://');
  console.log('[Orders] using URL:', baseUrl);
  
  const response = await axios.get(`${baseUrl}/api/my-orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(response.data) ? response.data : [];
};

// ── Orders Tab ────────────────────────────────────────────────
const OrdersTab: React.FC = () => {
  const { user, jwtToken: token } = useSelector((state: any) => state.auth);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded]     = useState<number | null>(null);

  const loadOrders = async (isRefresh = false) => {
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

      const data = await fetchOrdersFromApi(token);
      setOrders(data);
    } catch (e: any) {
      console.log('[Orders] error:', e?.response?.status, JSON.stringify(e?.response?.data));
      setError('Failed to load orders. Tap to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading your orders…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ClipboardDocumentListIcon size={48} color="#ddd" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadOrders()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centered}>
        <ClipboardDocumentListIcon size={56} color="#ddd" />
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>Your orders will appear here once you place one.</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.userBanner}>
      <View style={styles.userBannerAvatar}>
        <Text style={styles.userBannerInitial}>
          {user?.name?.charAt(0).toUpperCase() ?? '?'}
        </Text>
      </View>
      <View>
        <Text style={styles.userBannerName}>{user?.name ?? 'User'}</Text>
        <Text style={styles.userBannerSub}>{orders.length} order{orders.length !== 1 ? 's' : ''} found</Text>
      </View>
    </View>
  );

  const renderOrder = ({ item }: { item: Order }) => {
    const isOpen = expanded === item.id;
    const sc = statusColor(item.status);
    const sb = statusBg(item.status);
    const date = new Date(item.createdAt).toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.8}
        onPress={() => setExpanded(isOpen ? null : item.id)}
      >
        <View style={styles.orderCardTop}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.orderDate}>{date}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: sb }]}>
            <Text style={[styles.statusPillText, { color: sc }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.orderTotal}>
          <Text style={styles.orderTotalLabel}>Total</Text>
          <Text style={styles.orderTotalAmount}>
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
      data={orders}
      keyExtractor={item => item.id.toString()}
      renderItem={renderOrder}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadOrders(true)} colors={['#3498db']} />
      }
    />
  );
};

// ── Conversation list ─────────────────────────────────────────
const ConversationList: React.FC<{
  tab: 'All' | 'Riders' | 'Orders';
  onTabChange: (t: 'All' | 'Riders' | 'Orders') => void;
  onOpen: (c: Conversation) => void;
}> = ({ tab, onTabChange, onOpen }) => {
  const [search, setSearch] = useState('');
  const active = CONVERSATIONS.filter(c => ['Out for delivery', 'Preparing'].includes(c.orderStatus));
  const recent = CONVERSATIONS.filter(c => !['Out for delivery', 'Preparing'].includes(c.orderStatus));

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Messages</Text>
            <View style={styles.badgeDot} />
          </View>
          <PencilSquareIcon size={22} color="#3498db" />
        </View>
        <View style={styles.searchBar}>
          <MagnifyingGlassIcon size={16} color="#999" />
          <TextInput
            placeholder="Search messages..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.tabs}>
        {(['All', 'Riders', 'Orders'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => onTabChange(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'Orders' ? (
        <OrdersTab />
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <Text style={styles.sectionLabel}>Active deliveries</Text>
          {active.map(c => <ConvoItem key={c.id} convo={c} onPress={() => onOpen(c)} />)}
          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Recent</Text>
          {recent.map(c => <ConvoItem key={c.id} convo={c} onPress={() => onOpen(c)} />)}
        </ScrollView>
      )}
    </>
  );
};

// ── Single conversation row ───────────────────────────────────
const ConvoItem: React.FC<{ convo: Conversation; onPress: () => void }> = ({ convo, onPress }) => {
  const isActive = ['Out for delivery', 'Preparing'].includes(convo.orderStatus);
  const sc = statusColor(convo.orderStatus);
  return (
    <TouchableOpacity style={styles.convoItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, styles.avatarRider, !isActive && { backgroundColor: '#f0f0f0' }]}>
        <Text style={[styles.avatarText, !isActive && { color: '#999' }]}>{convo.initials}</Text>
        {convo.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.convoRow}>
          <Text style={[styles.convoName, !isActive && { color: '#aaa' }]}>{convo.riderName}</Text>
          <Text style={styles.convoTime}>{convo.time}</Text>
        </View>
        <Text numberOfLines={1} style={[styles.convoPreview, !!convo.unreadCount && styles.convoPreviewUnread]}>
          {convo.preview}
        </Text>
        <Text style={{ fontSize: 10, color: sc, fontWeight: '600', marginTop: 2 }}>
          {convo.orderId} · {convo.orderStatus}
        </Text>
      </View>
      {!!convo.unreadCount && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{convo.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ── Chat screen ───────────────────────────────────────────────
const ChatScreen: React.FC<{ convo: Conversation; onBack: () => void }> = ({ convo, onBack }) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const sc = statusColor(convo.orderStatus);

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
        <View style={[styles.avatar, styles.avatarRider, { width: 38, height: 38 }]}>
          <Text style={[styles.avatarText, { fontSize: 13 }]}>{convo.initials}</Text>
          {convo.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatName}>{convo.riderName}</Text>
          {convo.isOnline && <Text style={styles.chatOnline}>● On the way · 0.8 km away</Text>}
        </View>
        <PhoneIcon size={22} color="#3498db" />
      </View>

      <View style={styles.orderBanner}>
        <View style={styles.orderIcon}>
          <ClipboardDocumentListIcon size={18} color="#3498db" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderLabel}>Order</Text>
          <Text style={styles.orderId}>{convo.orderId}</Text>
          <Text style={[styles.orderStatus, { color: sc }]}>{convo.orderStatus}</Text>
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
          <Text style={styles.systemMsgText}>🛵 {convo.riderName} has picked up your order</Text>
        </View>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.bubbleRow, msg.sender === 'me' && { justifyContent: 'flex-end' }]}>
            {msg.sender === 'rider' && (
              <View style={styles.miniAvatar}>
                <Text style={styles.miniAvatarText}>{convo.initials}</Text>
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

// ── Main MessagesScreen ───────────────────────────────────────
const MessagesScreen: React.FC = () => {
  const { role } = useSelector((state: any) => state.auth);

  // Route based on user role
  if (role === 'ROLE_STAFF') {
    return <RiderMessageScreen />;
  }

  if (role === 'ROLE_ADMIN') {
    return <AdminMessageScreen />;
  }

  // Default customer message view
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [tab, setTab] = useState<'All' | 'Riders' | 'Orders'>('All');

  if (selected) {
    return (
      <SafeAreaView style={styles.container}>
        <ChatScreen convo={selected} onBack={() => setSelected(null)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ConversationList tab={tab} onTabChange={setTab} onOpen={setSelected} />
    </SafeAreaView>
  );
};

export default MessagesScreen;

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#f5f5f5' },
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
  convoItem:            { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#fff', marginHorizontal: 8, marginVertical: 2, borderRadius: 10 },
  avatar:               { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  avatarRider:          { backgroundColor: '#e8f4fd' },
  avatarText:           { fontSize: 15, fontWeight: '600', color: '#3498db' },
  onlineDot:            { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, backgroundColor: '#2ecc71', borderRadius: 5.5, borderWidth: 2, borderColor: '#fff' },
  convoRow:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  convoName:            { fontSize: 14, fontWeight: '600', color: '#333' },
  convoTime:            { fontSize: 11, color: '#aaa' },
  convoPreview:         { fontSize: 12, color: '#aaa', marginTop: 2 },
  convoPreviewUnread:   { color: '#333', fontWeight: '500' },
  unreadBadge:          { backgroundColor: '#3498db', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  unreadBadgeText:      { color: '#fff', fontSize: 10, fontWeight: '700' },
  chatHeader:           { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  backBtn:              { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  chatName:             { fontSize: 14, fontWeight: '600', color: '#333' },
  chatOnline:           { fontSize: 11, color: '#2ecc71' },
  orderBanner:          { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 10, backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 0.5, borderColor: '#eee' },
  orderIcon:            { width: 36, height: 36, borderRadius: 8, backgroundColor: '#e8f4fd', justifyContent: 'center', alignItems: 'center' },
  orderLabel:           { fontSize: 10, color: '#aaa' },
  orderId:              { fontSize: 13, fontWeight: '600', color: '#333' },
  orderStatus:          { fontSize: 11, fontWeight: '500', marginTop: 1 },
  systemMsg:            { backgroundColor: '#fff8e1', borderRadius: 10, padding: 8, marginHorizontal: 20, alignItems: 'center', borderWidth: 0.5, borderColor: '#fde68a', marginBottom: 4 },
  systemMsgText:        { fontSize: 12, color: '#856404', textAlign: 'center' },
  bubbleRow:            { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 4 },
  miniAvatar:           { width: 26, height: 26, borderRadius: 13, backgroundColor: '#e8f4fd', justifyContent: 'center', alignItems: 'center' },
  miniAvatarText:       { fontSize: 9, fontWeight: '600', color: '#3498db' },
  bubble:               { borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9 },
  bubbleMe:             { backgroundColor: '#3498db', borderBottomRightRadius: 4 },
  bubbleThem:           { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 0.5, borderColor: '#eee' },
  bubbleText:           { fontSize: 13, color: '#333', lineHeight: 19 },
  bubbleTime:           { fontSize: 10, color: '#aaa', marginTop: 2, paddingHorizontal: 2 },
  inputBar:             { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: '#eee' },
  msgInput:             { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, fontSize: 13, color: '#333', maxHeight: 100 },
  sendBtn:              { width: 38, height: 38, borderRadius: 19, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center' },
  centered:             { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  loadingText:          { fontSize: 13, color: '#aaa', marginTop: 8 },
  errorText:            { fontSize: 13, color: '#e74c3c', textAlign: 'center' },
  retryBtn:             { backgroundColor: '#3498db', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  retryBtnText:         { color: '#fff', fontWeight: '600', fontSize: 13 },
  emptyTitle:           { fontSize: 16, fontWeight: '600', color: '#aaa' },
  emptySubtitle:        { fontSize: 13, color: '#bbb', textAlign: 'center' },
  userBanner:           { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: '#eee' },
  userBannerAvatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center' },
  userBannerInitial:    { color: '#fff', fontWeight: '700', fontSize: 18 },
  userBannerName:       { fontSize: 15, fontWeight: '600', color: '#333' },
  userBannerSub:        { fontSize: 12, color: '#aaa', marginTop: 1 },
  orderCard:            { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: '#eee' },
  orderCardTop:         { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  orderNumber:          { fontSize: 14, fontWeight: '700', color: '#333' },
  orderDate:            { fontSize: 11, color: '#aaa', marginTop: 2 },
  statusPill:           { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText:       { fontSize: 11, fontWeight: '700' },
  orderTotal:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotalLabel:      { fontSize: 12, color: '#aaa' },
  orderTotalAmount:     { fontSize: 16, fontWeight: '700', color: '#e74c3c' },
  orderItems:           { marginTop: 10 },
  orderItemsDivider:    { height: 0.5, backgroundColor: '#eee', marginBottom: 10 },
  orderItemRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  orderItemName:        { flex: 1, fontSize: 13, color: '#333' },
  orderItemQty:         { fontSize: 12, color: '#aaa', marginHorizontal: 8 },
  orderItemPrice:       { fontSize: 13, fontWeight: '600', color: '#333' },
  expandHint:           { fontSize: 11, color: '#3498db', textAlign: 'center', marginTop: 10 },
  });