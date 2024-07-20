import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { IconButton, Button } from "react-native-paper";
import { headerStyles } from "../styles/header";

export default function HeaderRight({navigation}) {
  return (
    <View>
      <Button
        icon="shield-account-outline"
        mode="outlined"
        style={headerStyles.rightHeaderButton}
        compact={true}
        labelStyle={{lineHeight: "12px", padding: "0", fontSize:"10px"}}
        onPress={() => navigation.jumpTo("Conversation")}
      >
        Start a chat
      </Button>
    </View>
  );
}
