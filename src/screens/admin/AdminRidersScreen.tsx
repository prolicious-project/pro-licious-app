// src/screens/admin/AdminRidersScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import { api } from "../../lib/axios";
import { Colors, Radius, Shadow, Spacing } from "../../constants/theme";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminRidersScreen({ navigation }: any) {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* -------------------------------
        Add Rider Modal State
  -------------------------------- */
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleType, setVehicleType] = useState("BIKE");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [address, setAddress] = useState("");

  /* -------------------------------
          Fetch Riders
  -------------------------------- */
  const fetchRiders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/riders");
      setRiders(res.data?.data || []);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Unable to fetch riders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  /* -------------------------------
      Create Rider
  -------------------------------- */
  const createRider = async () => {
    if (
      !name ||
      !phone ||
      !email ||
      !password ||
      !vehicleType ||
      !vehicleNumber
    ) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/api/admin/riders", {
        name,
        phone,
        email,
        password,
        vehicleType,
        vehicleNumber,
        licenseNumber,
        panNumber,
        address,
        documents: [],
      });

      Alert.alert("Success", "Rider onboarded successfully.");
      setShowAddModal(false);

      // Reset form
      setName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setVehicleType("BIKE");
      setVehicleNumber("");
      setLicenseNumber("");
      setPanNumber("");
      setAddress("");

      fetchRiders();
    } catch (err: any) {
      console.log(err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Unable to onboard rider."
      );
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------
      Toggle Status
  -------------------------------- */
  const toggleRiderStatus = async (
    riderId: number,
    currentStatus: string
  ) => {
    const nextStatus =
      currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await api.patch(`/api/admin/riders/${riderId}/status`, {
        status: nextStatus,
      });
      fetchRiders();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Unable to update rider status.");
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons
                name="chevron-back"
                size={24}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>System Riders</Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ================= RIDERS LIST ================= */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {riders.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons
                name="bicycle-outline"
                size={50}
                color={Colors.gray400}
              />
              <Text style={styles.emptyTitle}>No Riders</Text>
              <Text style={styles.emptyText}>
                No delivery riders have been onboarded yet.
              </Text>
            </View>
          ) : (
            riders.map((rider) => (
              <View key={rider.id} style={styles.riderCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.riderName}>{rider.name}</Text>
                  <Text style={styles.riderDetailText}>
                    Email: {rider.email || "—"}
                  </Text>
                  <Text style={styles.riderDetailText}>
                    Phone: {rider.phone || "—"}
                  </Text>
                  <Text style={styles.riderDetailText}>
                    Vehicle: {rider.vehicleType} ({rider.vehicleNumber})
                  </Text>
                  {rider.address ? (
                    <Text style={styles.riderDetailText}>
                      Address: {rider.address}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.rightColumn}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      {
                        backgroundColor:
                          rider.status === "ACTIVE" ? "#16A34A" : "#DC2626",
                      },
                    ]}
                    onPress={() => toggleRiderStatus(rider.id, rider.status)}
                  >
                    <Text style={styles.statusButtonText}>
                      {rider.status === "ACTIVE" ? "ACTIVE" : "BLOCKED"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {/* ================= ADD RIDER MODAL ================= */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons
                name="close"
                size={28}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Delivery Rider</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScroll}
          >
            {/* Name */}
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              placeholderTextColor={Colors.gray400}
              value={name}
              onChangeText={setName}
            />

            {/* Phone */}
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="Enter phone number"
              placeholderTextColor={Colors.gray400}
              value={phone}
              onChangeText={setPhone}
            />

            {/* Email */}
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="rider@email.com"
              placeholderTextColor={Colors.gray400}
              value={email}
              onChangeText={setEmail}
            />

            {/* Password */}
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Minimum 6 characters"
              placeholderTextColor={Colors.gray400}
              value={password}
              onChangeText={setPassword}
            />

            {/* Vehicle Type */}
            <Text style={styles.label}>Vehicle Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={vehicleType}
                onValueChange={(val) => setVehicleType(val)}
              >
                <Picker.Item label="Bicycle / E-Bike" value="BICYCLE" />
                <Picker.Item label="Motorcycle / Scooter" value="BIKE" />
                <Picker.Item label="Car" value="CAR" />
              </Picker>
            </View>

            {/* Vehicle Number */}
            <Text style={styles.label}>Vehicle Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. KA-01-AB-1234"
              placeholderTextColor={Colors.gray400}
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
            />

            {/* License Number */}
            <Text style={styles.label}>Driving License Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter DL number"
              placeholderTextColor={Colors.gray400}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />

            {/* PAN Number */}
            <Text style={styles.label}>PAN Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter PAN number"
              placeholderTextColor={Colors.gray400}
              value={panNumber}
              onChangeText={setPanNumber}
            />

            {/* Address */}
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[
                styles.input,
                {
                  height: 80,
                  textAlignVertical: "top",
                },
              ]}
              multiline
              placeholder="Complete address"
              placeholderTextColor={Colors.gray400}
              value={address}
              onChangeText={setAddress}
            />

            {/* Buttons */}
            <TouchableOpacity
              style={[styles.createBtn, saving && { opacity: 0.6 }]}
              onPress={createRider}
              disabled={saving}
            >
              <Ionicons
                name="checkmark-circle"
                color="#fff"
                size={20}
              />
              <Text style={styles.createBtnText}>
                {saving ? "Creating..." : "Onboard Rider"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    ...Shadow.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.sm,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  riderCard: {
    backgroundColor: "#fff",
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  riderName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  riderDetailText: {
    fontSize: 13,
    color: Colors.gray500,
    marginTop: 3,
  },
  rightColumn: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  emptyBox: {
    marginTop: 70,
    backgroundColor: "#fff",
    borderRadius: Radius.lg,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
    color: Colors.gray500,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 50,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.gray200 || "#E5E7EB",
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.gray200 || "#E5E7EB",
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  createBtn: {
    marginTop: 30,
    backgroundColor: "#E53935",
    height: 52,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    ...Shadow.sm,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  cancelBtn: {
    marginTop: 14,
    height: 50,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray200 || "#E5E7EB",
    backgroundColor: "#fff",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
});
