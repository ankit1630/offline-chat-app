import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

import Home from "./screens/Home";
import Conversation from "./screens/Conversation";
import HeaderRight from "./components/HeaderRight";
import ManageCollections from "./screens/ManageDocuments";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen
          name="Home"
          component={Home}
          options={({route, navigation}) => ({
            headerTitle: "Home",
            headerRight: () => <HeaderRight navigation={navigation} />
          })}
        />
        <Drawer.Screen
          name="Conversation"
          component={Conversation}
          options={{
            headerTitle: "Conversation",
            headerBackVisible: true,
            headerBackTitleVisible: false,
          }}
        />
        <Drawer.Screen name="Manage Documents" component={ManageCollections} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
