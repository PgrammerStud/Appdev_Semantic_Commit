import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, Modal,
  Alert, RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeftIcon, MagnifyingGlassIcon,
  UserIcon, ShieldCheckIcon,
} from 'react-native-heroicons/outline';
import { getAllUsers, assignRole, setAuthToken } from '../../services/productService';
import { Role } from '../../types/roles';

interface AppUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  photo?: string;
}

const ROLE_OPTIONS: { label: string; value: Role; color: string }[] = [
  { label: 'Customer', value: 'ROLE_CUSTOMER', color: '#3498db' },
  { label: 'Staff',    value: 'ROLE_STAFF',    color: '#f39c12' },
  { label: 'Admin',    value: 'ROLE_ADMIN',    color: '#8e44ad' },
];

const getRoleBadge = (roles: string[]) => {
  if (roles.includes('ROLE_ADMIN')) return { label: 'Admin',    color: '#8e44ad', bg: '#f3e5f5' };
  if (roles.includes('ROLE_STAFF')) return { label: 'Staff',    color: '#f39c12', bg: '#fff8e1' };
  return                                   { label: 'Customer', color: '#3498db', bg: '#e3f2fd' };
};

const ManageUsers: React.FC = () => {
  const navigation                        = useNavigation<any>();
  const { jwtToken: token }               = useSelector((state: any) => state.auth);
  const [users, setUsers]                 = useState<AppUser[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [roleModalUser, setRoleModalUser] = useState<AppUser | null>(null);
  const [assigning, setAssigning]         = useState(false);

  const fetchUsers = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      setAuthToken(token);
      const data = await getAllUsers();
      setUsers(data ?? []);
    } catch (err: any) {
      setError('Failed to load users');
      console.error('❌ ManageUsers fetch error:', err.response?.status, err.response?.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [token]);

  const handleAssignRole = async (user: AppUser, role: Role) => {
    if (user.roles.includes(role)) {
      setRoleModalUser(null);
      return;
    }
    Alert.alert(
      'Change Role',
      `Set ${user.name} as ${ROLE_OPTIONS.find(r => r.value === role)?.label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setAssigning(true);
              setAuthToken(token);
              await assignRole(user.id, role);
              setUsers(prev =>
                prev.map(u => u.id === user.id ? { ...u, roles: [role] } : u)
              );
              setRoleModalUser(null);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message ?? 'Failed to assign role.');
              console.error('❌ Assign role error:', err.response?.data);
            } finally {
              setAssigning(false);
            }
          },
        },
      ]
    );
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <ShieldCheckIcon size={22} color="#8e44ad" />
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', flex: 1 }}>
          Manage Users
        </Text>
        <Text style={{ fontSize: 13, color: '#aaa' }}>
          {filtered.length} users
        </Text>
      </View>

      {/* Search */}
      <View style={{
        margin: 12, flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 12,
        paddingHorizontal: 10, height: 42, elevation: 1,
      }}>
        <MagnifyingGlassIcon size={18} color="#999" />
        <TextInput
          placeholder="Search by name or email..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ flex: 1, marginLeft: 8, fontSize: 14, color: '#333' }}
        />
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#8e44ad" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchUsers()}
            style={{ padding: 10, backgroundColor: '#8e44ad', borderRadius: 8 }}
          >
            <Text style={{ color: '#fff' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(u) => u.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchUsers(true)} />
          }
          contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <UserIcon size={48} color="#ddd" />
              <Text style={{ color: '#aaa', marginTop: 12, fontSize: 15 }}>No users found</Text>
            </View>
          }
          renderItem={({ item }) => {
            const badge = getRoleBadge(item.roles);
            return (
              <View style={{
                backgroundColor: '#fff', borderRadius: 12,
                marginBottom: 10, padding: 14,
                flexDirection: 'row', alignItems: 'center',
                elevation: 2,
              }}>
                {/* Avatar */}
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: badge.bg,
                  justifyContent: 'center', alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: badge.color }}>
                    {item.name?.charAt(0).toUpperCase() ?? '?'}
                  </Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: '#333' }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#aaa' }} numberOfLines={1}>
                    {item.email}
                  </Text>
                  <View style={{
                    marginTop: 4, alignSelf: 'flex-start',
                    backgroundColor: badge.bg, borderRadius: 6,
                    paddingHorizontal: 8, paddingVertical: 2,
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: badge.color }}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Change role button */}
                <TouchableOpacity
                  onPress={() => setRoleModalUser(item)}
                  style={{
                    backgroundColor: '#f5f5f5', borderRadius: 8,
                    paddingHorizontal: 10, paddingVertical: 7,
                    borderWidth: 1, borderColor: '#eee',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#555' }}>
                    Change role
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* Role assignment modal */}
      <Modal
        visible={!!roleModalUser}
        transparent
        animationType="slide"
        onRequestClose={() => !assigning && setRoleModalUser(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={() => !assigning && setRoleModalUser(null)}
        >
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: '#fff',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 28,
          }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 4 }}>
              Assign role
            </Text>
            <Text style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              {roleModalUser?.name} · {roleModalUser?.email}
            </Text>

            {ROLE_OPTIONS.map(({ label, value, color }) => {
              const isCurrent = roleModalUser?.roles.includes(value);
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => roleModalUser && handleAssignRole(roleModalUser, value)}
                  disabled={assigning || isCurrent}
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    padding: 14, borderRadius: 12, marginBottom: 10,
                    backgroundColor: isCurrent ? color + '18' : '#f8f8f8',
                    borderWidth: isCurrent ? 2 : 1,
                    borderColor: isCurrent ? color : '#eee',
                  }}
                >
                  <Text style={{
                    fontSize: 15, fontWeight: '600',
                    color: isCurrent ? color : '#444',
                  }}>
                    {label}
                  </Text>
                  {isCurrent && (
                    <Text style={{ fontSize: 12, color, fontWeight: '600' }}>Current</Text>
                  )}
                  {assigning && !isCurrent && (
                    <ActivityIndicator size="small" color={color} />
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() => setRoleModalUser(null)}
              style={{ marginTop: 4, padding: 10, alignItems: 'center' }}
            >
              <Text style={{ color: '#aaa', fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

export default ManageUsers;