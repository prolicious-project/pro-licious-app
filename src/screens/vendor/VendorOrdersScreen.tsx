// // // src/screens/vendor/VendorOrdersScreen.tsx
// // import React, { useEffect, useState } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   ScrollView,
// //   TouchableOpacity,
// //   SafeAreaView,
// // } from 'react-native';
// // import { api } from '../../lib/axios';
// // import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
// // import { Ionicons } from '@expo/vector-icons';
// // import LoadingSpinner from '../../components/LoadingSpinner';

// // export default function VendorOrdersScreen({ navigation }: any) {
// //   const [orders, setOrders] = useState<any[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [filterStatus, setFilterStatus] = useState<string>('');

// //   const fetchOrders = async () => {
// //     try {
// //       const res = await api.get('/api/vendor/orders', {
// //         params: filterStatus ? { status: filterStatus } : {},
// //       });
// //       setOrders(res.data?.data || []);
// //     } catch (e) {
// //       console.error(e);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchOrders();
// //   }, [filterStatus]);

// //   if (loading) {
// //     return <LoadingSpinner fullScreen />;
// //   }

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <View style={styles.header}>
// //         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
// //           <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
// //           <Text style={styles.headerTitle}>All Orders</Text>
// //         </TouchableOpacity>
// //       </View>

// //       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
// //         {[
// //           { label: 'All', value: '' },
// //           { label: 'Placed', value: 'PLACED' },
// //           { label: 'Accepted', value: 'ACCEPTED' },
// //           { label: 'Preparing', value: 'PREPARING' },
// //           { label: 'Ready', value: 'READY' },
// //           { label: 'Delivered', value: 'DELIVERED' },
// //         ].map((item) => (
// //           <TouchableOpacity
// //             key={item.value}
// //             onPress={() => setFilterStatus(item.value)}
// //             style={[styles.filterTab, filterStatus === item.value && styles.activeFilterTab]}
// //           >
// //             <Text style={[styles.filterTabText, filterStatus === item.value && styles.activeFilterTabText]}>
// //               {item.label}
// //             </Text>
// //           </TouchableOpacity>
// //         ))}
// //       </ScrollView>

// //       <ScrollView contentContainerStyle={styles.scrollContent}>
// //         {orders.length === 0 ? (
// //           <View style={styles.emptyContainer}>
// //             <Text style={styles.emptyText}>No orders match the filter.</Text>
// //           </View>
// //         ) : (
// //           orders.map((order) => (
// //             <View key={order.id} style={styles.orderCard}>
// //               <View style={styles.orderHeader}>
// //                 <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
// //                 <Text style={styles.orderStatusText}>{order.status}</Text>
// //               </View>
// //               <View style={styles.orderItems}>
// //                 {order.items?.map((item: any) => (
// //                   <Text key={item.id} style={styles.itemText}>
// //                     • {item.itemName || item.name} &times; {item.quantity}
// //                   </Text>
// //                 ))}
// //               </View>
// //               <Text style={styles.orderPrice}>Total: ₹{parseFloat(order.totalAmount).toFixed(0)}</Text>
// //             </View>
// //           ))
// //         )}
// //       </ScrollView>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: Colors.bg,
// //   },
// //   header: {
// //     height: 56,
// //     backgroundColor: '#fff',
// //     borderBottomWidth: 1,
// //     borderBottomColor: Colors.gray100,
// //     justifyContent: 'center',
// //     paddingHorizontal: Spacing.base,
// //   },
// //   backBtn: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //   },
// //   headerTitle: {
// //     fontSize: 16,
// //     fontWeight: '900',
// //     color: Colors.textPrimary,
// //   },
// //   filterBar: {
// //     maxHeight: 52,
// //     backgroundColor: '#fff',
// //     borderBottomWidth: 1,
// //     borderBottomColor: Colors.gray100,
// //     paddingVertical: 10,
// //     paddingHorizontal: Spacing.base,
// //   },
// //   filterTab: {
// //     paddingHorizontal: Spacing.md,
// //     paddingVertical: 6,
// //     borderRadius: Radius.full,
// //     borderWidth: 1,
// //     borderColor: Colors.gray200,
// //     marginRight: Spacing.sm,
// //   },
// //   activeFilterTab: {
// //     backgroundColor: Colors.red,
// //     borderColor: Colors.red,
// //   },
// //   filterTabText: {
// //     fontSize: 11,
// //     fontWeight: '700',
// //     color: Colors.gray500,
// //   },
// //   activeFilterTabText: {
// //     color: '#fff',
// //   },
// //   scrollContent: {
// //     padding: Spacing.base,
// //     gap: Spacing.base,
// //   },
// //   emptyContainer: {
// //     backgroundColor: '#fff',
// //     padding: Spacing.xl,
// //     borderRadius: Radius.lg,
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderColor: Colors.gray100,
// //   },
// //   emptyText: {
// //     color: Colors.gray400,
// //     fontSize: 12,
// //   },
// //   orderCard: {
// //     backgroundColor: '#fff',
// //     borderRadius: Radius.lg,
// //     padding: Spacing.base,
// //     borderWidth: 1,
// //     borderColor: Colors.gray100,
// //     ...Shadow.sm,
// //   },
// //   orderHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     borderBottomWidth: 1,
// //     borderBottomColor: Colors.gray100,
// //     paddingBottom: Spacing.sm,
// //     marginBottom: Spacing.sm,
// //   },
// //   orderNumber: {
// //     fontSize: 13,
// //     fontWeight: '800',
// //     color: Colors.textPrimary,
// //   },
// //   orderStatusText: {
// //     fontSize: 11,
// //     fontWeight: '800',
// //     color: Colors.red,
// //   },
// //   orderItems: {
// //     marginBottom: Spacing.sm,
// //   },
// //   itemText: {
// //     fontSize: 12,
// //     color: Colors.gray700,
// //   },
// //   orderPrice: {
// //     fontSize: 12,
// //     fontWeight: '800',
// //     color: Colors.textPrimary,
// //   },
// // });















// import React, {
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import {
//   SafeAreaView,
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   RefreshControl,
//   TextInput,
// } from "react-native";

// import { Ionicons } from "@expo/vector-icons";

// import { api } from "../../lib/axios";

// import {
//   Colors,
//   Radius,
//   Shadow,
//   Spacing,
// } from "../../constants/theme";

// import LoadingSpinner from "../../components/LoadingSpinner";

// type OrderStatus =
//   | "PLACED"
//   | "PREPARING"
//   | "READY"
//   | "DELIVERED"
//   | "REJECTED";

// const tabs = [
//   {
//     key: "PLACED",
//     label: "New",
//   },
//   {
//     key: "PREPARING",
//     label: "Preparing",
//   },
//   {
//     key: "READY",
//     label: "Ready",
//   },
//   {
//     key: "DELIVERED",
//     label: "Completed",
//   },
//   {
//     key: "REJECTED",
//     label: "Rejected",
//   },
// ];

// export default function VendorOrdersScreen({
//   navigation,
// }: any) {

//   const [orders, setOrders] =
//     useState<any[]>([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [refreshing, setRefreshing] =
//     useState(false);

//   const [status, setStatus] =
//     useState<OrderStatus>("PLACED");

//   const [search, setSearch] =
//     useState("");

//   const fetchOrders = async () => {

//     try {

//       const res = await api.get(
//         "/api/vendor/orders",
//         {
//           params: {
//             status,
//           },
//         }
//       );

//       setOrders(res.data.data || []);

//     } catch (err) {

//       console.log(err);

//     } finally {

//       setLoading(false);

//       setRefreshing(false);

//     }

//   };

//   useEffect(() => {

//     fetchOrders();

//   }, [status]);

//   const onRefresh = () => {

//     setRefreshing(true);

//     fetchOrders();

//   };

//   const filteredOrders =
//     useMemo(() => {

//       if (!search.trim())
//         return orders;

//       return orders.filter((o) => {

//         return (
//           String(o.id)
//             .includes(search) ||

//           o.customerName
//             ?.toLowerCase()
//             .includes(
//               search.toLowerCase()
//             )
//         );

//       });

//     }, [orders, search]);

//   const updateStatus = async (
//     orderId: number,
//     action:
//       | "accept"
//       | "reject"
//       | "preparing"
//       | "ready"
//   ) => {

//     try {

//       await api.patch(
//         `/api/vendor/orders/${orderId}/${action}`
//       );

//       fetchOrders();

//     } catch (err) {

//       console.log(err);

//     }

//   };

//   if (loading)
//     return (
//       <LoadingSpinner fullScreen />
//     );

//   const renderOrder = ({
//     item,
//   }: any) => {

//     return (

//       <View style={styles.card}>

//         <View style={styles.headerRow}>

//           <View>

//             <Text
//               style={styles.orderId}
//             >
//               #{item.orderNumber}
//             </Text>

//             <Text
//               style={styles.customer}
//             >
//               {item.customerName}
//             </Text>

//           </View>

//           <View
//             style={styles.statusBadge}
//           >

//             <Text
//               style={
//                 styles.statusText
//               }
//             >
//               {item.status}
//             </Text>

//           </View>

//         </View>

//         <View style={styles.row}>

//           <Ionicons
//             name="receipt-outline"
//             size={16}
//             color={
//               Colors.gray500
//             }
//           />

//           <Text
//             style={styles.info}
//           >
//             {item.totalItems} Items
//           </Text>

//         </View>

//         <View style={styles.row}>

//           <Ionicons
//             name="cash-outline"
//             size={16}
//             color={
//               Colors.gray500
//             }
//           />

//           <Text
//             style={styles.info}
//           >
//             ₹
//             {Number(
//               item.totalAmount
//             ).toFixed(0)}
//           </Text>

//         </View>

//         <View style={styles.row}>

//           <Ionicons
//             name="card-outline"
//             size={16}
//             color={
//               Colors.gray500
//             }
//           />

//           <Text
//             style={styles.info}
//           >
//             {item.paymentMethod}
//           </Text>

//         </View>

//                 {item.status === "PLACED" && (

//           <View style={styles.buttonRow}>

//             <TouchableOpacity
//               style={styles.rejectButton}
//               onPress={() =>
//                 updateStatus(
//                   item.id,
//                   "reject"
//                 )
//               }
//             >
//               <Ionicons
//                 name="close-circle-outline"
//                 size={18}
//                 color="#fff"
//               />

//               <Text style={styles.buttonText}>
//                 Reject
//               </Text>

//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.acceptButton}
//               onPress={() =>
//                 updateStatus(
//                   item.id,
//                   "accept"
//                 )
//               }
//             >
//               <Ionicons
//                 name="checkmark-circle-outline"
//                 size={18}
//                 color="#fff"
//               />

//               <Text style={styles.buttonText}>
//                 Accept
//               </Text>

//             </TouchableOpacity>

//           </View>

//         )}

//         {item.status === "PREPARING" && (

//           <TouchableOpacity
//             style={styles.fullButton}
//             onPress={() =>
//               updateStatus(
//                 item.id,
//                 "ready"
//               )
//             }
//           >

//             <Ionicons
//               name="restaurant-outline"
//               size={18}
//               color="#fff"
//             />

//             <Text style={styles.buttonText}>
//               Mark Ready
//             </Text>

//           </TouchableOpacity>

//         )}

//         {item.status === "ACCEPTED" && (

//           <TouchableOpacity
//             style={styles.fullButton}
//             onPress={() =>
//               updateStatus(
//                 item.id,
//                 "preparing"
//               )
//             }
//           >

//             <Ionicons
//               name="flame-outline"
//               size={18}
//               color="#fff"
//             />

//             <Text style={styles.buttonText}>
//               Start Preparing
//             </Text>

//           </TouchableOpacity>

//         )}

//       </View>

//     );

//   };

//   return (

//     <SafeAreaView style={styles.container}>

//       <View style={styles.header}>

//         <TouchableOpacity
//           onPress={() =>
//             navigation.goBack()
//           }
//         >
//           <Ionicons
//             name="chevron-back"
//             size={24}
//             color={Colors.textPrimary}
//           />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>
//           Orders
//         </Text>

//         <TouchableOpacity
//           onPress={fetchOrders}
//         >
//           <Ionicons
//             name="refresh"
//             size={24}
//             color={Colors.red}
//           />
//         </TouchableOpacity>

//       </View>

//       <View style={styles.searchContainer}>

//         <Ionicons
//           name="search"
//           size={18}
//           color={Colors.gray400}
//         />

//         <TextInput
//           value={search}
//           onChangeText={setSearch}
//           placeholder="Search order..."
//           style={styles.searchInput}
//         />

//       </View>

//       <FlatList

//         horizontal

//         data={tabs}

//         showsHorizontalScrollIndicator={false}

//         contentContainerStyle={
//           styles.tabsContainer
//         }

//         keyExtractor={(i) => i.key}

//         renderItem={({ item }) => (

//           <TouchableOpacity
//             onPress={() =>
//               setStatus(
//                 item.key as OrderStatus
//               )
//             }
//             style={[
//               styles.tab,

//               status === item.key &&
//                 styles.activeTab,
//             ]}
//           >

//             <Text
//               style={[
//                 styles.tabText,

//                 status === item.key &&
//                   styles.activeTabText,
//               ]}
//             >
//               {item.label}
//             </Text>

//           </TouchableOpacity>

//         )}

//       />

//       <FlatList

//         data={filteredOrders}

//         keyExtractor={(item) =>
//           item.id.toString()
//         }

//         renderItem={renderOrder}

//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//           />
//         }

//         contentContainerStyle={
//           styles.list
//         }

//         ListEmptyComponent={() => (

//           <View style={styles.emptyBox}>

//             <Ionicons
//               name="receipt-outline"
//               size={80}
//               color={Colors.gray300}
//             />

//             <Text style={styles.emptyTitle}>
//               No Orders Found
//             </Text>

//             <Text style={styles.emptySubtitle}>
//               Orders will appear here.
//             </Text>

//           </View>

//         )}

//       />

//     </SafeAreaView>

//   );

// };

// const styles = StyleSheet.create({

//   container: {
//     flex: 1,
//     backgroundColor: Colors.bg,
//   },

//   header: {
//     height: 58,
//     backgroundColor: "#fff",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: Spacing.base,
//   },

//   headerTitle: {
//     fontSize: 19,
//     fontWeight: "900",
//     color: Colors.textPrimary,
//   },

//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     margin: Spacing.base,
//     backgroundColor: "#fff",
//     borderRadius: Radius.md,
//     borderWidth: 1,
//     borderColor: Colors.gray200,
//     paddingHorizontal: 14,
//     height: 50,
//   },

//   searchInput: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 15,
//   },

//   tabsContainer: {
//     paddingHorizontal: Spacing.base,
//     paddingBottom: 15,
//     gap: 10,
//   },

//   tab: {
//     paddingHorizontal: 18,
//     paddingVertical: 10,
//     borderRadius: 50,
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: Colors.gray200,
//     marginRight: 10,
//   },

//   activeTab: {
//     backgroundColor: Colors.red,
//     borderColor: Colors.red,
//   },

//   tabText: {
//     fontWeight: "700",
//     color: Colors.textPrimary,
//   },

//   activeTabText: {
//     color: "#fff",
//   },

//   list: {
//     padding: Spacing.base,
//     gap: 16,
//     paddingBottom: 40,
//   },

//   card: {
//     backgroundColor: "#fff",
//     borderRadius: Radius.lg,
//     padding: 16,
//     ...Shadow.sm,
//   },

//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },

//   orderId: {
//     fontWeight: "900",
//     fontSize: 17,
//     color: Colors.textPrimary,
//   },

//   customer: {
//     marginTop: 5,
//     color: Colors.gray500,
//   },

//   statusBadge: {
//     backgroundColor: "#FEF3C7",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 30,
//   },

//   statusText: {
//     fontWeight: "800",
//     color: "#92400E",
//     fontSize: 12,
//   },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 14,
//   },

//   info: {
//     marginLeft: 10,
//     color: Colors.gray600,
//   },

//   buttonRow: {
//     flexDirection: "row",
//     gap: 12,
//     marginTop: 22,
//   },

//   rejectButton: {
//     flex: 1,
//     height: 48,
//     backgroundColor: "#EF4444",
//     borderRadius: Radius.md,
//     justifyContent: "center",
//     alignItems: "center",
//     flexDirection: "row",
//     gap: 8,
//   },

//   acceptButton: {
//     flex: 1,
//     height: 48,
//     backgroundColor: "#16A34A",
//     borderRadius: Radius.md,
//     justifyContent: "center",
//     alignItems: "center",
//     flexDirection: "row",
//     gap: 8,
//   },

//   fullButton: {
//     marginTop: 22,
//     height: 50,
//     backgroundColor: Colors.red,
//     borderRadius: Radius.md,
//     justifyContent: "center",
//     alignItems: "center",
//     flexDirection: "row",
//     gap: 8,
//   },

//   buttonText: {
//     color: "#fff",
//     fontWeight: "800",
//   },

//   emptyBox: {
//     alignItems: "center",
//     marginTop: 100,
//   },

//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: "900",
//     marginTop: 20,
//     color: Colors.textPrimary,
//   },

//   emptySubtitle: {
//     marginTop: 8,
//     color: Colors.gray500,
//   },

// });









import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { api } from "../../lib/axios";

import LoadingSpinner from "../../components/LoadingSpinner";

import {
  Colors,
  Radius ,
  Shadow,
  Spacing,
} from "../../constants/theme";


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  header: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },

  searchBox: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
    ...Shadow.sm,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#111827",
  },

  tabContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  tab: {
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  activeTab: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
  },

  activeTabText: {
    color: "#fff",
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    ...Shadow.md,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  orderNumber: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  date: {
    marginTop: 5,
    color: "#6B7280",
    fontSize: 12,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
  },

  amountRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  amountLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  amount: {
    marginTop: 3,
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },

  paymentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4F4",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
  },

  paymentText: {
    marginLeft: 6,
    fontWeight: "700",
    color: Colors.red,
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 22,
  },

  rejectBtn: {
    flex: 1,
    height: 48,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginRight: 8,
  },

  acceptBtn: {
    flex: 1,
    height: 48,
    backgroundColor: "#16A34A",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 8,
  },

  fullButton: {
    marginTop: 22,
    height: 50,
    backgroundColor: Colors.red,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  actionText: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  emptySubtitle: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 14,
  },

});

type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "REJECTED";

const tabs = [
  {
    label: "New",
    value: "PLACED",
  },
  {
    label: "Preparing",
    value: "PREPARING",
  },
  {
    label: "Ready",
    value: "READY",
  },
  {
    label: "Completed",
    value: "DELIVERED",
  },
];

export default function VendorOrdersScreen({
  navigation,
}: any) {

  const [orders, setOrders] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [status, setStatus] =
    useState<OrderStatus>("PLACED");

  const [search, setSearch] =
    useState("");

  const loadOrders = async () => {

    try {

      const res = await api.get(
        "/api/vendor/orders",
        {
          params: {
            status,
          },
        }
      );

      setOrders(
        res.data.data ?? []
      );

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };

  useEffect(() => {

    loadOrders();

  }, [status]);

  const onRefresh = () => {

    setRefreshing(true);

    loadOrders();

  };

  const filteredOrders =
    useMemo(() => {

      if (!search.trim())
        return orders;

      return orders.filter((order) =>
        order.orderNumber
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );

    }, [orders, search]);

  const updateStatus = async (
    id: number,
    action:
      | "accept"
      | "reject"
      | "preparing"
      | "ready"
  ) => {

    try {

      await api.patch(
        `/api/vendor/orders/${id}/${action}`
      );

      loadOrders();

    } catch (err) {

      console.log(err);

    }

  };

  const badgeColor = (
    status: string
  ) => {

    switch (status) {

      case "PLACED":
        return "#F59E0B";

      case "ACCEPTED":
        return "#2563EB";

      case "PREPARING":
        return "#7C3AED";

      case "READY":
        return "#16A34A";

      case "DELIVERED":
        return "#15803D";

      case "REJECTED":
        return "#DC2626";

      default:
        return Colors.gray400;

    }

  };

  const formatDate = (
    date: string
  ) => {

    return new Date(
      date
    ).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });

  };

  if (loading) {

    return (
      <LoadingSpinner fullScreen />
    );

  }

  const renderOrder = ({ item }: any) => {

  const color = badgeColor(item.status);

  return (

    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() =>
        navigation.navigate(
          "VendorOrderDetails",
          {
            orderId: item.id,
          }
        )
      }
    >

      <View style={styles.cardHeader}>

        <View style={{ flex: 1 }}>

          <Text
            numberOfLines={1}
            style={styles.orderNumber}
          >
            {item.orderNumber}
          </Text>

          <Text style={styles.date}>
            {formatDate(item.createdAt)}
          </Text>

        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: color,
            },
          ]}
        >

          <Text style={styles.badgeText}>
            {item.status}
          </Text>

        </View>

      </View>

      <View style={styles.amountRow}>

        <View>

          <Text style={styles.amountLabel}>
            Order Amount
          </Text>

          <Text style={styles.amount}>
            ₹
            {Number(
              item.totalAmount
            ).toFixed(2)}
          </Text>

        </View>

        <View
          style={styles.paymentChip}
        >

          <Ionicons
            name="wallet-outline"
            size={16}
            color={Colors.red}
          />

          <Text
            style={styles.paymentText}
          >
            {item.paymentMethod}
          </Text>

        </View>

      </View>

      {item.status === "PLACED" && (

        <View style={styles.actionRow}>

          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() =>
              updateStatus(
                item.id,
                "reject"
              )
            }
          >

            <Ionicons
              name="close"
              size={18}
              color="#fff"
            />

            <Text
              style={styles.actionText}
            >
              Reject
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() =>
              updateStatus(
                item.id,
                "accept"
              )
            }
          >

            <Ionicons
              name="checkmark"
              size={18}
              color="#fff"
            />

            <Text
              style={styles.actionText}
            >
              Accept
            </Text>

          </TouchableOpacity>

        </View>

      )}

      {item.status ===
        "ACCEPTED" && (

        <TouchableOpacity
          style={styles.fullButton}
          onPress={() =>
            updateStatus(
              item.id,
              "preparing"
            )
          }
        >

          <Ionicons
            name="flame-outline"
            size={18}
            color="#fff"
          />

          <Text
            style={styles.actionText}
          >
            Start Preparing
          </Text>

        </TouchableOpacity>

      )}

      {item.status ===
        "PREPARING" && (

        <TouchableOpacity
          style={styles.fullButton}
          onPress={() =>
            updateStatus(
              item.id,
              "ready"
            )
          }
        >

          <Ionicons
            name="restaurant"
            size={18}
            color="#fff"
          />

          <Text
            style={styles.actionText}
          >
            Mark Ready
          </Text>

        </TouchableOpacity>

      )}

    </TouchableOpacity>

  );

};

return (

  <SafeAreaView
    style={styles.container}
  >

    <View style={styles.header}>

      <TouchableOpacity
        onPress={() =>
          navigation.goBack()
        }
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={
            Colors.textPrimary
          }
        />
      </TouchableOpacity>

      <Text
        style={styles.headerTitle}
      >
        Orders
      </Text>

      <TouchableOpacity
        onPress={loadOrders}
      >
        <Ionicons
          name="refresh"
          size={22}
          color={Colors.red}
        />
      </TouchableOpacity>

    </View>

    <View
      style={styles.searchBox}
    >

      <Ionicons
        name="search"
        size={18}
        color={Colors.gray400}
      />

      <TextInput
        placeholder="Search order..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
        placeholderTextColor={
          Colors.gray400
        }
      />

    </View>

    <FlatList

      horizontal

      data={tabs}

      keyExtractor={(i) =>
        i.value
      }

      showsHorizontalScrollIndicator={
        false
      }

      contentContainerStyle={
        styles.tabContainer
      }

      renderItem={({ item }) => (

        <TouchableOpacity
          onPress={() =>
            setStatus(
              item.value as OrderStatus
            )
          }
          style={[
            styles.tab,

            status ===
              item.value &&
              styles.activeTab,
          ]}
        >

          <Text
            style={[
              styles.tabText,

              status ===
                item.value &&
                styles.activeTabText,
            ]}
          >
            {item.label}
          </Text>

        </TouchableOpacity>

      )}

    />

    <FlatList

      data={filteredOrders}

      keyExtractor={(i) =>
        i.id.toString()
      }

      renderItem={renderOrder}

      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }

      showsVerticalScrollIndicator={
        false
      }

      contentContainerStyle={
        filteredOrders.length === 0
          ? styles.emptyContainer
          : styles.list
      }

      ListEmptyComponent={() => (

        <View
          style={styles.empty}
        >

          <Ionicons
            name="bag-handle-outline"
            size={70}
            color={Colors.gray300}
          />

          <Text
            style={styles.emptyTitle}
          >
            No Orders
          </Text>

          <Text
            style={styles.emptySubtitle}
          >
            Orders will appear here
          </Text>

        </View>

      )}

    />

  </SafeAreaView>

);


}
