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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
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
        String(
          editingItem.preparationTime ?? 15
        )
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

  const validate = () => {
    let obj: any = {};

    if (!name.trim())
      obj.name = "Item name required";

    if (!price.trim())
      obj.price = "Price required";

    if (Number(price) <= 0)
      obj.price = "Invalid price";

    if (!imageUrl.trim())
      obj.imageUrl = "Menu item image is mandatory";

    if (Number(preparationTime) <= 0)
      obj.preparationTime =
        "Preparation time required";

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

        preparationTime: Number(
          preparationTime
        ),

        isVeg,
      };

      if (isEditing) {
        await api.patch(
          `/api/vendor/menu/${editingItem.id}`,
          payload
        );
      } else {
        await api.post(
          "/api/vendor/menu",
          payload
        );
      }

      onSuccess();

      onClose();

      resetForm();
    } catch (err: any) {
      console.log(err);

      alert(
        err.response?.data?.message ??
          "Unable to save menu item."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing
                ? "Edit Menu Item"
                : "Add Menu Item"}
            </Text>

            <TouchableOpacity
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={26}
                color={Colors.gray500}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
          >

            <Text style={styles.label}>
              Item Name
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Chicken Biryani"
              style={styles.input}
            />

            {!!errors.name && (
              <Text style={styles.error}>
                {errors.name}
              </Text>
            )}

            <Text style={styles.label}>
              Description
            </Text>

            <TextInput
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              style={[
                styles.input,
                {
                  height: 90,
                  textAlignVertical: "top",
                },
              ]}
              placeholder="Item description..."
            />

            <Text style={styles.label}>
              Price *
            </Text>

            <TextInput
              value={price}
              keyboardType="numeric"
              onChangeText={setPrice}
              style={styles.input}
              placeholder="e.g. 299"
            />

            {!!errors.price && (
              <Text style={styles.error}>
                {errors.price}
              </Text>
            )}

            <Text style={styles.label}>
              Image URL * (Cloudinary or Direct Link)
            </Text>

            <TextInput
              value={imageUrl}
              onChangeText={setImageUrl}
              style={styles.input}
              placeholder="https://res.cloudinary.com/... or image link"
              autoCapitalize="none"
            />

            {!!errors.imageUrl && (
              <Text style={styles.error}>
                {errors.imageUrl}
              </Text>
            )}

            <Text style={styles.label}>
              Category
            </Text>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={categoryId}
                onValueChange={(value) =>
                  setCategoryId(value || undefined)
                }
              >
                <Picker.Item label="None (No Category)" value={undefined} />
                {categories.map((cat) => (
                  <Picker.Item
                    key={cat.id}
                    label={cat.name}
                    value={cat.id}
                  />
                ))}
              </Picker>
            </View>

            {!!errors.category && (
              <Text style={styles.error}>
                {errors.category}
              </Text>
            )}

            <View style={styles.row}>

              <View style={styles.half}>

                <Text style={styles.label}>
                  Stock
                </Text>

                <TextInput
                  keyboardType="numeric"
                  value={stockQuantity}
                  onChangeText={setStockQuantity}
                  style={styles.input}
                  placeholder="-1"
                />

              </View>

              <View style={styles.half}>

                <Text style={styles.label}>
                  Prep Time
                </Text>

                <TextInput
                  keyboardType="numeric"
                  value={preparationTime}
                  onChangeText={setPreparationTime}
                  style={styles.input}
                  placeholder="15"
                />

              </View>

            </View>

            {!!errors.preparationTime && (
              <Text style={styles.error}>
                {errors.preparationTime}
              </Text>
            )}

            <View style={styles.switchCard}>

              <View>

                <Text style={styles.switchTitle}>
                  Vegetarian Item
                </Text>

                <Text style={styles.switchSubtitle}>
                  Enable if this item is veg.
                </Text>

              </View>

              <Switch
                value={isVeg}
                onValueChange={setIsVeg}
                thumbColor="#fff"
                trackColor={{
                  false: Colors.gray300,
                  true: Colors.green,
                }}
              />

            </View>

            <TouchableOpacity
              style={styles.saveButton}
              disabled={loading}
              onPress={handleSubmit}
            >

              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>
                  {isEditing
                    ? "Save Changes"
                    : "Create Menu Item"}
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
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.base,
    maxHeight: "90%",
    ...Shadow.lg,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.base,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.gray600,
    marginBottom: 6,
    marginTop: 16,
    textTransform: "uppercase",
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 15,
    color: Colors.textPrimary,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.md,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.base,
  },

  half: {
    width: "48%",
  },

  switchCard: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.md,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  switchTitle: {
    fontWeight: "800",
    color: Colors.textPrimary,
    fontSize: 15,
  },

  switchSubtitle: {
    color: Colors.gray500,
    fontSize: 12,
    marginTop: 3,
  },

  saveButton: {
    marginTop: 28,
    backgroundColor: Colors.red,
    height: 54,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  saveText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },

  error: {
    color: Colors.red,
    fontSize: 12,
    marginTop: 5,
  },

});