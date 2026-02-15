import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/auth-context';
import { supabase } from '../../src/lib/supabase';
import { Card, Button } from '../../src/components';

interface Analysis {
  id: string;
  name: string;
  file_name: string;
  file_size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  row_count: number | null;
  column_count: number | null;
  created_at: string;
}

export default function AnalysisScreen() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAnalyses();
    }, [user])
  );

  const fetchAnalyses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnalyses(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalyses();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return { name: 'checkmark-circle', color: '#10B981' };
      case 'processing':
        return { name: 'sync', color: '#3B82F6' };
      case 'failed':
        return { name: 'alert-circle', color: '#EF4444' };
      default:
        return { name: 'time', color: '#9CA3AF' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'processing':
        return '분석 중';
      case 'failed':
        return '실패';
      default:
        return '대기';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: Analysis }) => {
    const statusIcon = getStatusIcon(item.status);

    return (
      <TouchableOpacity
        style={styles.analysisCard}
        onPress={() => router.push(`/analysis/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.fileIcon}>
            <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.analysisName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.fileName} numberOfLines={1}>
              {item.file_name}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <Ionicons
              name={statusIcon.name as any}
              size={20}
              color={statusIcon.color}
            />
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="folder-outline" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>{formatFileSize(item.file_size)}</Text>
          </View>
          {item.status === 'completed' && item.row_count && (
            <View style={styles.metaItem}>
              <Ionicons name="grid-outline" size={14} color="#9CA3AF" />
              <Text style={styles.metaText}>
                {item.row_count.toLocaleString()}행
              </Text>
            </View>
          )}
        </View>

        {item.status !== 'completed' && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusIcon.color}15` },
            ]}
          >
            <Text style={[styles.statusText, { color: statusIcon.color }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        )}
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
      {/* Header with New Analysis Button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>내 분석</Text>
          <Text style={styles.headerSubtitle}>
            {analyses.length}개의 분석
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => router.push('/analysis/new')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Analysis List */}
      {analyses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="analytics-outline" size={64} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyTitle}>아직 분석이 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            첫 번째 분석을 시작해보세요
          </Text>
          <Button
            title="새 분석 시작"
            onPress={() => router.push('/analysis/new')}
            style={{ marginTop: 24 }}
          />
        </View>
      ) : (
        <FlatList
          data={analyses}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  newButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
  },
  analysisCard: {
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
    alignItems: 'center',
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  analysisName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  fileName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusContainer: {
    marginLeft: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
