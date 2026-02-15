import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/auth-context';
import { supabase } from '../../src/lib/supabase';
import { Button } from '../../src/components';

interface Action {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  created_at: string;
  analyses: {
    name: string;
  };
}

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed';

export default function ActionsScreen() {
  const { user } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  useFocusEffect(
    useCallback(() => {
      fetchActions();
    }, [user])
  );

  const fetchActions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('actions')
      .select(`
        *,
        analyses!inner(name, user_id)
      `)
      .eq('analyses.user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setActions(data as Action[]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchActions();
  };

  const handleStatusChange = async (actionId: string, newStatus: string) => {
    const { error } = await supabase
      .from('actions')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', actionId);

    if (!error) {
      setActions(
        actions.map((a) =>
          a.id === actionId ? { ...a, status: newStatus as Action['status'] } : a
        )
      );
    }
  };

  const handleActionPress = (action: Action) => {
    const options = [];

    if (action.status === 'pending') {
      options.push({ text: '시작하기', onPress: () => handleStatusChange(action.id, 'in_progress') });
    }
    if (action.status === 'in_progress') {
      options.push({ text: '완료', onPress: () => handleStatusChange(action.id, 'completed') });
    }
    if (action.status !== 'dismissed') {
      options.push({ text: '무시하기', onPress: () => handleStatusChange(action.id, 'dismissed') });
    }
    if (action.status === 'completed' || action.status === 'dismissed') {
      options.push({ text: '다시 열기', onPress: () => handleStatusChange(action.id, 'pending') });
    }
    options.push({ text: '취소', style: 'cancel' as const });

    Alert.alert(action.title, action.description, options);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return '#3B82F6';
      default:
        return '#9CA3AF';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '긴급';
      case 'high':
        return '높음';
      case 'medium':
        return '중간';
      default:
        return '낮음';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return { name: 'checkmark-circle', color: '#10B981' };
      case 'in_progress':
        return { name: 'sync', color: '#3B82F6' };
      case 'dismissed':
        return { name: 'close-circle', color: '#9CA3AF' };
      default:
        return { name: 'time', color: '#F59E0B' };
    }
  };

  const filteredActions = actions.filter((action) => {
    if (filter === 'all') return action.status !== 'dismissed';
    return action.status === filter;
  });

  const stats = {
    pending: actions.filter((a) => a.status === 'pending').length,
    inProgress: actions.filter((a) => a.status === 'in_progress').length,
    completed: actions.filter((a) => a.status === 'completed').length,
  };

  const renderItem = ({ item }: { item: Action }) => {
    const statusIcon = getStatusIcon(item.status);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => handleActionPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <View style={styles.cardInfo}>
            <Text style={styles.actionTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.analysisName}>
              {item.analyses?.name}
            </Text>
          </View>
          <Ionicons
            name={statusIcon.name as any}
            size={24}
            color={statusIcon.color}
          />
        </View>

        <Text style={styles.actionDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}15` }]}>
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {getPriorityText(item.priority)}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString('ko-KR')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>대기</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>진행 중</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>완료</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(['all', 'pending', 'in_progress', 'completed'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? '전체' : f === 'pending' ? '대기' : f === 'in_progress' ? '진행 중' : '완료'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action List */}
      {filteredActions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>
            {filter === 'all' ? '액션 아이템이 없습니다' : '해당 상태의 액션이 없습니다'}
          </Text>
          <Text style={styles.emptySubtitle}>
            분석을 완료하면 AI가 액션을 추천합니다
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredActions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
  },
  cardInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 20,
  },
  analysisName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
