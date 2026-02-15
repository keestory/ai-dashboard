import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/auth-context';
import { supabase } from '../../src/lib/supabase';
import { Card, Button } from '../../src/components';

interface Stats {
  totalAnalyses: number;
  totalInsights: number;
  pendingActions: number;
  completedThisMonth: number;
}

interface RecentAnalysis {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch recent analyses
      const { data: analyses } = await supabase
        .from('analyses')
        .select('id, name, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (analyses) {
        setRecentAnalyses(analyses);
      }

      // Fetch stats
      const [analysisCount, insightCount, actionCount] = await Promise.all([
        supabase
          .from('analyses')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('insights')
          .select('id, analyses!inner(user_id)', { count: 'exact', head: true })
          .eq('analyses.user_id', user.id),
        supabase
          .from('actions')
          .select('id, analyses!inner(user_id)', { count: 'exact', head: true })
          .eq('analyses.user_id', user.id)
          .eq('status', 'pending'),
      ]);

      setStats({
        totalAnalyses: analysisCount.count || 0,
        totalInsights: insightCount.count || 0,
        pendingActions: actionCount.count || 0,
        completedThisMonth: analyses?.filter(a => a.status === 'completed').length || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'processing':
        return '#3B82F6';
      case 'failed':
        return '#EF4444';
      default:
        return '#9CA3AF';
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome */}
      <View style={styles.welcome}>
        <Text style={styles.welcomeText}>
          안녕하세요, {profile?.name || '사용자'}님
        </Text>
        <Text style={styles.welcomeSubtext}>오늘도 데이터에서 인사이트를 찾아보세요</Text>
      </View>

      {/* Quick Action */}
      <Card style={styles.quickAction}>
        <View style={styles.quickActionContent}>
          <View style={styles.quickActionIcon}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.quickActionText}>
            <Text style={styles.quickActionTitle}>새 분석 시작</Text>
            <Text style={styles.quickActionSubtitle}>
              Excel 또는 CSV 파일을 업로드하세요
            </Text>
          </View>
        </View>
        <Button
          title="분석하기"
          onPress={() => router.push('/analysis/new')}
          size="sm"
        />
      </Card>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalAnalyses || 0}</Text>
          <Text style={styles.statLabel}>총 분석</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalInsights || 0}</Text>
          <Text style={styles.statLabel}>인사이트</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>
            {stats?.pendingActions || 0}
          </Text>
          <Text style={styles.statLabel}>대기 액션</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {stats?.completedThisMonth || 0}
          </Text>
          <Text style={styles.statLabel}>이번 달 완료</Text>
        </Card>
      </View>

      {/* Recent Analyses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 분석</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/analysis')}>
            <Text style={styles.sectionLink}>전체 보기</Text>
          </TouchableOpacity>
        </View>

        {recentAnalyses.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="analytics-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>아직 분석이 없습니다</Text>
            <Button
              title="첫 분석 시작하기"
              onPress={() => router.push('/analysis/new')}
              variant="secondary"
              size="sm"
              style={{ marginTop: 16 }}
            />
          </Card>
        ) : (
          <Card padding="none">
            {recentAnalyses.map((analysis, index) => (
              <TouchableOpacity
                key={analysis.id}
                style={[
                  styles.analysisItem,
                  index < recentAnalyses.length - 1 && styles.analysisItemBorder,
                ]}
                onPress={() => router.push(`/analysis/${analysis.id}`)}
              >
                <View style={styles.analysisIcon}>
                  <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
                </View>
                <View style={styles.analysisInfo}>
                  <Text style={styles.analysisName} numberOfLines={1}>
                    {analysis.name}
                  </Text>
                  <Text style={styles.analysisDate}>
                    {new Date(analysis.created_at).toLocaleDateString('ko-KR')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(analysis.status)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(analysis.status) },
                    ]}
                  >
                    {getStatusText(analysis.status)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        )}
      </View>

      {/* Usage Info */}
      {profile?.plan === 'free' && (
        <Card style={styles.usageCard}>
          <View style={styles.usageHeader}>
            <Text style={styles.usageTitle}>무료 플랜</Text>
            <TouchableOpacity>
              <Text style={styles.upgradeLink}>업그레이드</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.usageBar}>
            <View
              style={[
                styles.usageProgress,
                { width: `${((profile.usage_count || 0) / 10) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.usageText}>
            이번 달 {profile.usage_count || 0}/10회 사용
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  welcome: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  analysisItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  analysisIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  analysisInfo: {
    flex: 1,
  },
  analysisName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  analysisDate: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  usageCard: {
    backgroundColor: '#EFF6FF',
    marginBottom: 20,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  upgradeLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  usageBar: {
    height: 6,
    backgroundColor: '#BFDBFE',
    borderRadius: 3,
    marginBottom: 8,
  },
  usageProgress: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  usageText: {
    fontSize: 13,
    color: '#3B82F6',
  },
});
