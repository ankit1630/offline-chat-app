import { StyleSheet } from 'react-native';

export const conversationStyles = StyleSheet.create({
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  paragraph: {
    marginVertical: 8,
    lineHeight: 20,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    border: "1px solid gray",
    borderRadius: 12,
    padding: 12,
    width: "80%"
  },
  chatBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  }
});