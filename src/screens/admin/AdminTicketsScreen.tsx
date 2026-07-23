// src/screens/admin/AdminTicketsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { api } from '../../lib/axios';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminTicketsScreen({ navigation }: any) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseTexts, setResponseTexts] = useState<Record<number, string>>({});

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/admin/tickets');
      setTickets(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleRespond = async (ticketId: number) => {
    const text = responseTexts[ticketId];
    if (!text || !text.trim()) {
      Alert.alert('Error', 'Please enter a response message.');
      return;
    }
    try {
      await api.post(`/api/admin/tickets/${ticketId}/respond`, { response: text });
      Alert.alert('Success', 'Response submitted successfully.');
      setResponseTexts((prev) => ({ ...prev, [ticketId]: '' }));
      fetchTickets();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          <Text style={styles.headerTitle}>System Support Tickets</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tickets.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No support tickets open.</Text>
          </View>
        ) : (
          tickets.map((ticket) => (
            <View key={ticket.id} style={styles.ticketCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.subject}>Subject: {ticket.subject}</Text>
                <View style={[styles.priorityTag, { backgroundColor: ticket.priority === 'HIGH' ? Colors.redBg : Colors.gray100 }]}>
                  <Text style={[styles.priorityText, { color: ticket.priority === 'HIGH' ? Colors.red : Colors.gray500 }]}>
                    {ticket.priority}
                  </Text>
                </View>
              </View>
              <Text style={styles.ticketDesc}>Status: {ticket.status}</Text>
              {ticket.response && (
                <Text style={styles.existingResponse}>Resp: {ticket.response}</Text>
              )}

              {ticket.status !== 'RESOLVED' && (
                <View style={styles.actionBlock}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Enter reply response message"
                    value={responseTexts[ticket.id] || ''}
                    onChangeText={(val) => setResponseTexts((prev) => ({ ...prev, [ticket.id]: val }))}
                  />
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={() => handleRespond(ticket.id)}
                  >
                    <Text style={styles.submitBtnText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  emptyBox: {
    backgroundColor: '#fff',
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  emptyText: {
    color: Colors.gray400,
    fontSize: 12,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray100,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  subject: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  priorityTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '800',
  },
  ticketDesc: {
    fontSize: 11,
    color: Colors.gray500,
  },
  existingResponse: {
    fontSize: 11,
    color: Colors.greenText,
    backgroundColor: Colors.greenBg,
    padding: 6,
    borderRadius: Radius.sm,
    marginTop: Spacing.sm,
    fontWeight: '600',
  },
  actionBlock: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.sm,
    height: 38,
    paddingHorizontal: Spacing.md,
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: Colors.red,
    height: 34,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
});
