import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/auth-context';
import { Button } from '../src/components';

export default function WelcomeScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logo}>InsightFlow</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>IF</Text>
          </View>
          <Text style={styles.logo}>InsightFlow</Text>
        </View>

        <Text style={styles.title}>
          AI가 분석하는{'\n'}비즈니스 인사이트
        </Text>

        <Text style={styles.subtitle}>
          Excel, CSV 파일을 업로드하면{'\n'}
          AI가 자동으로 분석하고 인사이트를 제공합니다
        </Text>

        <View style={styles.features}>
          <FeatureItem icon="chart" text="자동 데이터 분석" />
          <FeatureItem icon="lightbulb" text="AI 인사이트 생성" />
          <FeatureItem icon="action" text="액션 아이템 추천" />
        </View>
      </View>

      <View style={styles.buttons}>
        <Button
          title="시작하기"
          onPress={() => router.push('/(auth)/signup')}
          size="lg"
        />
        <Button
          title="이미 계정이 있으신가요? 로그인"
          variant="ghost"
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>
          {icon === 'chart' ? '📊' : icon === 'lightbulb' ? '💡' : '✓'}
        </Text>
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 42,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 40,
  },
  features: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureIconText: {
    fontSize: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  buttons: {
    gap: 12,
  },
});
