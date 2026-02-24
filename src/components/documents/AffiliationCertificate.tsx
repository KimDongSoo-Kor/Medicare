import React from 'react';
import { CaregiverRecord } from '@/types';
import { DOCUMENT_TITLES, DOCUMENT_DIMENSIONS } from '@/constants';

interface Props {
    data: CaregiverRecord;
}

export const AffiliationCertificate: React.FC<Props> = ({ data }) => {
    // 날짜 포맷팅 로직 (2026-02-05 -> 2026년 2월 5일)
    const formatDateKOR = (dateString: string) => {
        if (!dateString) return '    년   월   일';
        try {
            const parts = dateString.split('-');
            if (parts.length === 3) {
                return `${parts[0]}년 ${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
            }
            return dateString;
        } catch {
            return dateString;
        }
    };

    const maskIdNumber = (idStr?: string) => {
        if (!idStr) return '****** - *******';
        const cleaned = idStr.replace(/[^0-9]/g, '');
        if (cleaned.length >= 7) {
            const front = cleaned.substring(0, 6);
            const backFirst = cleaned.substring(6, 7);
            return `${front}-${backFirst}******`;
        } else if (cleaned.length > 0) {
            return `${cleaned} - *******`;
        }
        return '****** - *******';
    };

    return (
        <div
            className="bg-white text-black p-16 relative flex flex-col"
            style={{
                width: `${DOCUMENT_DIMENSIONS.width}px`,
                height: `${DOCUMENT_DIMENSIONS.height}px`,
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                fontFamily: '"Malgun Gothic", "맑은 고딕", sans-serif',
            }}
            id="affiliation-certificate"
        >
            {/* 워터마크 (중앙 배치, 텍스트 뒤에 깔림) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
                <img src="/logo.png" alt="" className="w-[550px] h-auto object-contain" style={{ opacity: 0.1 }} crossOrigin="anonymous" />
            </div>

            {/* ========== 1. 제목 ========== */}
            <h1 className="text-center font-bold mt-16 tracking-[1em]" style={{ fontSize: '38px' }}>
                {DOCUMENT_TITLES.AFFILIATION}
            </h1>

            {/* ========== 2. 상단 좌측 정보 ========== */}
            <div className="mt-28 space-y-5 text-[15px] relative z-10 w-full pl-4">
                <div className="flex">
                    <span className="w-28 flex justify-between tracking-widest mr-4"><span>성</span><span>명</span></span>
                    <span>: {data.caregiverName || ' '}</span>
                </div>
                <div className="flex">
                    <span className="w-28 tracking-widest mr-4">주민등록번호</span>
                    <span>: {maskIdNumber(data.protectorIdNumber)}</span>
                </div>
                <div className="flex">
                    <span className="w-28 flex justify-between tracking-widest mr-4"><span>발</span><span>급</span><span>용</span><span>도</span></span>
                    <span>: 보험회사제출용</span>
                </div>
            </div>

            {/* ========== 3. 중앙 본문 ========== */}
            <div className="mt-36 flex-grow flex flex-col items-center text-[17px] relative z-10 leading-[3]">
                <div className="text-center">
                    상기인은 {formatDateKOR(data.startDate)} 부터 {formatDateKOR(data.endDate)} 현재 {data.companyName} 소속<br />
                    간병인으로 재직하고 있음을 확인 함
                </div>
            </div>

            {/* ========== 4. 하단 공급자 테이블 ========== */}
            <div className="mb-12 relative z-10">
                <table className="w-full border-collapse border border-black text-[13px] text-center">
                    <tbody>
                        <tr>
                            <td className="border border-black font-bold bg-gray-50 py-3 w-[120px]">사업자등록번호</td>
                            <td className="border border-black py-3">{data.businessNumber}</td>
                            <td className="border border-black font-bold bg-gray-50 py-3 w-[120px]">사업자명</td>
                            <td className="border border-black py-3 relative w-[180px]">
                                {data.representativeName}
                                {/* 직인(도장) - 이름 우측에 겹치도록 배치 */}
                                <div className="absolute top-1/2 left-[60%] -translate-y-1/2 w-[70px] h-[70px] opacity-90 mix-blend-multiply pointer-events-none">
                                    <img src="/stamp.png" alt="직인" className="w-full h-full object-contain" crossOrigin="anonymous" />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black font-bold bg-gray-50 py-3">발급일자</td>
                            <td className="border border-black py-3">
                                {(() => {
                                    const now = new Date();
                                    const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000));
                                    return kst.toISOString().split('T')[0];
                                })()}
                            </td>
                            <td className="border border-black font-bold bg-gray-50 py-3">연락처</td>
                            <td className="border border-black py-3">{data.companyPhone}</td>
                        </tr>
                        <tr>
                            <td className="border border-black font-bold bg-gray-50 py-3">업태</td>
                            <td className="border border-black py-3">서비스업</td>
                            <td className="border border-black font-bold bg-gray-50 py-3">종목</td>
                            <td className="border border-black py-3">개인간병및유사서비스업</td>
                        </tr>
                        <tr>
                            <td className="border border-black font-bold bg-gray-50 py-3">사업장소재지</td>
                            <td colSpan={3} className="border border-black py-3 text-left px-6">
                                {data.companyAddress}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
