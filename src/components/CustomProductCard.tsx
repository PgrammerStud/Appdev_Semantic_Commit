import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface CustomProductCardProps {
  title: string;
  price: number;
  image?: string;
  onPress: () => void;
}

const CustomProductCard: React.FC<CustomProductCardProps> = ({ title, price, image, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>₱{price}</Text>
    </TouchableOpacity>
  );
};

export default CustomProductCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 8,
    borderRadius: 12,
    width: '45%',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  title: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  price: {
    color: 'green',
    marginTop: 4,
  },
});
