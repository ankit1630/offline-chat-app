import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { globalStyles } from "../styles/global";
import UploadFile from "../components/FileUpload";

export default function ManageCollections({ navigation }) {
  const _onPressHandler = () => {
    console.log("hello")
  };
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.titleText} onPress={_onPressHandler}>
        Upload Files/Document
      </Text>
      <UploadFile />
    </View>
  );
}