import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/auth-context';
import { supabase } from '../../src/lib/supabase';
import { Card, Button, Input } from '../../src/components';

export default function NewAnalysisScreen() {
  const { user, profile } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [analysisName, setAnalysisName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchWorkspace();
  }, [user]);

  const fetchWorkspace = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .single();

    if (data) {
      setWorkspaceId(data.id);
    }
  };

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedFile = result.assets[0];

        // Check file size
        const maxSize = (profile?.plan === 'free' ? 5 : profile?.plan === 'pro' ? 50 : 100) * 1024 * 1024;
        if (selectedFile.size && selectedFile.size > maxSize) {
          Alert.alert(
            '파일 크기 초과',
            `최대 ${maxSize / 1024 / 1024}MB까지 업로드할 수 있습니다.`
          );
          return;
        }

        setFile(selectedFile);
        if (!analysisName) {
          setAnalysisName(selectedFile.name.replace(/\.[^/.]+$/, ''));
        }
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      Alert.alert('오류', '파일을 선택하는 중 오류가 발생했습니다.');
    }
  };

  const handleUpload = async () => {
    if (!file || !workspaceId) {
      Alert.alert('오류', '파일을 선택해주세요.');
      return;
    }

    if (!analysisName.trim()) {
      Alert.alert('오류', '분석 이름을 입력해주세요.');
      return;
    }

    setUploading(true);

    try {
      // Read file as base64
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to blob
      const blob = Uint8Array.from(atob(fileContent), (c) => c.charCodeAt(0));

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, blob, {
          contentType: file.mimeType || 'application/octet-stream',
        });

      if (uploadError) throw uploadError;

      // Create analysis record
      const { data: analysis, error: dbError } = await supabase
        .from('analyses')
        .insert({
          user_id: user?.id,
          workspace_id: workspaceId,
          name: analysisName,
          file_name: file.name,
          file_url: fileName,
          file_size: file.size || 0,
          file_type: fileExt === 'csv' ? 'csv' : 'excel',
          status: 'pending',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Trigger analysis (this would call your API)
      // For now, we'll just navigate to the analysis page

      Alert.alert(
        '업로드 완료',
        '파일이 업로드되었습니다. 분석이 시작됩니다.',
        [
          {
            text: '확인',
            onPress: () => router.replace(`/analysis/${analysis.id}`),
          },
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('오류', '업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      {/* File Selection */}
      <Card style={styles.uploadCard}>
        <TouchableOpacity
          style={styles.uploadArea}
          onPress={handleSelectFile}
          disabled={uploading}
        >
          {file ? (
            <View style={styles.selectedFile}>
              <View style={styles.fileIcon}>
                <Ionicons name="document-text-outline" size={32} color="#3B82F6" />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.fileSize}>
                  {formatFileSize(file.size || 0)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setFile(null)}
              >
                <Ionicons name="close-circle" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.uploadIcon}>
                <Ionicons name="cloud-upload-outline" size={40} color="#9CA3AF" />
              </View>
              <Text style={styles.uploadTitle}>파일을 선택하세요</Text>
              <Text style={styles.uploadSubtitle}>
                Excel (.xlsx, .xls) 또는 CSV 파일
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Card>

      {/* Analysis Name */}
      {file && (
        <Card style={styles.inputCard}>
          <Input
            label="분석 이름"
            placeholder="분석 이름을 입력하세요"
            value={analysisName}
            onChangeText={setAnalysisName}
          />
        </Card>
      )}

      {/* Tips */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>파일 형식 팁</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>첫 번째 행은 컬럼 헤더로 사용됩니다</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>날짜 형식은 YYYY-MM-DD를 권장합니다</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>
              최대 {profile?.plan === 'free' ? '5' : profile?.plan === 'pro' ? '50' : '100'}MB까지
              업로드 가능
            </Text>
          </View>
        </View>
      </Card>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Button
          title={uploading ? '업로드 중...' : '분석 시작'}
          onPress={handleUpload}
          disabled={!file || uploading}
          loading={uploading}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  uploadCard: {
    marginBottom: 16,
  },
  uploadArea: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  uploadIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  fileIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  fileSize: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  inputCard: {
    marginBottom: 16,
  },
  tipsCard: {
    backgroundColor: '#F0FDF4',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
});
