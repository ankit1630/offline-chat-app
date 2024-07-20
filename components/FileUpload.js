import React from "react";
import { Button, View, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";

const UploadFile = () => {
  const uploadFile = async () => {
    try {
      // Pick document
      const uploadedFile = await DocumentPicker.getDocumentAsync();
      // console.log(JSON.stringify(uploadedFile));
      if (!uploadedFile.canceled) {
        const file = uploadedFile.assets[0];
        let formData = new FormData();

        if (Platform.OS === "web") {
          console.log(typeof file, file.file);
          formData.append("file", file.file);
        } else {
          console.log(typeof file, file);
          formData.append("file", file);
        }

        const response = await axios.post(
          "http://127.0.0.1:5002/api/file_upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log(response.data);
      } else {
        alert("You need to select a file.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View>
      <Button title="Upload File" onPress={uploadFile} />
    </View>
  );
};

export default UploadFile;
