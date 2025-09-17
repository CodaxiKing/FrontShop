// components/Top/CartBadge.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface CartBadgeProps {
  totalCarrinhos: number;
}

const CartBadge: React.FC<CartBadgeProps> = ({ totalCarrinhos }) => {

  //console.log(`CartBadge -> [${totalCarrinhos}]`)
  if (totalCarrinhos <= 0) return null; // Não renderiza nada se não houver carrinhos

  return (
    <View style={styles.badgeContainer}>
      <Text style={styles.badgeText}>{totalCarrinhos}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default CartBadge;
