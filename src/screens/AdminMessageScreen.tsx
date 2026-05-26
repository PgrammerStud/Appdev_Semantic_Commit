import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  SafeAreaView, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import {
  ArrowLeftIcon, PhoneIcon, MagnifyingGlassIcon,
  PencilSquareIcon, PaperAirplaneIcon,
  PhotoIcon, ShieldCheckIcon,
} from 'react-native-heroicons/outline';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Config from 'react-native-config';

// ── Types ─────────────────────────────────────────────────────
interface Message {
  id: string;
  text: string;
  sender: 'me' | 'user';
  time: string;
  seen?: boolean;
}

interface AdminConversation {
  id: string;
  userId: string;
  userName: string;
  userRole: 'ROLE_CUSTOMER' | 'ROLE_STAFF' | 'ROLE_ADMIN';
  userPhone?: string;
  initials: string;
  preview: string;
  time: string;
  unreadCount?: number;
  isOnline?: boolean;
  lastMessageTime: string;
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

// ── Role helpers ──────────────────────────────────────────────
const getRoleColor = (role: string) => {
  switch (role) {
    case 'ROLE_ADMIN':    return '#e74c3c';
    case 'ROLE_STAFF':    return '#f39c12';
    case 'ROLE_CUSTOMER': return '#3498db';
    default:              return '#aaa';
  }
};

const getRoleBg = (role: string) => {
  switch (role) {
    case 'ROLE_ADMIN':    return '#fadbd8';
    case 'ROLE_STAFF':    return '#fef9e7';
    case 'ROLE_CUSTOMER': return '#e8f4fd';
    default:              return '#f0f0f0';
  }
};

// ── Mock conversations ────────────────────────────────────────
const MOCK_CONVERSATIONS: AdminConversation[] = [
  {
    id: '1',
    userId: 'admin_001',
    userName: 'Sarah Admin',
    userRole: 'ROLE_ADMIN',
    userPhone: '+63 912 3456 789',
    initials: 'SA',
    preview: "All systems operational. Ready to assist.",
    time: '5m ago',
    unreadCount: 1,
    isOnline: true,
    lastMessageTime: '2:14 PM',
  },
  {
    id: '2',
    userId: 'staff_001',
    userName: 'Miguel Santos',
    userRole: 'ROLE_STAFF',
    userPhone: '+63 923 4567 890',
    initials: 'MS',
    preview: "Just delivered order #ORD-2041. Customer satisfied.",
    time: '15m ago',
    isOnline: true,
    lastMessageTime: '1:45 PM',
  },
  {
    id: '3',
    userId: 'cust_001',
    userName: 'John Garcia',
    userRole: 'ROLE_CUSTOMER',
    userPhone: '+63 934 5678 901',
    initials: 'JG',
    preview: "Where is my order? It's been 30 mins!",
    time: '2h ago',
    unreadCount: 2,
    isOnline: false,
    lastMessageTime: '10:30 AM',
  },
];

const MOCK_MESSAGES: Message[] = [
  { id: '1', text: "Hi! I need assistance with my order", sender: 'user', time: '2:10 PM' },
  { id: '2', text: "Of course! What's the order number?", sender: 'me', time: '2:11 PM', seen: true },
  { id: '3', text: "#ORD-2039. It was supposed to arrive 30 mins ago", sender: 'user', time: '2:12 PM' },
  { id: '4', text: "Let me check that for you. One moment...", sender: 'me', time: '2:13 PM', seen: true },
];

// ── Conversations Tab ─────────────────────────────────────────
const ConversationsList: React.FC<{
  filter: 'All' | 'Customers' | 'Staff' | 'Admin';
  onFilterChange: (f: 'All' | 'Customers' | 'Staff' | 'Admin') => void;
  onOpen: (c: AdminConversation) => void;
}> = ({ filter, onFilterChange, onOpen }) => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { jwtToken: token } = useSelector((state: any) => state.auth);

  const filtered = MOCK_CONVERSATIONS.filter(c => {
    let roleMatch = true;
    if (filter === 'Customers') roleMatch = c.userRole === 'ROLE_CUSTOMER';
    else if (filter === 'Staff') roleMatch = c.userRole === 'ROLE_STAFF';
    else if (filter === 'Admin') roleMatch = c.userRole === 'ROLE_ADMIN';

    return roleMatch && c.userName.toLowerCase().includes(search.toLowerCase());
  });

  const loadConversations = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      if (!token || isTokenExpired(token)) {
        console.log('[Admin Messages] Session expired');
        return;
      }

      // TODO: Replace with actual API call to fetch conversations
      // const baseUrl = (Config.BACKEND_URL as string).replace('http://', 'https://');
      // const response = await axios.get(`${baseUrl}/api/admin/conversations`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
    } catch (e: any) {
      console.log('[Admin Messages] error:', e?.response?.status);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadConversations(); }, []);

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ShieldCheckIcon size={22} color="#e74c3c" />
            <Text style={styles.headerTitle}>Admin Messages</Text>
          </View>
          <PencilSquareIcon size={22} color="#e74c3c" />
        </View>
        <View style={styles.searchBar}>
          <MagnifyingGlassIcon size={16} color="#999" />
          <TextInput
            placeholder="Search users..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.tabs}>
        {(['All', 'Customers', 'Staff', 'Admin'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.tab, filter === f && styles.tabActive]}
            onPress={() => onFilterChange(f)}
          >
            <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ConvoItem convo={item} onPress={() => onOpen(item)} />}
        contentContainerStyle={{ paddingVertical: 4 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadConversations(true)} colors={['#e74c3c']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations found</Text>
          </View>
        }
      />
    </>
  );
};

// ── Conversation item ─────────────────────────────────────────
const ConvoItem: React.FC<{ convo: AdminConversation; onPress: () => void }> = ({ convo, onPress }) => {
  const roleColor = getRoleColor(convo.userRole);
  const roleBg = getRoleBg(convo.userRole);

  return (
    <TouchableOpacity style={styles.convoItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: roleBg }]}>
        <Text style={[styles.avatarText, { color: roleColor }]}>{convo.initials}</Text>
        {convo.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.convoRow}>
          <Text style={styles.convoName}>{convo.userName}</Text>
          <Text style={styles.convoTime}>{convo.time}</Text>
        </View>
        <View style={styles.roleTagRow}>
          <View style={[styles.roleTag, { backgroundColor: roleBg }]}>
            <Text style={[styles.roleTagText, { color: roleColor }]}>
              {convo.userRole.replace('ROLE_', '')}
            </Text>
          </View>
          <Text numberOfLines={1} style={[styles.convoPreview, !!convo.unreadCount && styles.convoPreviewUnread]}>
            {convo.preview}
          </Text>
        </View>
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
const ChatScreen: React.FC<{ convo: AdminConversation; onBack: () => void }> = ({ convo, onBack }) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const roleColor = getRoleColor(convo.userRole);
  const roleBg = getRoleBg(convo.userRole);

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
          <ArrowLeftIcon size={22} color="#e74c3c" />
        </TouchableOpacity>
        <View style={[styles.avatar, { backgroundColor: roleBg, width: 38, height: 38 }]}>
          <Text style={[styles.avatarText, { fontSize: 13, color: roleColor }]}>{convo.initials}</Text>
          {convo.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatName}>{convo.userName}</Text>
          <View style={[styles.roleTag, { backgroundColor: roleBg, alignSelf: 'flex-start' }]}>
            <Text style={[styles.roleTagText, { color: roleColor }]}>
              {convo.userRole.replace('ROLE_', '')}
            </Text>
          </View>
        </View>
        <PhoneIcon size={22} color="#e74c3c" />
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        <View style={styles.systemMsg}>
          <Text style={styles.systemMsgText}>🔒 Admin conversation started</Text>
        </View>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.bubbleRow, msg.sender === 'me' && { justifyContent: 'flex-end' }]}>
            {msg.sender === 'user' && (
              <View style={[styles.miniAvatar, { backgroundColor: roleBg }]}>
                <Text style={[styles.miniAvatarText, { color: roleColor }]}>{convo.initials}</Text>
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
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: '#e74c3c' }]} onPress={send}>
          <PaperAirplaneIcon size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ── Main AdminMessageScreen ───────────────────────────────────
const AdminMessageScreen: React.FC = () => {
  const [selected, setSelected] = useState<AdminConversation | null>(null);
  const [filter, setFilter] = useState<'All' | 'Customers' | 'Staff' | 'Admin'>('All');

  if (selected) {
    return (
      <SafeAreaView style={styles.container}>
        <ChatScreen convo={selected} onBack={() => setSelected(null)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ConversationsList filter={filter} onFilterChange={setFilter} onOpen={setSelected} />
    </SafeAreaView>
  );
};

export default AdminMessageScreen;

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#f5f5f5' },
  emptyContainer:       { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText:            { fontSize: 14, color: '#999' },

  header:               { backgroundColor: '#fff', paddingTop: 12, paddingBottom: 10, paddingHorizontal: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  headerTop:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headerTitle:          { fontSize: 18, fontWeight: '700', color: '#333', marginLeft: 8 },
  searchBar:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 12, paddingHorizontal: 10, height: 40, gap: 8 },
  searchInput:          { flex: 1, fontSize: 13, color: '#333' },
  tabs:                 { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  tab:                  { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:            { borderBottomColor: '#e74c3c' },
  tabText:              { fontSize: 12, color: '#aaa' },
  tabTextActive:        { color: '#e74c3c', fontWeight: '600' },

  convoItem:            { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#fff', marginHorizontal: 8, marginVertical: 2, borderRadius: 10 },
  avatar:               { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  avatarText:           { fontSize: 15, fontWeight: '600' },
  onlineDot:            { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, backgroundColor: '#2ecc71', borderRadius: 5.5, borderWidth: 2, borderColor: '#fff' },
  convoRow:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  convoName:            { fontSize: 14, fontWeight: '600', color: '#333' },
  convoTime:            { fontSize: 11, color: '#aaa' },
  roleTagRow:           { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  roleTag:              { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roleTagText:          { fontSize: 10, fontWeight: '600' },
  convoPreview:         { fontSize: 12, color: '#aaa', flex: 1 },
  convoPreviewUnread:   { color: '#333', fontWeight: '600' },
  unreadBadge:          { width: 24, height: 24, borderRadius: 12, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center' },
  unreadBadgeText:      { color: '#fff', fontSize: 11, fontWeight: '600' },

  chatHeader:           { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  backBtn:              { padding: 8 },
  chatName:             { fontSize: 15, fontWeight: '600', color: '#333' },

  systemMsg:            { alignSelf: 'center', backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginVertical: 4 },
  systemMsgText:        { fontSize: 12, color: '#666', fontStyle: 'italic' },

  bubbleRow:            { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  miniAvatar:           { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  miniAvatarText:       { fontSize: 11, fontWeight: '600' },
  bubble:               { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleThem:           { backgroundColor: '#f0f0f0' },
  bubbleMe:             { backgroundColor: '#e74c3c' },
  bubbleText:           { fontSize: 13, color: '#333' },
  bubbleTime:           { fontSize: 10, color: '#999', marginTop: 2 },

  inputBar:             { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', elevation: 2 },
  msgInput:             { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#333', maxHeight: 100 },
  sendBtn:              { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
});
