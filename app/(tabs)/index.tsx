import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Resultado = "sana" | "enferma" | null;

export default function IndexScreen() {
  const [imagen, setImagen] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado>(null);
  const [cargando, setCargando] = useState(false);

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert(
        "Permiso requerido",
        "Debes permitir el acceso a la galería para subir una imagen.",
      );
      return;
    }

    const respuesta = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (respuesta.canceled) {
      return;
    }

    const imagenSeleccionada = respuesta.assets[0];

    if (!imagenSeleccionada || !imagenSeleccionada.uri) {
      Alert.alert("Error", "No se pudo cargar la imagen.");
      return;
    }

    setImagen(imagenSeleccionada.uri);
    setResultado(null);
  };

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const analizarHoja = async () => {
    if (!imagen) {
      Alert.alert(
        "Imagen requerida",
        "Por favor sube una imagen de la hoja antes de analizar.",
      );
      return;
    }

    setCargando(true);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imagen,
        name: "hoja.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error del servidor");

      const data = await response.json();
      setResultado(data.prediction === "healthy" ? "sana" : "enferma");
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo conectar con el servidor. Verifica que el backend esté corriendo.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Diagnóstico de hoja</Text>

        <Text style={styles.descripcion}>
          Sube una foto clara de la hoja para revisar si está sana o no.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.uploadCard}
        onPress={seleccionarImagen}
        activeOpacity={0.8}
      >
        {imagen ? (
          <Image source={{ uri: imagen }} style={styles.preview} />
        ) : (
          <View style={styles.uploadContent}>
            <Text style={styles.cameraIcon}>📷</Text>

            <Text style={styles.uploadTitle}>Toca para subir una imagen</Text>

            <Text style={styles.uploadSubtitle}>JPG, PNG o JPEG</Text>
          </View>
        )}
      </TouchableOpacity>

      {imagen ? (
        <TouchableOpacity onPress={seleccionarImagen} activeOpacity={0.8}>
          <Text style={styles.changeImage}>Cambiar imagen</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={[styles.botonAnalizar, imagen ? null : styles.botonDesactivado]}
        onPress={analizarHoja}
        activeOpacity={0.8}
      >
        {cargando ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.textoBoton}>Analizar hoja</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resultadoContainer}>
        <Text style={styles.resultadoTitulo}>Resultado</Text>

        <View
          style={[
            styles.resultadoCard,
            resultado === "sana" ? styles.resultadoSano : null,
            resultado === "enferma" ? styles.resultadoEnfermo : null,
          ]}
        >
          {!resultado && !cargando ? (
            <View style={styles.resultadoContenido}>
              <Text style={styles.resultadoIcono}>🕒</Text>

              <Text style={styles.resultadoTexto}>
                Aún no se ha analizado ninguna imagen.
              </Text>
            </View>
          ) : null}

          {cargando ? (
            <View style={styles.resultadoContenido}>
              <Text style={styles.resultadoIcono}>🔍</Text>

              <Text style={styles.resultadoTexto}>Analizando imagen...</Text>
            </View>
          ) : null}

          {resultado === "sana" ? (
            <View style={styles.resultadoContenido}>
              <Text style={styles.resultadoIcono}>✅</Text>

              <Text style={styles.resultadoTextoPrincipal}>
                Hoja aparentemente sana
              </Text>

              <Text style={styles.resultadoTexto}>
                La imagen no muestra señales visibles de daño.
              </Text>
            </View>
          ) : null}

          {resultado === "enferma" ? (
            <View style={styles.resultadoContenido}>
              <Text style={styles.resultadoIcono}>⚠️</Text>

              <Text style={styles.resultadoTextoPrincipal}>
                Posible hoja enferma
              </Text>

              <Text style={styles.resultadoTexto}>
                Se detectan señales visuales que podrían indicar daño o manchas.
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F8F4",
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  icono: {
    fontSize: 46,
    marginBottom: 8,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1B5E20",
    textAlign: "center",
  },
  descripcion: {
    fontSize: 15,
    color: "#4E6E58",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  uploadCard: {
    height: 260,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#81C784",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  uploadContent: {
    alignItems: "center",
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2E7D32",
    textAlign: "center",
  },
  uploadSubtitle: {
    fontSize: 13,
    color: "#78927D",
    marginTop: 6,
  },
  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  changeImage: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 14,
  },
  botonAnalizar: {
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 26,
  },
  botonDesactivado: {
    backgroundColor: "#A5D6A7",
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  resultadoContainer: {
    marginTop: 30,
  },
  resultadoTitulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 12,
  },
  resultadoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  resultadoContenido: {
    alignItems: "center",
  },
  resultadoSano: {
    backgroundColor: "#E8F5E9",
    borderColor: "#66BB6A",
  },
  resultadoEnfermo: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFB300",
  },
  resultadoIcono: {
    fontSize: 36,
    marginBottom: 10,
  },
  resultadoTextoPrincipal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#263238",
    textAlign: "center",
    marginBottom: 6,
  },
  resultadoTexto: {
    fontSize: 14,
    color: "#546E5A",
    textAlign: "center",
    lineHeight: 21,
  },
});
