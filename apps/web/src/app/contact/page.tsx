'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', category: 'general', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, show success state — backend email integration can be added later
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">InsightFlow</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            홈으로
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">문의하기</h1>
          <p className="text-gray-500">
            궁금한 점이나 제안 사항이 있으시면 언제든 연락주세요.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl border p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">문의가 접수되었습니다</h2>
            <p className="text-gray-500 mb-8">
              빠른 시일 내에 답변 드리겠습니다. 감사합니다.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">이름</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="홍길동"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">문의 유형</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
              >
                <option value="general">일반 문의</option>
                <option value="pricing">요금제 문의</option>
                <option value="enterprise">기업 도입 문의</option>
                <option value="bug">버그 신고</option>
                <option value="feature">기능 요청</option>
                <option value="partnership">제휴 문의</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">문의 내용</label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                placeholder="문의 내용을 자세히 적어주세요."
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Send className="h-4 w-4" />
              문의 보내기
            </button>
          </form>
        )}

        {/* Contact Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 mb-2">이메일로 직접 문의하실 수도 있습니다</p>
          <a
            href="mailto:support@insightflow.kr"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Mail className="h-4 w-4" />
            support@insightflow.kr
          </a>
        </div>
      </main>
    </div>
  );
}
