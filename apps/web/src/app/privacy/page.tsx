import Link from 'next/link';
import { BarChart3, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '개인정보처리방침 - InsightFlow',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            홈으로 돌아가기
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">InsightFlow</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
        <p className="text-gray-500 mb-10">최종 수정일: 2026년 2월 17일</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. 수집하는 개인정보 항목</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              InsightFlow(이하 &quot;서비스&quot;)는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:
            </p>
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <div>
                <p className="font-medium text-gray-700 text-sm">필수 수집 항목</p>
                <p className="text-gray-600 text-sm">이메일 주소, 이름(닉네임), 비밀번호(이메일 가입 시)</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 text-sm">소셜 로그인 시 수집 항목</p>
                <p className="text-gray-600 text-sm">이메일 주소, 이름, 프로필 이미지 (Google, Kakao 제공 정보)</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 text-sm">자동 수집 항목</p>
                <p className="text-gray-600 text-sm">접속 IP, 브라우저 정보, 서비스 이용 기록, 접속 일시</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. 개인정보의 수집 및 이용 목적</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>회원 가입 및 관리: 본인 확인, 서비스 이용 자격 관리</li>
              <li>서비스 제공: AI 데이터 분석, 인사이트 생성, 리포트 제공</li>
              <li>서비스 개선: 이용 통계, 서비스 품질 향상</li>
              <li>고객 지원: 문의 응답, 공지사항 전달</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. 업로드 데이터의 처리</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="text-gray-700 leading-relaxed text-sm">
                이용자가 업로드하는 Excel/CSV 파일은 AI 분석 목적으로만 사용됩니다.
                업로드된 데이터는 분석 완료 후 서버에 암호화되어 저장되며, 이용자가 삭제를 요청하거나
                계정 탈퇴 시 즉시 삭제됩니다. 서비스는 업로드 데이터를 AI 모델 학습에 사용하지 않습니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. 개인정보의 보유 및 이용 기간</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>회원 정보: 회원 탈퇴 시까지 (탈퇴 후 즉시 삭제)</li>
              <li>업로드 데이터: 분석 완료 후 30일 보관 후 자동 삭제</li>
              <li>분석 결과: 회원 탈퇴 시까지 보관</li>
              <li>접속 로그: 3개월 보관 후 삭제</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. 개인정보의 제3자 제공</h2>
            <p className="text-gray-600 leading-relaxed">
              서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 mt-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령에 의해 요구되는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. 개인정보 처리 위탁</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">수탁업체</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">위탁 업무</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Supabase Inc.</td>
                    <td className="py-3 px-4">데이터베이스 호스팅 및 인증 서비스</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Anthropic PBC</td>
                    <td className="py-3 px-4">AI 데이터 분석 처리</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Vercel Inc.</td>
                    <td className="py-3 px-4">웹 서비스 호스팅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. 이용자의 권리</h2>
            <p className="text-gray-600 leading-relaxed mb-2">이용자는 다음의 권리를 행사할 수 있습니다:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>개인정보 열람, 수정, 삭제 요청</li>
              <li>개인정보 처리 정지 요청</li>
              <li>회원 탈퇴 및 데이터 삭제 요청</li>
              <li>업로드 데이터의 즉시 삭제 요청</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              위 권리는 서비스 설정 페이지 또는 이메일(support@insightflow.kr)을 통해 행사할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. 개인정보의 안전성 확보 조치</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>데이터 전송 시 SSL/TLS 암호화 적용</li>
              <li>데이터베이스 암호화 저장</li>
              <li>접근 권한 관리 및 최소화</li>
              <li>정기적인 보안 점검</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. 쿠키 사용</h2>
            <p className="text-gray-600 leading-relaxed">
              서비스는 인증 및 세션 관리를 위해 쿠키를 사용합니다. 이용자는 브라우저 설정을 통해
              쿠키를 거부할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. 개인정보 보호책임자</h2>
            <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-600">
              <p>이메일: support@insightflow.kr</p>
              <p className="mt-1">
                개인정보 관련 문의, 불만처리, 피해구제 등에 관한 사항은 위 연락처로 문의해주시기 바랍니다.
              </p>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <p className="text-gray-500 text-sm">
              본 개인정보처리방침은 2026년 2월 17일부터 시행됩니다.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
