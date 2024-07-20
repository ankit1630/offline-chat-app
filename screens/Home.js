import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableHighlight,
} from "react-native";
import { globalStyles } from "../styles/global";
import { homeStyles } from "../styles/homeStyle";
import { IconButton } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

const FREQUENTLY_ASKED_QUESTIONS = [
  {
    id: "first_question",
    question: "How to take a screenshot on Windows?",
  },
  {
    id: "second_question",
    question: "What Does Pookie Mean?",
  },
  {
    id: "third_question",
    question: "How To Make Money Online in jungle?",
  },
];

export default function Home({ navigation }) {
  const [textInput, setTextInput] = useState("");
  const onChangeInputText = (inputText) => {
    setTextInput(inputText);
  };

  const _onSendBtnPressHandler = () => {
    navigation.jumpTo("Conversation", { textInput });
  };

  const _onQuestionPress = (question) => {
    navigation.jumpTo("Conversation", { textInput: question });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setTextInput("");
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor="#423d6a" />
      <View style={globalStyles.container}>
        <View style={homeStyles.mainContainer}>
          <Text style={homeStyles.headerText}>
            Welcome to Grid Down Survival AI!
          </Text>
          <Text style={homeStyles.description}>
            There is a known issue with translating a page using Chrome tools
            when a Loading Button is present. After the page is translated, the
            application crashes when the loading state of a Button changes. To
            prevent this, ensure that the contents of the Loading Button are
            nested inside any HTML element, such as a span
          </Text>
          <FlatList
            style={homeStyles.listStyle}
            data={FREQUENTLY_ASKED_QUESTIONS}
            renderItem={({ item }) => {
              return (
                <TouchableHighlight
                  onPress={() => _onQuestionPress(item.question)}
                  underlayColor="purple"
                  style={{ borderRadius: 12, padding: 12 }}
                >
                  <View style={homeStyles.listStyleItem} on>
                    <Text>{item.question}</Text>
                  </View>
                </TouchableHighlight>
              );
            }}
            keyExtractor={(item) => item.id}
          />
        </View>
        <View style={globalStyles.chatBox}>
          <TextInput
            style={globalStyles.input}
            onChangeText={onChangeInputText}
            value={textInput}
            placeholder="Hey! Ask Anything!"
            keyboardType="default"
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
              />
            </LinearGradient>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
