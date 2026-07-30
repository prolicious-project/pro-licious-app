import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/axios";
import {
  Colors,
  Radius,
  Shadow,
  Spacing,
} from "../../constants/theme";
import LoadingSpinner from "../../components/LoadingSpinner";
import MenuItemModal from "../../components/vendor/MenuItemModal";

export default function VendorMenuScreen({ navigation }: any) {

  const [menu, setMenu] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchData = async () => {

    try {

      const [menuRes, catRes] =
        await Promise.all([
          api.get("/api/vendor/menu"),
          api.get("/api/vendor/categories"),
        ]);

      setMenu(menuRes.data?.data || []);

      setCategories(catRes.data?.data || []);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };

  useEffect(() => {

    fetchData();

  }, []);

  const onRefresh = () => {

    setRefreshing(true);

    fetchData();

  };

  const filteredMenu = useMemo(() => {

    if (!search.trim()) return menu;

    return menu.filter((item) =>

      item.name
        ?.toLowerCase()
        .includes(search.toLowerCase())

    );

  }, [menu, search]);

  const toggleAvailability = async (
    id: number,
    status: string
  ) => {

    try {

      const next =
        status === "ACTIVE"
          ? "OUT_OF_STOCK"
          : "ACTIVE";

      await api.patch(
        `/api/vendor/menu/${id}/availability`,
        {
          status: next,
        }
      );

      fetchData();

    } catch (e) {

      console.log(e);

    }

  };

  const deleteItem = (item: any) => {

    Alert.alert(

      "Delete Item",

      `Delete "${item.name}" ?`,

      [

        {
          text: "Cancel",
          style: "cancel",
        },

        {

          text: "Delete",

          style: "destructive",

          onPress: async () => {

            try {

              await api.delete(
                `/api/vendor/menu/${item.id}`
              );

              fetchData();

            } catch (err) {

              Alert.alert(
                "Error",
                "Unable to delete item."
              );

            }

          },

        },

      ]

    );

  };

  if (loading) {

    return <LoadingSpinner fullScreen />;

  }

  const renderItem = ({ item }: any) => {

    const category =
      categories.find(
        (c) => c.id === item.categoryId
      )?.name || "Uncategorized";

    return (

      <View style={styles.card}>

        <View style={styles.cardTop}>

          <View style={{ flex: 1 }}>

            <Text style={styles.itemName}>

              {item.name}

            </Text>

            <Text style={styles.category}>

              {category}

            </Text>

          </View>

          <TouchableOpacity
            onPress={() =>
              toggleAvailability(
                item.id,
                item.status
              )
            }
          >

            <Ionicons
              size={30}
              color={
                item.status === "ACTIVE"
                  ? Colors.green
                  : Colors.gray400
              }
              name={
                item.status === "ACTIVE"
                  ? "toggle"
                  : "toggle-outline"
              }
            />

          </TouchableOpacity>

        </View>

        {!!item.description && (

          <Text
            style={styles.description}
          >

            {item.description}

          </Text>

        )}

        <View style={styles.infoRow}>

          <Text style={styles.price}>

            ₹{Number(item.price).toFixed(0)}

          </Text>

          <View
            style={[
              styles.vegBadge,

              {
                backgroundColor:
                  item.isVeg
                    ? "#dcfce7"
                    : "#fee2e2",
              },
            ]}
          >

            <Text
              style={{
                color: item.isVeg
                  ? "#166534"
                  : "#991b1b",

                fontWeight: "800",

                fontSize: 10,
              }}
            >

              {item.isVeg
                ? "VEG"
                : "NON VEG"}

            </Text>

          </View>

        </View>

                <View style={styles.metaRow}>

          <Text style={styles.metaText}>
            Stock :
            <Text style={styles.metaValue}>
              {" "}
              {item.stockQuantity === -1
                ? "Unlimited"
                : item.stockQuantity}
            </Text>
          </Text>

          <Text style={styles.metaText}>
            Prep :
            <Text style={styles.metaValue}>
              {" "}
              {item.preparationTime ?? 15} mins
            </Text>
          </Text>

        </View>

        <View style={styles.actions}>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {

              setEditingItem(item);

              setShowModal(true);

            }}
          >

            <Ionicons
              name="create-outline"
              size={18}
              color={Colors.red}
            />

            <Text style={styles.editText}>
              Edit
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteItem(item)}
          >

            <Ionicons
              name="trash-outline"
              size={18}
              color="#fff"
            />

            <Text style={styles.deleteText}>
              Delete
            </Text>

          </TouchableOpacity>

        </View>

      </View>

    );

  };

  return (

    <SafeAreaView style={styles.container}>

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >

          <Ionicons
            name="chevron-back"
            size={24}
            color={Colors.textPrimary}
          />

        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Menu Management
        </Text>

        <TouchableOpacity
          onPress={() => {

            setEditingItem(null);

            setShowModal(true);

          }}
        >

          <Ionicons
            name="add-circle"
            size={34}
            color={Colors.red}
          />

        </TouchableOpacity>

      </View>

      <View style={styles.searchContainer}>

        <Ionicons
          name="search"
          size={18}
          color={Colors.gray400}
        />

        <TextInput
          placeholder="Search menu item..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

      </View>

      <FlatList

        data={filteredMenu}

        keyExtractor={(item) =>
          item.id.toString()
        }

        renderItem={renderItem}

        contentContainerStyle={styles.list}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }

        ListEmptyComponent={() => (

          <View style={styles.emptyBox}>

            <Ionicons
              name="restaurant-outline"
              size={70}
              color={Colors.gray300}
            />

            <Text style={styles.emptyTitle}>
              No Menu Items
            </Text>

            <Text style={styles.emptyText}>
              Tap + to add your first menu item.
            </Text>

          </View>

        )}

      />

      <TouchableOpacity

        style={styles.fab}

        onPress={() => {

          setEditingItem(null);

          setShowModal(true);

        }}

      >

        <Ionicons
          name="add"
          size={28}
          color="#fff"
        />

      </TouchableOpacity>

      <MenuItemModal

        visible={showModal}

        editingItem={editingItem}

        categories={categories}

        onClose={() => {

          setShowModal(false);

          setEditingItem(null);

        }}

        onSuccess={fetchData}

      />

    </SafeAreaView>

  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  header: {
    height: 58,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  searchContainer: {
    margin: Spacing.base,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
    paddingHorizontal: 14,
    height: 50,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },

  list: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 120,
    gap: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  itemName: {
    fontSize: 17,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  category: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.gray500,
  },

  description: {
    marginTop: 12,
    fontSize: 13,
    color: Colors.gray600,
    lineHeight: 20,
  },

  infoRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  price: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  vegBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 50,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  metaText: {
    fontSize: 12,
    color: Colors.gray500,
  },

  metaValue: {
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  actions: {
    flexDirection: "row",
    marginTop: 22,
    gap: 12,
  },

  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.red,
    borderRadius: Radius.md,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: Colors.red,
    borderRadius: Radius.md,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  editText: {
    color: Colors.red,
    fontWeight: "800",
  },

  deleteText: {
    color: "#fff",
    fontWeight: "800",
  },

  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 15,
    color: Colors.textPrimary,
  },

  emptyText: {
    marginTop: 6,
    color: Colors.gray500,
    fontSize: 13,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.red,
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.lg,
  },

});