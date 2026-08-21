import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { api } from "../../lib/axios";
import {
  Colors,
  Radius,
  Shadow,
  Spacing,
} from "../../constants/theme";

type Category = {
  id: number;
  name: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  editingItem?: any;
};

export default function MenuItemModal({
  visible,
  onClose,
  onSuccess,
  categories,
  editingItem,
}: Props) {
  const isEditing = !!editingItem;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [categoryId, setCategoryId] = useState<number | undefined>();

  const [stockQuantity, setStockQuantity] = useState("-1");

  const [preparationTime, setPreparationTime] = useState("15");

  const [isVeg, setIsVeg] = useState(false);

  const [imageUrl, setImageUrl] = useState("");

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (!visible) return;

    if (editingItem) {
      setName(editingItem.name || "");
      setDescription(editingItem.description || "");
      setPrice(
        editingItem.price
          ? String(parseFloat(editingItem.price))
          : ""
      );
      setImageUrl(editingItem.imageUrl || "");
      setCategoryId(editingItem.categoryId);
      setStockQuantity(
        String(
          editingItem.stockQuantity == null
            ? -1
            : editingItem.stockQuantity
        )
      );
      setPreparationTime(
        String(editingItem.preparationTime ?? 15)
      );
      setIsVeg(editingItem.isVeg || false);
    } else {
      resetForm();
    }
  }, [editingItem, visible]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setCategoryId(undefined);
    setStockQuantity("-1");
    setPreparationTime("15");
    setIsVeg(false);
    setErrors({});
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Needed", "Please allow access to your photo library to upload images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];

      if (!asset.base64) {
        Alert.alert("Error", "Could not read image data. Please try again.");
        return;
      }

      setUploading(true);
      const mimeType = asset.mimeType || "image/jpeg";
      const base64String = `data:${mimeType};base64,${asset.base64}`;

      const res = await api.post("/api/upload", {
        file: base64String,
        fileName: `menu_${Date.now()}.jpg`,
      });

      if (res.data?.url) {
        setImageUrl(res.data.url);
        setErrors((prev: any) => ({ ...prev, imageUrl: undefined }));
      } else {
        Alert.alert("Upload Failed", "No URL returned from server.");
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      Alert.alert("Upload Error", err.response?.data?.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    let obj: any = {};

    if (!name.trim()) obj.name = "Item name required";

    if (!price.trim()) obj.price = "Price required";

    if (Number(price) <= 0) obj.price = "Invalid price";

    if (!imageUrl.trim()) obj.imageUrl = "Menu item image is mandatory";

    if (Number(preparationTime) <= 0)
      obj.preparationTime = "Preparation time required";

    setErrors(obj);
    return Object.keys(obj).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        name,
        description,
        price: Number(price),
        imageUrl: imageUrl.trim(),
        categoryId,
        stockQuantity: Number(stockQuantity),
        preparationTime: Number(preparationTime),
        isVeg,
      };

      if (isEditing) {
        await api.patch(
          `/api/vendor/menu/${editingItem.id}`,
          payload
        );
      } else {
        await api.post("/api/vendor/menu", payload);
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      console.log(err);
      alert(
        err.response?.data?.message ?? "Unable to save menu item."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? "Edit Menu Item" : "Add Menu Item"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color={Colors.gray500} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* ─── Image Upload Section ─── */}
            <Text style={styles.label}>Item Image *</Text>
            <TouchableOpacity
              style={styles.imageUploadArea}
              onPress={pickImage}
              disabled={uploading}
              activeOpacity={0.7}
            >
              {uploading ? (
                <View style={styles.imageUploadPlaceholder}>
                  <ActivityIndicator size="large" color="#DC2626" />
                  <Text style={styles.uploadingText}>Uploading to Cloudinary...</Text>
                </View>
              ) : imageUrl ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                  <View style={styles.imageOverlayBadge}>
                    <Ionicons name="camera-outline" size={14} color="#fff" />
                    <Text style={styles.imageOverlayText}>Change</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.imageUploadPlaceholder}>
                  <View style={styles.uploadIconCircle}>
                    <Ionicons name="cloud-upload-outline" size={28} color="#DC2626" />
                  </View>
                  <Text style={styles.uploadMainText}>Tap to upload image</Text>
                  <Text style={styles.uploadSubText}>JPG, PNG • Max 5MB</Text>
                </View>
              )}
            </TouchableOpacity>
            {!!errors.imageUrl && (
              <Text style={styles.error}>{errors.imageUrl}</Text>
            )}

            {/* ─── Item Name ─── */}
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Chicken Biryani"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            {!!errors.name && (
              <Text style={styles.error}>{errors.name}</Text>
            )}

            {/* ─── Description ─── */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
              style={[styles.input, { height: 80, textAlignVertical: "top", paddingTop: 12 }]}
              placeholder="Describe the dish..."
              placeholderTextColor="#9CA3AF"
            />

            {/* ─── Price ─── */}
            <Text style={styles.label}>Price (₹) *</Text>
            <TextInput
              value={price}
              keyboardType="numeric"
              onChangeText={setPrice}
              style={styles.input}
              placeholder="e.g. 299"
              placeholderTextColor="#9CA3AF"
            />
            {!!errors.price && (
              <Text style={styles.error}>{errors.price}</Text>
            )}

            {/* ─── Category ─── */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={categoryId}
                onValueChange={(value) => setCategoryId(value || undefined)}
              >
                <Picker.Item label="None (No Category)" value={undefined} />
                {categories.map((cat) => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                ))}
              </Picker>
            </View>

            {/* ─── Stock & Prep Time Row ─── */}
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Stock Qty</Text>
                <TextInput
                  keyboardType="numeric"
                  value={stockQuantity}
                  onChangeText={setStockQuantity}
                  style={styles.input}
                  placeholder="-1 (unlimited)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Prep Time (min)</Text>
                <TextInput
                  keyboardType="numeric"
                  value={preparationTime}
                  onChangeText={setPreparationTime}
                  style={styles.input}
                  placeholder="15"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            {!!errors.preparationTime && (
              <Text style={styles.error}>{errors.preparationTime}</Text>
            )}

            {/* ─── Veg Toggle ─── */}
            <View style={styles.switchCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Vegetarian Item</Text>
                <Text style={styles.switchSubtitle}>Enable if this item is veg</Text>
              </View>
              <Switch
                value={isVeg}
                onValueChange={setIsVeg}
                thumbColor="#fff"
                trackColor={{ false: Colors.gray300, true: "#16A34A" }}
              />
            </View>

            {/* ─── Submit Button ─── */}
            <TouchableOpacity
              style={[styles.saveButton, (loading || uploading) && styles.saveButtonDisabled]}
              disabled={loading || uploading}
              onPress={handleSubmit}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>
                  {isEditing ? "Save Changes" : "Create Menu Item"}
                </Text>
              )}
            </TouchableOpacity>

          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "92%",
    ...Shadow.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 6,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: "#111827",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  half: {
    width: "48%",
  },
  switchCard: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  switchTitle: {
    fontWeight: "800",
    color: "#111827",
    fontSize: 15,
  },
  switchSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: "#DC2626",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  error: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },

  // Image upload styles
  imageUploadArea: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FAFAFA",
  },
  imageUploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    gap: 8,
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  uploadMainText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  uploadSubText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  uploadingText: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "600",
    marginTop: 6,
  },
  imagePreviewContainer: {
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
  imageOverlayBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageOverlayText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});