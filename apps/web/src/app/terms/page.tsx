import Link from 'next/link';
import { BarChart3, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '이용약관 - InsightFlow',
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">이용약관</h1>
        <p className="text-gray-500 mb-10">최종 수정일: 2026년 2월 17일</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제1조 (목적)</h2>
            <p className="text-gray-600 leading-relaxed">
              이 약관은 InsightFlow(이하 &quot;서비스&quot;)가 제공하는 AI 데이터 분석 서비스의 이용과 관련하여
              서비스와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제2조 (용어의 정의)</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>&quot;서비스&quot;란 InsightFlow가 제공하는 AI 기반 데이터 분석, 인사이트 도출, 리포트 생성 등 일체의 기능을 의미합니다.</li>
              <li>&quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 회원을 의미합니다.</li>
              <li>&quot;콘텐츠&quot;란 이용자가 업로드한 데이터 파일 및 서비스가 생성한 분석 결과를 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제3조 (서비스의 제공)</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600">
              <li>서비스는 Excel, CSV 등 데이터 파일의 AI 분석 기능을 제공합니다.</li>
              <li>서비스는 이용자의 역할(팀원, 팀장, 임원)에 맞춤화된 인사이트를 제공합니다.</li>
              <li>무료 플랜은 월 3회 분석, 5MB 파일 제한이 적용됩니다.</li>
              <li>유료 플랜(Pro, Team)은 별도 안내에 따라 추가 기능을 제공합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제4조 (회원가입 및 계정)</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600">
              <li>회원가입은 이메일 또는 소셜 로그인(Google, Kakao)을 통해 가능합니다.</li>
              <li>이용자는 정확한 정보를 제공해야 하며, 타인의 정보를 사용해서는 안 됩니다.</li>
              <li>계정의 관리 책임은 이용자에게 있으며, 제3자에게 계정을 양도하거나 대여할 수 없습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제5조 (이용자의 의무)</h2>
            <p className="text-gray-600 leading-relaxed mb-2">이용자는 다음 행위를 해서는 안 됩니다:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>불법적이거나 타인의 권리를 침해하는 데이터를 업로드하는 행위</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>서비스를 역설계하거나 무단으로 복제하는 행위</li>
              <li>개인정보보호법에 위반되는 데이터를 처리하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제6조 (데이터 소유권 및 처리)</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600">
              <li>이용자가 업로드한 데이터의 소유권은 이용자에게 있습니다.</li>
              <li>서비스는 분석 목적으로만 데이터를 처리하며, 분석 완료 후 원본 데이터는 30일 이내에 삭제됩니다.</li>
              <li>서비스는 이용자의 동의 없이 데이터를 제3자에게 제공하지 않습니다.</li>
              <li>AI 분석 결과물의 저작권은 이용자에게 귀속됩니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제7조 (서비스 변경 및 중단)</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600">
              <li>서비스는 기술적 필요에 의해 서비스 내용을 변경할 수 있으며, 변경 시 사전 공지합니다.</li>
              <li>천재지변, 시스템 장애 등 불가피한 사유로 서비스가 중단될 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제8조 (면책사항)</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600">
              <li>AI 분석 결과는 참고용이며, 서비스는 분석 결과에 기반한 의사결정의 결과에 대해 책임지지 않습니다.</li>
              <li>이용자의 귀책사유로 인한 손해에 대해 서비스는 책임지지 않습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제9조 (분쟁 해결)</h2>
            <p className="text-gray-600 leading-relaxed">
              본 약관과 관련된 분쟁은 대한민국 법률에 따르며, 관할 법원은 서울중앙지방법원으로 합니다.
            </p>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <p className="text-gray-500 text-sm">
              본 약관은 2026년 2월 17일부터 시행됩니다.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              문의사항이 있으시면{' '}
              <a href="mailto:support@insightflow.kr" className="text-blue-600 hover:underline">
                support@insightflow.kr
              </a>
              로 연락해주세요.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
