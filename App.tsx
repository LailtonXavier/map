import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView from "./Map";

export default function App() {
  const [region, setRegion] = useState({
    latitude: -8.664,
    longitude: -36.006,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  return (
    <View style={styles.container}>
      <MapView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#bebebe",
  },
  text: {
    color: "#fff",
  },
});
