import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  FlatList,
  TouchableHighlight,
} from "react-native";
import { conversationStyles } from "../styles/conversation";
import { homeStyles } from "../styles/homeStyle";
import { IconButton } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

export default function Conversation({ route, navigation }) {
  const flatListRef = useRef(null);
  const [textInput, setTextInput] = useState("");
  const [conversations, setConversations] = useState([]);
  const [fetchAnswerIsInProgress, setAnswerState] = useState(false);
  const onChangeInputText = (inputText) => {
    setTextInput(inputText);
  };

  const getAnwerFromAI = (inputQuery) => {
    return axios
    .post("http://127.0.0.1:5002/api/get_answer", {
      query: inputQuery,
      no_of_source: 1,
      user_prompt: "",
      search_type: "similarity",
      reset_memory: true,
    })
    .catch((e) => console.log("exception", JSON.stringify(e)))
  };

  const _onSendBtnPressHandler = async () => {
    setAnswerState(true);
    const responseFromAI = await getAnwerFromAI(textInput);
    setConversations([
      ...conversations,
      {
        id: Date.now() + conversations.length + "_user",
        from: "User",
        message: textInput,
      },
      {
        id: Date.now().toString() + conversations.length + "_ai",
        from: "AI",
        message: responseFromAI.data.answer,
      },
    ]);
    setTextInput("");
    setAnswerState(false);
  };

  const _renderChatMessages = (conversation) => {
    return (
      <View
        style={{
          alignSelf: conversation?.from === "AI" ? "flex-end" : "flex-start",
          backgroundColor: conversation?.from === "AI" ? "#ADD8E6" : "#ededed",
          padding: 10,
          borderRadius: 10,
          width: "70%",
        }}
      >
        <Text>{conversation?.message}</Text>
      </View>
    );
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (route?.params?.textInput) {
        console.log("route?.params?.textInput", route?.params?.textInput);
        setAnswerState(true);
        const response = await getAnwerFromAI(route.params.textInput);

        setConversations([
          ...conversations,
          {
            id: Date.now() + conversations.length + "_user",
            from: "User",
            message: route?.params?.textInput,
          },
          {
            id: Date.now().toString() + conversations.length + "_ai",
            from: "AI",
            message: response.data.answer,
          },
        ]);
        setAnswerState(false);
        delete route.params.textInput;
      }
    });
    return unsubscribe;
  }, [navigation, route]);

  const handleContentSizeChange = () => {
    flatListRef.current.scrollToEnd({ animated: true });
  };

  return (
    <View style={conversationStyles.container}>
      {/* <ScrollView
        style={{
          flex: 1,
          marginBottom: 12,
          overflow: "scroll",
        }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {conversations.map((conversation) => {
          return (
            <TouchableHighlight
              underlayColor="purple"
              style={{ borderRadius: 12, padding: 12 }}
              key={conversation.id}
            >
              {_renderChatMessages(conversation)}
            </TouchableHighlight>
          );
        })}
      </ScrollView> */}
      <View style={{ flex: 1 }}>
        <FlatList
          style={{ marginBottom: 20 }}
          ref={flatListRef}
          data={conversations}
          renderItem={({ item }) => _renderChatMessages(item)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          onContentSizeChange={handleContentSizeChange}
        />
      </View>
      <View style={conversationStyles.chatBox}>
        <TextInput
          style={conversationStyles.input}
          onChangeText={onChangeInputText}
          value={textInput}
          placeholder="Hey! Ask Anything!"
          keyboardType="default"
          readOnly={fetchAnswerIsInProgress}
        />
        <View>
          <LinearGradient
            colors={["#423d6a", "#3b2932"]}
            style={homeStyles.chatSendBtn}
          >
            <IconButton
              icon="send"
              iconColor="white"
              onPress={_onSendBtnPressHandler}
              disabled={fetchAnswerIsInProgress}
            />
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}
