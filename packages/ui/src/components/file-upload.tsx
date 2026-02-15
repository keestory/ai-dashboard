'use client';

import * as React from 'react';
import { cn } from '../utils';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';

export interface FileUploadProps {
  accept?: string[];
  maxSize?: number;
  onUpload: (file: File) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  uploading?: boolean;
  progress?: number;
  className?: string;
}

type UploadState = 'idle' | 'dragover' | 'uploading' | 'complete' | 'error';

export function FileUpload({
  accept = ['.xlsx', '.xls', '.csv'],
  maxSize = 50 * 1024 * 1024, // 50MB default
  onUpload,
  onProgress,
  onError,
  uploading = false,
  progress = 0,
  className,
}: FileUploadProps) {
  const [state, setState] = React.useState<UploadState>('idle');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (uploading) {
      setState('uploading');
    } else if (progress === 100) {
      setState('complete');
    }
  }, [uploading, progress]);

  const validateFile = (file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!accept.includes(extension)) {
      return `지원하지 않는 파일 형식입니다. (${accept.join(', ')})`;
    }
    if (file.size > maxSize) {
      return `파일 크기가 ${maxSize / 1024 / 1024}MB를 초과합니다.`;
    }
    return null;
  };

  const handleFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setState('error');
      onError?.(error);
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState('idle');

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setState('dragover');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setState('idle');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setErrorMessage('');
    setState('idle');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      {state === 'idle' || state === 'dragover' ? (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
            state === 'dragover'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          )}
        >
          <Upload
            className={cn(
              'h-12 w-12 mx-auto mb-4',
              state === 'dragover' ? 'text-primary-500' : 'text-gray-400'
            )}
          />
          <p className="text-gray-600 mb-2">
            {state === 'dragover'
              ? '여기에 파일을 놓으세요'
              : '파일을 드래그하거나 클릭하여 선택'}
          </p>
          <p className="text-sm text-gray-400">
            지원 형식: {accept.join(', ')} (최대 {maxSize / 1024 / 1024}MB)
          </p>
        </div>
      ) : state === 'uploading' ? (
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <File className="h-8 w-8 text-primary-500" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{selectedFile?.name}</p>
              <p className="text-sm text-gray-500">
                {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">{progress}% 업로드 중...</p>
        </div>
      ) : state === 'complete' ? (
        <div className="border border-green-200 rounded-xl p-6 bg-green-50">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{selectedFile?.name}</p>
              <p className="text-sm text-green-600">업로드 완료</p>
            </div>
            <button
              onClick={handleReset}
              className="p-1 hover:bg-green-100 rounded"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      ) : state === 'error' ? (
        <div className="border border-red-200 rounded-xl p-6 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="flex-1">
              <p className="font-medium text-red-900">업로드 실패</p>
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200"
            >
              다시 시도
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
