import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, Modal,
  Alert, Image, RefreshControl, ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeftIcon, PlusIcon, PencilIcon,
  TrashIcon, MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import { getProducts, upsertProduct, setAuthToken } from '../../services/productService';
import { Product } from '../../types/product';
import Config from 'react-native-config';
import axios from 'axios';

const EMPTY_FORM = { name: '', description: '', price: '', imageUrl: '' };

const ManageProducts: React.FC = () => {
  const navigation                      = useNavigation<any>();
  const { jwtToken: token }             = useSelector((state: any) => state.auth);
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [deletingId, setDeletingId]     = useState<number | null>(null);
  const [editTarget, setEditTarget]     = useState<Product | null>(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]     = useState<Partial<typeof EMPTY_FORM>>({});

  const fetchProducts = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      setAuthToken(token);
      const data = await getProducts();
      setProducts(data);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalVisible(true);
  };

  const openEdit = (product: Product) => {
    setEditTarget(product);
    setForm({
      name:        product.name,
      description: product.description,
      price:       product.price,
      imageUrl:    product.imageUrl ?? '',
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const validate = (): boolean => {
    const errors: Partial<typeof EMPTY_FORM> = {};
    if (!form.name.trim())        errors.name        = 'Name is required';
    if (!form.description.trim()) errors.description = 'Description is required';
    if (!form.price.trim() || isNaN(Number(form.price))) {
      errors.price = 'Enter a valid price';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      setAuthToken(token);
      await upsertProduct({
        ...(editTarget ? { id: editTarget.id } : {}),
        name:        form.name.trim(),
        description: form.description.trim(),
        price:       form.price.trim(),
        imageUrl:    form.imageUrl.trim() || undefined,
      });
      setModalVisible(false);
      await fetchProducts();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(product.id);
              await axios.delete(`${Config.BACKEND_URL}/api/products/${product.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setProducts(prev => prev.filter(p => p.id !== product.id));
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete product.');
              console.error('❌ Delete error:', err.response?.data);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const Field = ({
    label, field, placeholder, keyboardType = 'default', multiline = false,
  }: {
    label: string;
    field: keyof typeof EMPTY_FORM;
    placeholder: string;
    keyboardType?: any;
    multiline?: boolean;
  }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4 }}>
        {label}
      </Text>
      <TextInput
        value={form[field]}
        onChangeText={v => {
          setForm(prev => ({ ...prev, [field]: v }));
          if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        style={{
          borderWidth: 1,
          borderColor: formErrors[field] ? '#e74c3c' : '#ddd',
          borderRadius: 10, paddingHorizontal: 12,
          paddingVertical: multiline ? 10 : 0,
          height: multiline ? 80 : 44,
          fontSize: 14, color: '#333',
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {formErrors[field] && (
        <Text style={{ fontSize: 11, color: '#e74c3c', marginTop: 3 }}>
          {formErrors[field]}
        </Text>
      )}
    </View>
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
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', flex: 1 }}>
          Manage Products
        </Text>
        <TouchableOpacity
          onPress={openCreate}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            backgroundColor: '#3498db', borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 7,
          }}
        >
          <PlusIcon size={16} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={{
        margin: 12, flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 12,
        paddingHorizontal: 10, height: 42, elevation: 1,
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

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchProducts()}
            style={{ padding: 10, backgroundColor: '#3498db', borderRadius: 8 }}
          >
            <Text style={{ color: '#fff' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchProducts(true)} />
          }
          contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ color: '#aaa', fontSize: 15 }}>No products found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={{
              backgroundColor: '#fff', borderRadius: 12,
              marginBottom: 10, flexDirection: 'row',
              overflow: 'hidden', elevation: 2,
            }}>
              <Image
                source={{ uri: `${Config.BACKEND_URL}/image/${item.imageUrl}` }}
                style={{ width: 80, height: 80 }}
                resizeMode="cover"
              />
              <View style={{ flex: 1, padding: 10, justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700', fontSize: 13, color: '#333' }} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 11, color: '#aaa' }} numberOfLines={1}>
                  {item.description}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#e74c3c' }}>
                  ₱{parseFloat(item.price).toFixed(2)}
                </Text>
              </View>
              <View style={{ justifyContent: 'center', gap: 8, paddingRight: 12 }}>
                <TouchableOpacity
                  onPress={() => openEdit(item)}
                  style={{
                    backgroundColor: '#f39c12', borderRadius: 8,
                    padding: 7, alignItems: 'center',
                  }}
                >
                  <PencilIcon size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  style={{
                    backgroundColor: deletingId === item.id ? '#aaa' : '#e74c3c',
                    borderRadius: 8, padding: 7, alignItems: 'center',
                  }}
                >
                  {deletingId === item.id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <TrashIcon size={16} color="#fff" />
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => !saving && setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 24, maxHeight: '90%',
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 20 }}>
              {editTarget ? 'Edit Product' : 'New Product'}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Field label="Product name"  field="name"        placeholder="e.g. Wireless Headphones" />
              <Field label="Description"   field="description" placeholder="Brief product description" multiline />
              <Field label="Price (₱)"     field="price"       placeholder="0.00" keyboardType="decimal-pad" />
              <Field label="Image URL"     field="imageUrl"    placeholder="filename.jpg (optional)" />
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => !saving && setModalVisible(false)}
                style={{
                  flex: 1, padding: 14, borderRadius: 12,
                  borderWidth: 1, borderColor: '#ddd', alignItems: 'center',
                }}
              >
                <Text style={{ color: '#666', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={{
                  flex: 1, padding: 14, borderRadius: 12,
                  backgroundColor: saving ? '#aaa' : '#3498db', alignItems: 'center',
                }}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={{ color: '#fff', fontWeight: '600' }}>
                      {editTarget ? 'Save Changes' : 'Create Product'}
                    </Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default ManageProducts;