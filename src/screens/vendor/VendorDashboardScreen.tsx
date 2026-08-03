// // src/screens/vendor/VendorDashboardScreen.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
// } from 'react-native';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState } from '../../store/store';
// import { api } from '../../lib/axios';
// import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
// import { Ionicons } from '@expo/vector-icons';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import { useNavigation } from '@react-navigation/native';
// import { handleLogoutImmediate } from '../../utils/auth';

// export default function VendorDashboardScreen({ navigation }: any) {
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state: RootState) => state.auth);

//   const [summary, setSummary] = useState<any>(null);
//   const [orders, setOrders] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchDashboardData = async () => {
//     try {
//       const [summaryRes, ordersRes] = await Promise.all([
//         api.get('/api/vendor/analytics/summary'),
//         api.get('/api/vendor/orders'),
//       ]);
//       setSummary(summaryRes.data?.data);
//       setOrders(ordersRes.data?.data || []);
//     } catch (e) {
//       console.error('Error fetching vendor dashboard:', e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigation.replace('Login');
//       return;
//     }
//     fetchDashboardData();
//   }, [isAuthenticated]);

//   const handleUpdateStatus = async (orderId: number, action: 'accept' | 'reject' | 'preparing' | 'ready') => {
//     try {
//       await api.patch(`/api/vendor/orders/${orderId}/${action}`);
//       fetchDashboardData();
//     } catch (e) {
//       console.error(`Error status update:`, e);
//     }
//   };

//   const handleSignOut = () => {
//     handleLogoutImmediate(dispatch, navigation);
//   };

//   if (loading) {
//     return <LoadingSpinner fullScreen />;
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Vendor Dashboard</Text>
//         <TouchableOpacity onPress={handleSignOut}>
//           <Ionicons name="log-out-outline" size={22} color={Colors.red} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

//         {/* Analytics Grid */}
//         <View style={styles.analyticsGrid}>
//           <View style={styles.analyticsCard}>
//              <View style={styles.analyticsIcon}>
//         <Ionicons
//             name="wallet-outline"
//             size={22}
//             color={Colors.red}
//         />
//     </View>
//             <Text style={styles.cardLabel}>Total Earnings</Text>
//             <Text style={styles.cardVal}>₹{summary?.totalRevenue || '0.00'}</Text>
//           </View>
//           <View style={styles.analyticsCard}>
//              <View style={styles.analyticsIcon}>
//         <Ionicons
//             name="cart-outline"
//             size={22}
//             color={Colors.red}
//         />
//     </View>
//             <Text style={styles.cardLabel}>Orders Completed</Text>
//             <Text style={styles.cardVal}>{summary?.totalOrders || '0'}</Text>
//           </View>
//         </View>

//         {/* Recent Orders List */}
//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>Recent Orders</Text>
//         </View>

//         {orders.length === 0 ? (
//           <View style={styles.emptyBox}>
//             <Text style={styles.emptyText}>No orders received yet.</Text>
//           </View>
//         ) : (
//           <View style={styles.ordersList}>
//             {orders.map((item) => (
//               <View key={item.id} style={styles.orderCard}>
//                 <View style={styles.orderHeader}>
//                   <Text style={styles.orderNum}>Order #{item.orderNumber}</Text>
                  
//                   <Text style={styles.orderStatus}>{item.status}</Text>
//                 </View>

//                 <View style={styles.itemsBlock}>
//                   {item.items?.map((itemDetail: any) => (
//                     <Text key={itemDetail.id} style={styles.itemText}>
//                       • {itemDetail.itemName || itemDetail.name} &times; {itemDetail.quantity}
//                     </Text>
//                   ))}
//                 </View>

//                 <Text style={styles.orderAmount}>Total: ₹{parseFloat(item.totalAmount).toFixed(0)}</Text>

//                 {/* Actions depending on status */}
//                 {item.status === 'PLACED' && (
//                   <View style={styles.actionsRow}>
//                     <TouchableOpacity
//                       style={[styles.btn, styles.rejectBtn]}
//                       onPress={() => handleUpdateStatus(item.id, 'reject')}
//                     >
//                       <Text style={styles.rejectBtnText}>Reject</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={[styles.btn, styles.acceptBtn]}
//                       onPress={() => handleUpdateStatus(item.id, 'accept')}
//                     >
//                       <Text style={styles.acceptBtnText}>Accept</Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}

//                 {item.status === 'ACCEPTED' && (
//                   <TouchableOpacity
//                     style={[styles.btn, styles.primaryBtn]}
//                     onPress={() => handleUpdateStatus(item.id, 'preparing')}
//                   >
//                     <Text style={styles.primaryBtnText}>Start Preparing</Text>
//                   </TouchableOpacity>
//                 )}

//                 {item.status === 'PREPARING' && (
//                   <TouchableOpacity
//                     style={[styles.btn, styles.primaryBtn]}
//                     onPress={() => handleUpdateStatus(item.id, 'ready')}
//                   >
//                     <Text style={styles.primaryBtnText}>Mark Ready</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             ))}
//           </View>
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
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: Spacing.base,
//   },
//   headerTitle: {
//     fontSize: 16,
//     fontWeight: '900',
//     color: Colors.textPrimary,
//   },
//   scrollContent: {
//     padding: Spacing.base,
//     gap: Spacing.base,
//     paddingBottom: Spacing['3xl'],
//   },
//   sidebarRow: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: Radius.lg,
//     padding: Spacing.md,
//     justifyContent: 'space-between',
//     borderWidth: 1,
//     borderColor: Colors.gray100,
//     ...Shadow.sm,
//   },
//   sidebarBtn: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   sidebarBtnText: {
//     fontSize: 10,
//     fontWeight: '700',
//     color: Colors.textPrimary,
//     marginTop: 4,
//   },
//   analyticsGrid: {
//     flexDirection: 'row',
//     gap: Spacing.base,
//   },
//   analyticsCard:{
//     flex:1,
//     backgroundColor:"#fff",
//     borderRadius:18,
//     padding:18,
//     ...Shadow.md,
//     borderWidth:0
// },

// analyticsIcon:{
//     width:42,
//     height:42,
//     borderRadius:21,
//     backgroundColor:"#FFF2F2",
//     justifyContent:"center",
//     alignItems:"center",
//     marginBottom:12
// },

// cardVal:{
//     fontSize:26,
//     fontWeight:"900",
//     color:Colors.textPrimary
// },

// cardLabel:{
//     marginTop:4,
//     color:Colors.gray500,
//     fontSize:13,
//     fontWeight:"700"
// },
//   sectionHeader: {
//     marginTop: Spacing.sm,
//   },
//   sectionTitle: {
//     fontSize: 15,
//     fontWeight: '900',
//     color: Colors.textPrimary,
//   },
//   emptyBox: {
//     backgroundColor: '#fff',
//     borderRadius: Radius.lg,
//     padding: Spacing.xl,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: Colors.gray100,
//   },
//   emptyText: {
//     color: Colors.gray500,
//     fontSize: 12,
//   },
//   ordersList: {
//     gap: Spacing.base,
//   },
//   orderCard: {
//     backgroundColor: '#fff',
//     borderRadius: Radius.lg,
//     padding: Spacing.base,
//     borderWidth: 9,
//     borderColor: Colors.gray100,
//     ...Shadow.sm,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.gray100,
//     paddingBottom: Spacing.sm,
//     marginBottom: Spacing.sm,
//   },
//   orderNum: {
//     fontSize: 14,
//     fontWeight: '800',
//     color: Colors.textPrimary,
//   },
//   orderStatus: {
//     fontSize: 11,
//     fontWeight: '800',
//     color: Colors.red,
//   },
//   itemsBlock: {
//     marginBottom: Spacing.sm,
//   },
//   itemText: {
//     fontSize: 12,
//     color: Colors.gray700,
//     lineHeight: 16,
//   },
//   orderAmount: {
//     fontSize: 12,
//     fontWeight: '800',
//     color: Colors.textPrimary,
//     marginBottom: Spacing.md,
//   },
//   actionsRow: {
//     flexDirection: 'row',
//     gap: Spacing.sm,
//   },
//   btn: {
//     flex: 1,
//     height: 38,
//     borderRadius: Radius.sm,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   rejectBtn: {
//     borderWidth: 1,
//     borderColor: Colors.redBorder,
//     backgroundColor: Colors.redBg,
//   },
//   rejectBtnText: {
//     color: Colors.red,
//     fontWeight: '800',
//     fontSize: 12,
//   },
//   acceptBtn: {
//     backgroundColor: Colors.red,
//   },
//   acceptBtnText: {
//     color: '#fff',
//     fontWeight: '800',
//     fontSize: 12,
//   },
//  primaryBtn: {
//   backgroundColor: Colors.red,
//   height: 42,
//   borderRadius: Radius.md,
//   justifyContent: 'center',
//   alignItems: 'center',
// },
//   primaryBtnText: {
//     color: '#fff',
//     fontWeight: '800',
//     fontSize: 18,
//   },
// });




// VendorDashboardScreen.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { api } from "../../lib/axios";
import { Colors, Radius, Shadow, Spacing } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import LoadingSpinner from "../../components/LoadingSpinner";
import { handleLogoutImmediate } from "../../utils/auth";

export default function VendorDashboardScreen({ navigation }: any) {
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [summary, setSummary] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [summaryRes, ordersRes] = await Promise.all([
        api.get("/api/vendor/analytics/summary"),
        api.get("/api/vendor/orders"),
      ]);

      setSummary(summaryRes.data.data);

      const latestOrders = (ordersRes.data.data || []).sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setOrders(latestOrders);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace("Login");
      return;
    }

    fetchDashboard();
  }, [isAuthenticated]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, []);

  const logout = () => {
    handleLogoutImmediate(dispatch, navigation);
  };

  const updateStatus = async (
    id: number,
    action: "accept" | "reject" | "preparing" | "ready"
  ) => {
    try {
      await api.patch(`/api/vendor/orders/${id}/${action}`);
      fetchDashboard();
    } catch (e) {
      console.log(e);
    }
  };

  const preparingCount = useMemo(
    () => orders.filter((x) => x.status === "PREPARING").length,
    [orders]
  );

  const readyCount = useMemo(
    () => orders.filter((x) => x.status === "READY").length,
    [orders]
  );

  const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";

    if (hour < 17) return "Good Afternoon";

    return "Good Evening";
  };

  const badgeColor = (status: string) => {
    switch (status) {
      case "PLACED":
        return {
          bg: "#F3F4F6",
          text: "#374151",
        };

      case "ACCEPTED":
        return {
          bg: "#DBEAFE",
          text: "#2563EB",
        };

      case "PREPARING":
        return {
          bg: "#FEF3C7",
          text: "#D97706",
        };

      case "READY":
        return {
          bg: "#DCFCE7",
          text: "#16A34A",
        };

      case "DELIVERED":
        return {
          bg: "#DCFCE7",
          text: "#15803D",
        };

      default:
        return {
          bg: "#F3F4F6",
          text: "#374151",
        };
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {greeting()} 👋
            </Text>
{/* 
            <Text style={styles.restaurant}>
              {user?.restaurantName || "Vendor"}
            </Text> */}
          </View>

          <TouchableOpacity
            style={styles.logout}
            onPress={logout}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color={Colors.red}
            />
          </TouchableOpacity>
        </View>

        {/* ANALYTICS */}

        <View style={styles.analyticsRow}>

          <View style={styles.analyticsCard}>

            <View style={styles.iconCircle}>
              <Ionicons
                name="wallet-outline"
                size={20}
                color={Colors.red}
              />
            </View>

            <Text style={styles.analyticsValue}>
              ₹{summary?.totalRevenue || 0}
            </Text>

            <Text style={styles.analyticsTitle}>
              Revenue
            </Text>

          </View>

          <View style={styles.analyticsCard}>

            <View style={styles.iconCircle}>
              <Ionicons
                name="bag-handle-outline"
                size={20}
                color={Colors.red}
              />
            </View>

            <Text style={styles.analyticsValue}>
              {summary?.totalOrders || 0}
            </Text>

            <Text style={styles.analyticsTitle}>
              Orders
            </Text>

          </View>

        </View>

        <View style={styles.analyticsRow}>

          <View style={styles.analyticsCard}>

            <View style={styles.iconCircle}>
              <Ionicons
                name="restaurant-outline"
                size={20}
                color={Colors.red}
              />
            </View>

            <Text style={styles.analyticsValue}>
              {preparingCount}
            </Text>

            <Text style={styles.analyticsTitle}>
              Preparing
            </Text>

          </View>

          <View style={styles.analyticsCard}>

            <View style={styles.iconCircle}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={Colors.red}
              />
            </View>

            <Text style={styles.analyticsValue}>
              {readyCount}
            </Text>

            <Text style={styles.analyticsTitle}>
              Ready
            </Text>

          </View>

        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recent Orders ({orders.length})
          </Text>
        </View>

        {orders.length === 0 ? (
  <View style={styles.emptyContainer}>
    <Ionicons
      name="receipt-outline"
      size={60}
      color={Colors.gray300}
    />

    <Text style={styles.emptyTitle}>
      No Orders Yet
    </Text>

    <Text style={styles.emptySubtitle}>
      New customer orders will appear here.
    </Text>
  </View>
) : (
  <View style={styles.ordersContainer}>
    {orders.map((order) => {
      const badge = badgeColor(order.status);

      return (
        <View
          key={order.id}
          style={styles.orderCard}
        >
          {/* HEADER */}

          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>
                #{order.orderNumber}
              </Text>

              <Text style={styles.orderDate}>
                {formatDate(order.createdAt)}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: badge.bg,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: badge.text,
                  },
                ]}
              >
                {order.status}
              </Text>
            </View>
          </View>

          {/* ITEMS */}

          <View style={styles.itemsContainer}>
            {order.items?.map((item: any) => (
              <View
                key={item.id}
                style={styles.itemRow}
              >
                <Ionicons
                  name="ellipse"
                  size={6}
                  color={Colors.red}
                />

                <Text style={styles.itemText}>
                  {item.itemName || item.name}
                </Text>

                <Text style={styles.qtyText}>
                  × {item.quantity}
                </Text>
              </View>
            ))}
          </View>

          {/* TOTAL */}

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>
                Total Amount
              </Text>

              <Text style={styles.totalPrice}>
                ₹{Number(order.totalAmount).toFixed(0)}
              </Text>
            </View>

            <Ionicons
              name="cash-outline"
              size={26}
              color={Colors.red}
            />
          </View>

          {/* ACTION BUTTONS */}

          {order.status === "PLACED" && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() =>
                  updateStatus(order.id, "reject")
                }
              >
                <Ionicons
                  name="close"
                  color={Colors.red}
                  size={18}
                />

                <Text style={styles.rejectText}>
                  Reject
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() =>
                  updateStatus(order.id, "accept")
                }
              >
                <Ionicons
                  name="checkmark"
                  color="#fff"
                  size={18}
                />

                <Text style={styles.acceptText}>
                  Accept
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {order.status === "ACCEPTED" && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                updateStatus(order.id, "preparing")
              }
            >
              <Ionicons
                name="restaurant"
                size={18}
                color="#fff"
              />

              <Text style={styles.primaryButtonText}>
                Start Preparing
              </Text>
            </TouchableOpacity>
          )}

          {order.status === "PREPARING" && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                updateStatus(order.id, "ready")
              }
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#fff"
              />

              <Text style={styles.primaryButtonText}>
                Mark Ready
              </Text>
            </TouchableOpacity>
          )}

          {order.status === "READY" && (
            <View style={styles.readyBox}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#16A34A"
              />

              <Text style={styles.readyText}>
                Waiting for Rider Pickup
              </Text>
            </View>
          )}

          {order.status === "DELIVERED" && (
            <View style={styles.deliveredBox}>
              <Ionicons
                name="checkmark-done-circle"
                size={20}
                color="#16A34A"
              />

              <Text style={styles.deliveredText}>
                Delivered Successfully
              </Text>
            </View>
          )}

          {order.status === "REJECTED" && (
            <View style={styles.rejectedBox}>
              <Ionicons
                name="close-circle"
                size={20}
                color="#DC2626"
              />

              <Text style={styles.rejectedText}>
                Order Rejected
              </Text>
            </View>
          )}
        </View>
      );
    })}
  </View>
)}

</ScrollView>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  greeting: {
    fontSize: 15,
    color: Colors.gray500,
    fontWeight: "600",
  },

  restaurant: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  logout: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.md,
  },

  analyticsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  analyticsCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    ...Shadow.md,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF3F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  analyticsValue: {
    fontSize: 26,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  analyticsTitle: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.gray500,
    fontWeight: "700",
  },

  sectionHeader: {
    marginTop: 10,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  emptyContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 50,
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.md,
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.gray500,
  },

  ordersContainer: {
    gap: 18,
  },

  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 20,
    ...Shadow.md,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  orderNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  orderDate: {
    marginTop: 5,
    color: Colors.gray500,
    fontSize: 12,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 50,
  },

  statusText: {
    fontWeight: "800",
    fontSize: 11,
  },

  itemsContainer: {
    marginBottom: 18,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  itemText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },

  qtyText: {
    fontWeight: "700",
    color: Colors.gray500,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ECECEC",
    paddingTop: 18,
    marginBottom: 18,
  },

  totalLabel: {
    fontSize: 12,
    color: Colors.gray500,
  },

  totalPrice: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "900",
    color: Colors.textPrimary,
  },
    actionRow: {
    flexDirection: "row",
    gap: 12,
  },

  rejectButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  rejectText: {
    marginLeft: 6,
    color: "#DC2626",
    fontWeight: "800",
    fontSize: 14,
  },

  acceptButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.red,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.sm,
  },

  acceptText: {
    marginLeft: 6,
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },

  primaryButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.red,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.sm,
  },

  primaryButtonText: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  readyBox: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  readyText: {
    marginLeft: 8,
    color: "#16A34A",
    fontWeight: "800",
    fontSize: 14,
  },

  deliveredBox: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  deliveredText: {
    marginLeft: 8,
    color: "#15803D",
    fontWeight: "800",
    fontSize: 14,
  },

  rejectedBox: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  rejectedText: {
    marginLeft: 8,
    color: "#DC2626",
    fontWeight: "800",
    fontSize: 14,
  },
});