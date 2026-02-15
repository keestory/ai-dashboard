import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  summary: any;
  created_at: string;
}

interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  importance: string;
}

interface Action {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
}

export default function AnalysisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`analysis-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analyses',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setAnalysis(payload.new as Analysis);
          if (payload.new.status === 'completed') {
            fetchRelatedData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchAnalysis = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      setAnalysis(data);
      if (data.status === 'completed') {
        await fetchRelatedData();
      }
    }
    setLoading(false);
  };

  const fetchRelatedData = async () => {
    const [insightsRes, actionsRes] = await Promise.all([
      supabase.from('insights').select('*').eq('analysis_id', id),
      supabase.from('actions').select('*').eq('analysis_id', id),
    ]);

    if (insightsRes.data) setInsights(insightsRes.data);
    if (actionsRes.data) setActions(actionsRes.data);
  };

  const handleReanalyze = async () => {
    Alert.alert(
      '다시 분석',
      '이 파일을 다시 분석하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '다시 분석',
          onPress: async () => {
            // Trigger reanalysis
            setAnalysis((prev) => prev ? { ...prev, status: 'processing' } : null);
            // API call would go here
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      '분석 삭제',
      '이 분석을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('analyses')
              .delete()
              .eq('id', id);

            if (!error) {
              router.back();
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return '#3B82F6';
      default:
        return '#9CA3AF';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return 'trending-up';
      case 'anomaly':
        return 'warning';
      case 'pattern':
        return 'grid';
      case 'comparison':
        return 'git-compare';
      default:
        return 'analytics';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>분석을 찾을 수 없습니다</Text>
        <Button title="돌아가기" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <Card>
        <View style={styles.headerRow}>
          <View style={styles.fileIcon}>
            <Ionicons name="document-text-outline" size={28} color="#3B82F6" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.analysisName}>{analysis.name}</Text>
            <Text style={styles.fileName}>{analysis.file_name}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>파일 크기</Text>
            <Text style={styles.metaValue}>{formatFileSize(analysis.file_size)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>생성일</Text>
            <Text style={styles.metaValue}>
              {new Date(analysis.created_at).toLocaleDateString('ko-KR')}
            </Text>
          </View>
          {analysis.row_count && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>행 수</Text>
              <Text style={styles.metaValue}>{analysis.row_count.toLocaleString()}</Text>
            </View>
          )}
          {analysis.column_count && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>열 수</Text>
              <Text style={styles.metaValue}>{analysis.column_count}</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Processing State */}
      {(analysis.status === 'pending' || analysis.status === 'processing') && (
        <Card style={styles.statusCard}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>분석 진행 중</Text>
            <Text style={styles.statusSubtitle}>
              완료되면 자동으로 결과가 표시됩니다
            </Text>
          </View>
        </Card>
      )}

      {/* Failed State */}
      {analysis.status === 'failed' && (
        <Card style={styles.failedCard}>
          <Ionicons name="alert-circle" size={24} color="#EF4444" />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, { color: '#EF4444' }]}>분석 실패</Text>
            <Text style={styles.statusSubtitle}>
              파일을 확인하고 다시 시도해주세요
            </Text>
          </View>
          <Button title="다시 시도" size="sm" onPress={handleReanalyze} />
        </Card>
      )}

      {/* Completed State */}
      {analysis.status === 'completed' && (
        <>
          {/* Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI 인사이트</Text>
            {insights.length === 0 ? (
              <Card>
                <Text style={styles.emptyText}>인사이트가 없습니다</Text>
              </Card>
            ) : (
              insights.map((insight) => (
                <Card key={insight.id} style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <View
                      style={[
                        styles.insightIcon,
                        { backgroundColor: `${getImportanceColor(insight.importance)}15` },
                      ]}
                    >
                      <Ionicons
                        name={getTypeIcon(insight.type) as any}
                        size={18}
                        color={getImportanceColor(insight.importance)}
                      />
                    </View>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                  </View>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                </Card>
              ))
            )}
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>추천 액션</Text>
            {actions.length === 0 ? (
              <Card>
                <Text style={styles.emptyText}>추천 액션이 없습니다</Text>
              </Card>
            ) : (
              actions.map((action) => (
                <Card key={action.id} style={styles.actionCard}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </Card>
              ))
            )}
          </View>
        </>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {analysis.status === 'completed' && (
          <Button
            title="다시 분석"
            variant="secondary"
            onPress={handleReanalyze}
            style={{ flex: 1 }}
          />
        )}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fileIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerInfo: {
    flex: 1,
  },
  analysisName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  fileName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  metaItem: {
    width: '50%',
    marginBottom: 12,
  },
  metaLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginTop: 12,
  },
  failedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginTop: 12,
  },
  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF',
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#3B82F6',
    marginTop: 2,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 8,
  },
  insightCard: {
    marginBottom: 10,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  insightTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actionCard: {
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
