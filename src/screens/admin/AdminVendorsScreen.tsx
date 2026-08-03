// // src/screens/admin/AdminVendorsScreen.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
// } from 'react-native';
// import { api } from '../../lib/axios';
// import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
// import { Ionicons } from '@expo/vector-icons';
// import LoadingSpinner from '../../components/LoadingSpinner';

// export default function AdminVendorsScreen({ navigation }: any) {
//   const [vendors, setVendors] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchVendors = async () => {
//     try {
//       const res = await api.get('/api/admin/vendors');
//       setVendors(res.data?.data || []);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchVendors();
//   }, []);

//   const toggleVendorStatus = async (vendorId: number, currentStatus: string) => {
//     const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
//     try {
//       await api.patch(`/api/admin/vendors/${vendorId}/status`, { status: nextStatus });
//       fetchVendors();
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   if (loading) {
//     return <LoadingSpinner fullScreen />;
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
//           <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
//           <Text style={styles.headerTitle}>System Vendors</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {vendors.length === 0 ? (
//           <View style={styles.emptyBox}>
//             <Text style={styles.emptyText}>No vendors registered in system.</Text>
//           </View>
//         ) : (
//           vendors.map((vendor) => (
//             <View key={vendor.id} style={styles.vendorCard}>
//               <View>
//                 <Text style={styles.vendorName}>{vendor.name || `Vendor #${vendor.id}`}</Text>
//                 <Text style={styles.vendorLoc}>{vendor.email}</Text>
//               </View>
//               <TouchableOpacity
//                 style={[
//                   styles.statusToggle,
//                   { backgroundColor: vendor.status === 'ACTIVE' ? Colors.green : Colors.red },
//                 ]}
//                 onPress={() => toggleVendorStatus(vendor.id, vendor.status)}
//               >
//                 <Text style={styles.statusToggleText}>
//                   {vendor.status === 'ACTIVE' ? 'ACTIVE' : 'BLOCKED'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           ))
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.bg,
//   },
//   header: {
//     height: 56,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.gray100,
//     justifyContent: 'center',
//     paddingHorizontal: Spacing.base,
//   },
//   backBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   headerTitle: {
//     fontSize: 16,
//     fontWeight: '900',
//     color: Colors.textPrimary,
//   },
//   scrollContent: {
//     padding: Spacing.base,
//     gap: Spacing.base,
//   },
//   emptyBox: {
//     backgroundColor: '#fff',
//     padding: Spacing.xl,
//     borderRadius: Radius.lg,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: Colors.gray100,
//   },
//   emptyText: {
//     color: Colors.gray400,
//     fontSize: 12,
//   },
//   vendorCard: {
//     backgroundColor: '#fff',
//     borderRadius: Radius.lg,
//     padding: Spacing.base,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: Colors.gray100,
//     ...Shadow.sm,
//   },
//   vendorName: {
//     fontSize: 14,
//     fontWeight: '800',
//     color: Colors.textPrimary,
//   },
//   vendorLoc: {
//     fontSize: 11,
//     color: Colors.gray500,
//     marginTop: 2,
//   },
//   statusToggle: {
//     paddingHorizontal: Spacing.base,
//     paddingVertical: 6,
//     borderRadius: Radius.sm,
//   },
//   statusToggleText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: '850',
//   },
// });



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

import { api } from "../../lib/axios";
import { Colors, Radius, Shadow, Spacing } from "../../constants/theme";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminVendorsScreen({ navigation }: any) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------
        Add Vendor Modal
  -------------------------------- */

  const [showAddModal, setShowAddModal] = useState(false);

  const [ownerName, setOwnerName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [fssaiLicense, setFssaiLicense] = useState("");

  /* -------------------------------
          Fetch Vendors
  -------------------------------- */

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/admin/vendors");

      setVendors(res.data?.data || []);
    } catch (err) {
      console.log(err);

      Alert.alert("Error", "Unable to fetch vendors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  /* -------------------------------
      Create Vendor
  -------------------------------- */

  const createVendor = async () => {
    if (
      !ownerName ||
      !businessName ||
      !businessAddress ||
      !phone ||
      !email ||
      !password
    ) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/admin/vendors", {
        name: businessName,
        ownerName,
        businessAddress,
        phone,
        email,
        password,
        gstNumber,
        panNumber,
        fssaiLicense,
        documents: [],
      });

      Alert.alert("Success", "Vendor created successfully.");

      setShowAddModal(false);

      setOwnerName("");
      setBusinessName("");
      setBusinessAddress("");
      setPhone("");
      setEmail("");
      setPassword("");
      setGstNumber("");
      setPanNumber("");
      setFssaiLicense("");

      fetchVendors();
    } catch (err: any) {
      console.log(err);

      Alert.alert(
        "Error",
        err?.response?.data?.message || "Unable to create vendor."
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------
      Block / Unblock
  -------------------------------- */

  const toggleVendorStatus = async (
    vendorId: number,
    currentStatus: string
  ) => {
    const nextStatus =
      currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await api.patch(
        `/api/admin/vendors/${vendorId}/status`,
        {
          status: nextStatus,
        }
      );

      fetchVendors();
    } catch (err) {
      console.log(err);

      Alert.alert(
        "Error",
        "Unable to update vendor status."
      );
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
              System Vendors
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons
              name="add"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* ================= VENDORS ================= */}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {vendors.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons
                name="business-outline"
                size={50}
                color={Colors.gray400}
              />

              <Text style={styles.emptyTitle}>
                No Vendors
              </Text>

              <Text style={styles.emptyText}>
                No vendors have been created yet.
              </Text>
            </View>
          ) : (
            vendors.map((vendor) => (
              <View
                key={vendor.id}
                style={styles.vendorCard}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.vendorName}>
                    {vendor.name}
                  </Text>

                  <Text style={styles.vendorEmail}>
                    {vendor.email}
                  </Text>

                  <Text style={styles.vendorPhone}>
                    {vendor.phone}
                  </Text>

                  <Text style={styles.vendorAddress}>
                    {vendor.businessAddress}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor:
                        vendor.status === "ACTIVE"
                          ? "#16A34A"
                          : "#DC2626",
                    },
                  ]}
                  onPress={() =>
                    toggleVendorStatus(
                      vendor.id,
                      vendor.status
                    )
                  }
                >
                  <Text
                    style={styles.statusButtonText}
                  >
                    {vendor.status === "ACTIVE"
                      ? "ACTIVE"
                      : "BLOCKED"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {/* PART 2 STARTS HERE */}      {/* ================= ADD VENDOR MODAL ================= */}

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
            >
              <Ionicons
                name="close"
                size={28}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              Add Vendor
            </Text>

            <View style={{ width: 28 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScroll}
          >
            {/* Owner Name */}

            <Text style={styles.label}>
              Owner Name *
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter owner name"
              placeholderTextColor={Colors.gray400}
              value={ownerName}
              onChangeText={setOwnerName}
            />

            {/* Business Name */}

            <Text style={styles.label}>
              Business Name *
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Business name"
              placeholderTextColor={Colors.gray400}
              value={businessName}
              onChangeText={setBusinessName}
            />

            {/* Address */}

            <Text style={styles.label}>
              Business Address *
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  height: 90,
                  textAlignVertical: "top",
                },
              ]}
              multiline
              value={businessAddress}
              onChangeText={setBusinessAddress}
              placeholder="Complete business address"
              placeholderTextColor={Colors.gray400}
            />

            {/* Phone */}

            <Text style={styles.label}>
              Phone Number *
            </Text>

            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholder="9876543210"
              placeholderTextColor={Colors.gray400}
            />

            {/* Email */}

            <Text style={styles.label}>
              Email Address *
            </Text>

            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholder="vendor@email.com"
              placeholderTextColor={Colors.gray400}
            />

            {/* Password */}

            <Text style={styles.label}>
              Password *
            </Text>

            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 6 characters"
              placeholderTextColor={Colors.gray400}
            />

            {/* GST */}

            <Text style={styles.label}>
              GST Number
            </Text>

            <TextInput
              style={styles.input}
              value={gstNumber}
              onChangeText={setGstNumber}
              placeholder="GST Number"
              placeholderTextColor={Colors.gray400}
            />

            {/* PAN */}

            <Text style={styles.label}>
              PAN Number
            </Text>

            <TextInput
              style={styles.input}
              value={panNumber}
              onChangeText={setPanNumber}
              placeholder="PAN Number"
              placeholderTextColor={Colors.gray400}
            />

            {/* FSSAI */}

            <Text style={styles.label}>
              FSSAI License
            </Text>

            <TextInput
              style={styles.input}
              value={fssaiLicense}
              onChangeText={setFssaiLicense}
              placeholder="FSSAI License Number"
              placeholderTextColor={Colors.gray400}
            />

            {/* Buttons */}

            <TouchableOpacity
              style={styles.createBtn}
              onPress={createVendor}
            >
              <Ionicons
                name="checkmark-circle"
                color="#fff"
                size={20}
              />

              <Text style={styles.createBtnText}>
                Create Vendor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setShowAddModal(false);
              }}
            >
              <Text style={styles.cancelBtnText}>
                Cancel
              </Text>
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

  vendorCard: {
    backgroundColor: "#fff",
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },

  vendorName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  vendorEmail: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.gray500,
  },

  vendorPhone: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.gray500,
  },

  vendorAddress: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.gray400,
  },

  statusButton: {
    marginTop: 14,
    alignSelf: "flex-start",
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