import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import {
  View,
  StyleSheet,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";
import {
  LeafletView as OriginalLeafletView,
  LeafletViewProps,
} from "react-native-leaflet-view";

// Definindo a interface MapMarker
interface MapMarker {
  position: { lat: number; lng: number };
  icon: string;
  size: [number, number];
  id: string;
}

// Definindo o novo LeafletView com parâmetros padrão
const LeafletView = ({
  mapCenterPosition = { lat: 51.505, lng: -0.09 },
  zoom = 13,
  mapMarkers = [] as MapMarker[],
  ...props
}: LeafletViewProps & { mapMarkers: MapMarker[] }) => {
  return (
    <OriginalLeafletView
      mapCenterPosition={mapCenterPosition}
      zoom={zoom}
      mapMarkers={mapMarkers}
      {...props}
    />
  );
};

const MapView = () => {
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([
    {
      position: { lat: -8.664, lng: -36.006 },
      icon: "📍",
      size: [32, 32],
      id: "marker1",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const userLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync();

    setMapMarkers([
      {
        position: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
        icon: "📍",
        size: [32, 32],
        id: "marker1",
      },
    ]);
  };

  const searchLocation = async (query: string) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query
        )}&key=5c096fd10cd74339be2b728d75ea939f`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        const suggestionsList = data.results.map(
          (result: any) => result.formatted
        );
        setSuggestions(suggestionsList);
      } else {
        console.log("No results found");
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = async (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);

    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        suggestion
      )}&key=5c096fd10cd74339be2b728d75ea939f`
    );
    const data = await response.json();

    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;

      setMapMarkers([
        {
          position: { lat, lng },
          icon: "📍",
          size: [32, 32],
          id: "marker1",
        },
      ]);
    } else {
      console.log("No results found");
    }
  };

  useEffect(() => {
    userLocation(); // Descomente se quiser carregar a localização do usuário ao iniciar
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.containerInput}>
        <TextInput
          style={styles.input}
          placeholder="Enter location"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchLocation(text);
          }}
        />
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectSuggestion(item)}>
                <Text style={styles.suggestion}>{item}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsContainer}
          />
        )}
      </View>
      <LeafletView
        mapMarkers={mapMarkers}
        mapCenterPosition={{
          lat: mapMarkers[0].position.lat,
          lng: mapMarkers[0].position.lng,
        }}
        zoom={13}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  containerInput: {
    width: "100%",
    paddingVertical: 0,
    paddingHorizontal: 16,
    position: "absolute",
    top: 100,
    zIndex: 1,
  },
  input: {
    height: 50,
    borderColor: "#d6d6d6e4",
    borderWidth: 1,
    backgroundColor: "white",
    borderRadius: 15,
    paddingLeft: 15,
    shadowColor: "#ababab",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.19,
    shadowRadius: 5.62,
    elevation: 6,
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000b9",
  },
  suggestionsContainer: {
    position: "absolute",
    top: 50,
    marginHorizontal: 15,
    zIndex: 1,
    backgroundColor: "white",
    width: "100%",
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
});

export default MapView;
