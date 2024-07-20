import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { IconButton } from "react-native-paper";
import { headerStyles } from "../styles/header";

export default function HeaderLeft() {
  return (
    <View>
      <IconButton
        icon="menu"
        iconColor="gray"
        size={20}
        onPress={() => console.log("Pressed")}
      />
    </View>
  );
}
