import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
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
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 50,
    padding: 12,
    flex: 1,
    marginRight: 4
  },
  chatBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  }
});