import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Register Korean font (Noto Sans KR from Google Fonts CDN)
Font.register({
  family: 'NotoSansKR',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLQ.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzg01eLQ.ttf',
      fontWeight: 'bold',
    },
  ],
});

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'NotoSansKR',
    fontSize: 11,
    color: '#1F2937',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #3B82F6',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    borderBottom: '1 solid #E5E7EB',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  col2: {
    width: '50%',
  },
  col3: {
    width: '33.33%',
  },
  col4: {
    width: '25%',
  },
  kpiCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  insightCard: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 4,
    marginBottom: 10,
    borderLeft: '3 solid #F59E0B',
  },
  insightCritical: {
    backgroundColor: '#FEE2E2',
    borderLeft: '3 solid #EF4444',
  },
  insightHigh: {
    backgroundColor: '#FEF3C7',
    borderLeft: '3 solid #F59E0B',
  },
  insightMedium: {
    backgroundColor: '#DBEAFE',
    borderLeft: '3 solid #3B82F6',
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 10,
    color: '#4B5563',
    lineHeight: 1.4,
  },
  insightType: {
    fontSize: 8,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  actionCard: {
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
    border: '1 solid #E5E7EB',
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 10,
    color: '#6B7280',
  },
  priorityBadge: {
    fontSize: 8,
    padding: '2 6',
    borderRadius: 2,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  priorityUrgent: {
    backgroundColor: '#EF4444',
  },
  priorityHigh: {
    backgroundColor: '#F59E0B',
  },
  priorityMedium: {
    backgroundColor: '#3B82F6',
  },
  priorityLow: {
    backgroundColor: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1 solid #E5E7EB',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderBottom: '1 solid #E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #F3F4F6',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
});

interface ReportData {
  name: string;
  template: string;
  createdAt: string;
  analysis: {
    name: string;
    rowCount: number;
    columnCount: number;
    summary?: {
      numericColumns?: Array<{
        name: string;
        min: number;
        max: number;
        mean: number;
      }>;
      categoricalColumns?: Array<{
        name: string;
        topValues: Array<{ value: string; count: number }>;
      }>;
    };
  };
  insights: Array<{
    type: string;
    title: string;
    description: string;
    importance: string;
  }>;
  actions: Array<{
    title: string;
    description: string;
    priority: string;
    status: string;
  }>;
}

const getImportanceStyle = (importance: string) => {
  switch (importance) {
    case 'critical':
      return styles.insightCritical;
    case 'high':
      return styles.insightHigh;
    default:
      return styles.insightMedium;
  }
};

const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return styles.priorityUrgent;
    case 'high':
      return styles.priorityHigh;
    case 'medium':
      return styles.priorityMedium;
    default:
      return styles.priorityLow;
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return '긴급';
    case 'high':
      return '높음';
    case 'medium':
      return '보통';
    default:
      return '낮음';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'trend':
      return '트렌드';
    case 'anomaly':
      return '이상치';
    case 'pattern':
      return '패턴';
    case 'comparison':
      return '비교';
    default:
      return '요약';
  }
};

export const ReportDocument: React.FC<{ data: ReportData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{data.name}</Text>
        <Text style={styles.subtitle}>
          생성일: {new Date(data.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })} | 분석: {data.analysis.name}
        </Text>
      </View>

      {/* KPIs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>주요 지표</Text>
        <View style={styles.row}>
          <View style={[styles.kpiCard, styles.col4]}>
            <Text style={styles.kpiLabel}>총 행</Text>
            <Text style={styles.kpiValue}>
              {data.analysis.rowCount?.toLocaleString() || '-'}
            </Text>
          </View>
          <View style={[styles.kpiCard, styles.col4]}>
            <Text style={styles.kpiLabel}>총 열</Text>
            <Text style={styles.kpiValue}>
              {data.analysis.columnCount || '-'}
            </Text>
          </View>
          <View style={[styles.kpiCard, styles.col4]}>
            <Text style={styles.kpiLabel}>인사이트</Text>
            <Text style={styles.kpiValue}>{data.insights.length}</Text>
          </View>
          <View style={[styles.kpiCard, styles.col4]}>
            <Text style={styles.kpiLabel}>액션 아이템</Text>
            <Text style={styles.kpiValue}>{data.actions.length}</Text>
          </View>
        </View>
      </View>

      {/* Insights */}
      {data.insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI 인사이트</Text>
          {data.insights.map((insight, index) => (
            <View
              key={index}
              style={[styles.insightCard, getImportanceStyle(insight.importance)]}
            >
              <Text style={styles.insightType}>{getTypeLabel(insight.type)}</Text>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      {data.actions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추천 액션</Text>
          {data.actions.map((action, index) => (
            <View key={index} style={styles.actionCard}>
              <Text style={[styles.priorityBadge, getPriorityStyle(action.priority)]}>
                {getPriorityLabel(action.priority)}
              </Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Data Summary */}
      {data.analysis.summary?.numericColumns && data.analysis.summary.numericColumns.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>수치 데이터 요약</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>컬럼</Text>
              <Text style={styles.tableCellHeader}>최소값</Text>
              <Text style={styles.tableCellHeader}>최대값</Text>
              <Text style={styles.tableCellHeader}>평균</Text>
            </View>
            {data.analysis.summary.numericColumns.slice(0, 5).map((col, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{col.name}</Text>
                <Text style={styles.tableCell}>{col.min?.toLocaleString()}</Text>
                <Text style={styles.tableCell}>{col.max?.toLocaleString()}</Text>
                <Text style={styles.tableCell}>{col.mean?.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>InsightFlow - AI 데이터 분석 리포트</Text>
        <Text style={styles.footerText}>
          {new Date().toLocaleDateString('ko-KR')}
        </Text>
      </View>
    </Page>
  </Document>
);

export default ReportDocument;
