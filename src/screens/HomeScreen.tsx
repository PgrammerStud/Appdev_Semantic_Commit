import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View, FlatList, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { IMG, ROUTES } from '../utils';
import { userLogout } from '../app/reducers/auth';

import CustomProductCard from '../components/CustomProductCard';

interface Product {
  id: string;
  title: string;
  price: number;
}

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = () => {
    dispatch(userLogout());
  };

  // Dynamic Data sa mga Product
  const [products] = useState<Product[]>([
    {
      id: '1',
      title: 'Laptop',
      price: 35000,
    },
    {
      id: '2',
      title: 'Phone',
      price: 15000,
    },
    {
      id: '3',
      title: 'Headphones',
      price: 2000,
    },
    {
      id: '4',
      title: 'Keyboard',
      price: 1200,
    },
  ]);

  return (
    <View style={{ flex: 1 }}>

      {/* TOP SECTION */}
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 40,
        }}
      >
        <Image
          source={{ uri: IMG.LOGO }}
          style={{ width: 150, height: 150 }}
        />

        <Text style={{ marginVertical: 10 }}>HomeScreen</Text>

        {/* <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.PROFILE)}
        >
          <View
            style={{
              padding: 10,
              backgroundColor: 'green',
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: 'white' }}>
              GO TO PROFILE
            </Text>
          </View>
        </TouchableOpacity> */}

        <TouchableOpacity onPress={handleLogout}>
          <View
            style={{
              padding: 10,
              backgroundColor: 'red',
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: 'white' }}>  
              LOGOUT
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 🛍️ PRODUCT LIST  */}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => (
          <CustomProductCard
            title={item.title}
            price={item.price}
            onPress={() => Alert.alert(item.title)}
          />
        )}
      />

    </View>
  );
};

export default HomeScreen;
