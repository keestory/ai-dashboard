import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/auth-context';
import { Card } from '../../src/components';

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [analysisNotifications, setAnalysisNotifications] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  const planLabels: Record<string, string> = {
    free: '무료',
    pro: '프로',
    enterprise: '엔터프라이즈',
  };

  const SettingsItem = ({
    icon,
    iconColor = '#6B7280',
    title,
    subtitle,
    rightElement,
    onPress,
    showArrow = true,
  }: {
    icon: string;
    iconColor?: string;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement}
      {showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.name || '사용자'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>
        <View style={styles.planBadge}>
          <Text style={styles.planText}>{planLabels[profile?.plan || 'free']}</Text>
        </View>
      </Card>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정</Text>
        <Card padding="none">
          <SettingsItem
            icon="person-outline"
            iconColor="#3B82F6"
            title="프로필 수정"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="card-outline"
            iconColor="#10B981"
            title="결제 및 플랜"
            subtitle={`${planLabels[profile?.plan || 'free']} 플랜 사용 중`}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="lock-closed-outline"
            iconColor="#F59E0B"
            title="비밀번호 변경"
            onPress={() => {}}
          />
        </Card>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림</Text>
        <Card padding="none">
          <SettingsItem
            icon="notifications-outline"
            iconColor="#8B5CF6"
            title="푸시 알림"
            showArrow={false}
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                thumbColor={notifications ? '#3B82F6' : '#F3F4F6'}
              />
            }
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="analytics-outline"
            iconColor="#EC4899"
            title="분석 완료 알림"
            subtitle="분석이 완료되면 알림을 받습니다"
            showArrow={false}
            rightElement={
              <Switch
                value={analysisNotifications}
                onValueChange={setAnalysisNotifications}
                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                thumbColor={analysisNotifications ? '#3B82F6' : '#F3F4F6'}
              />
            }
          />
        </Card>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>지원</Text>
        <Card padding="none">
          <SettingsItem
            icon="help-circle-outline"
            iconColor="#6B7280"
            title="도움말"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="chatbubble-outline"
            iconColor="#6B7280"
            title="문의하기"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="document-text-outline"
            iconColor="#6B7280"
            title="이용약관"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="shield-outline"
            iconColor="#6B7280"
            title="개인정보처리방침"
            onPress={() => {}}
          />
        </Card>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>
        <Card padding="none">
          <SettingsItem
            icon="information-circle-outline"
            iconColor="#6B7280"
            title="버전"
            rightElement={<Text style={styles.versionText}>1.0.0</Text>}
            showArrow={false}
          />
        </Card>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.signOutText}>로그아웃</Text>
      </TouchableOpacity>

      <Text style={styles.copyright}>
        InsightFlow v1.0.0{'\n'}
        Powered by AI
      </Text>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  planBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 62,
  },
  versionText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 24,
    lineHeight: 18,
  },
});
