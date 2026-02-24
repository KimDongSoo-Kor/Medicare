import React from 'react';
import { CaregiverRecord } from '@/types';
import { DOCUMENT_TITLES, DOCUMENT_DIMENSIONS } from '@/constants';

interface Props {
    data: CaregiverRecord;
}

/**
 * 시작일~종료일 사이의 날짜별 행을 생성하는 헬퍼 함수
 * 왜: 첨부 영수증 서식에서 일자별로 한 줄씩 품목(간병비)을 표시하기 때문
 */
const generateDailyRows = (data: CaregiverRecord) => {
    const rows: { date: string; item: string; qty: number; unitPrice: number; amount: number }[] = [];

    if (!data.startDate || !data.totalDays || !data.dailyRate) {
        return rows;
    }

    try {
        const start = new Date(data.startDate);
        const dailyRate = data.dailyRate;
        const totalDays = data.totalDays;

        for (let i = 0; i < totalDays; i++) {
            const current = new Date(start);
            current.setDate(current.getDate() + i);
            const month = String(current.getMonth() + 1).padStart(2, '0');
            const day = String(current.getDate()).padStart(2, '0');
            rows.push({
                date: `${month}월 ${day}일`,
                item: '간병비',
                qty: 1,
                unitPrice: dailyRate,
                amount: dailyRate,
            });
        }
    } catch {
        // 날짜 파싱 실패 시 빈 배열 반환
    }

    return rows;
};

export const Receipt: React.FC<Props> = ({ data }) => {
    const dailyRows = generateDailyRows(data);
    const totalQty = dailyRows.length;
    const totalUnitPrice = data.dailyRate || 0; // 1일 간병비 = 단가

    return (
        <div
            className="bg-white text-black p-10 relative flex flex-col"
            style={{
                width: `${DOCUMENT_DIMENSIONS.width}px`,
                height: `${DOCUMENT_DIMENSIONS.height}px`,
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                fontFamily: 'sans-serif',
                fontSize: '13px',
            }}
            id="receipt-certificate"
        >
            {/* ========== 워터마크 (중앙 배치, 텍스트 뒤에 깔림) ========== */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
                <img src="/logo.png" alt="" className="w-[550px] h-auto object-contain" style={{ opacity: 0.1 }} crossOrigin="anonymous" />
            </div>

            {/* ========== 제목 영역 ========== */}
            <h1 className="text-center font-bold tracking-[0.5em] text-blue-600 mt-2" style={{ fontSize: '28px' }}>
                {DOCUMENT_TITLES.RECEIPT}
            </h1>
            <p className="text-center text-xs text-gray-500 mb-4">(공급받는자 보관용)</p>

            {/* ========== No. / 수신자 / 귀하 ========== */}
            <table className="w-full border-collapse mb-0" style={{ borderTop: '2px solid #2563eb' }}>
                <tbody>
                    <tr>
                        <td className="border border-gray-400 px-1 py-1 text-center text-xs text-gray-500" style={{ width: '30px' }}>No.</td>
                        <td className="border border-gray-400 px-1 py-1 text-center text-xs text-gray-600" style={{ width: '70px' }}>
                            {data.issueDate ? data.issueDate.replace(/-/g, '') + '-001' : (() => {
                                const now = new Date();
                                const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000));
                                return kst.toISOString().split('T')[0].replace(/-/g, '') + '-001';
                            })()}
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center font-bold text-lg">
                            {data.patientName || ''}
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center font-bold" style={{ width: '50px' }}>귀하</td>
                    </tr>
                </tbody>
            </table>

            {/* ========== 공급자 정보 테이블 ========== */}
            <table className="w-full border-collapse mb-0">
                <tbody>
                    {/* 등록번호 */}
                    <tr>
                        <td rowSpan={4} className="border border-gray-400 text-center font-bold w-[30px] align-middle" style={{ writingMode: 'vertical-rl', letterSpacing: '0.5em' }}>
                            공급자
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs w-[70px]">등록번호</td>
                        <td className="border border-gray-400 px-2 py-1 text-sm" colSpan={3}>{data.businessNumber}</td>
                    </tr>
                    {/* 상호 + 성명 */}
                    <tr>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs">상 호</td>
                        <td className="border border-gray-400 px-2 py-1 text-sm">
                            {data.companyName}
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs w-[40px]">성<br />명</td>
                        <td className="border border-gray-400 px-2 py-1 text-sm w-[80px] relative">
                            {data.representativeName}
                            {/* 직인(도장) - 성명의 마지막 글자에 걸침, 사용확인서와 동일 사이즈(w-16 h-16) */}
                            <div className="absolute -right-2 -top-3 w-16 h-16 opacity-90 mix-blend-multiply">
                                <img src="/stamp.png" alt="직인" className="w-full h-full object-contain" crossOrigin="anonymous" />
                            </div>
                        </td>
                    </tr>
                    {/* 사업장 소재지 */}
                    <tr>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs leading-tight">사업장<br />소재지</td>
                        <td className="border border-gray-400 px-2 py-1 text-xs" colSpan={3}>{data.companyAddress}</td>
                    </tr>
                    {/* 업태 + 종목 */}
                    <tr>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs">업 태</td>
                        <td className="border border-gray-400 px-2 py-1 text-sm">서비스업</td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs">종<br />목</td>
                        <td className="border border-gray-400 px-2 py-1 text-xs">간병인알선 중개업</td>
                    </tr>
                </tbody>
            </table>

            {/* ========== 작성년월일 / 금액 / 비고 ========== */}
            <table className="w-full border-collapse mb-0">
                <tbody>
                    <tr>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs w-[100px]">작성년월일</td>
                        <td className="border border-gray-400 px-2 py-2 text-center font-bold">{data.issueDate}</td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs w-[50px]">금 액</td>
                        <td className="border border-gray-400 px-2 py-2 text-center font-bold">₩{data.totalAmount?.toLocaleString() || 0}</td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-xs w-[40px]">비 고</td>
                        <td className="border border-gray-400 px-2 py-1 w-[60px]"></td>
                    </tr>
                </tbody>
            </table>

            {/* ========== "위 금액을 영수(청구)함" ========== */}
            <div className="text-center text-xs py-1 border-x border-gray-400 font-semibold">
                위 금액을 영수(청구)함
            </div>

            {/* ========== 일별 품목 내역 테이블 ========== */}
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border border-gray-400 px-2 py-1 text-center text-xs w-[100px]">월일</th>
                        <th className="border border-gray-400 px-2 py-1 text-center text-xs">품 목</th>
                        <th className="border border-gray-400 px-2 py-1 text-center text-xs w-[50px]">수량</th>
                        <th className="border border-gray-400 px-2 py-1 text-center text-xs w-[50px]">단가</th>
                        <th className="border border-gray-400 px-2 py-1 text-center text-xs w-[100px]">금 액</th>
                    </tr>
                </thead>
                <tbody>
                    {/* 일별 행 렌더링 */}
                    {dailyRows.map((row, idx) => (
                        <tr key={idx}>
                            <td className="border border-gray-400 px-2 py-1 text-center text-sm">{row.date}</td>
                            <td className="border border-gray-400 px-2 py-1 text-center text-sm">{row.item}</td>
                            <td className="border border-gray-400 px-2 py-1 text-center text-sm">{row.qty}</td>
                            <td className="border border-gray-400 px-2 py-1 text-center text-sm">{row.unitPrice.toLocaleString()}</td>
                            <td className="border border-gray-400 px-2 py-1 text-right text-sm pr-3">{row.amount.toLocaleString()}</td>
                        </tr>
                    ))}

                    {/* 데이터가 없을 때 빈 행 표시 */}
                    {dailyRows.length === 0 && (
                        <tr>
                            <td className="border border-gray-400 px-2 py-3 text-center text-gray-400 text-xs" colSpan={5}>
                                시작일/종료일/일당을 입력하면 일별 내역이 자동 생성됩니다.
                            </td>
                        </tr>
                    )}

                    {/* ========== 합계(계) 행 ========== */}
                    <tr className="font-bold">
                        <td className="border border-gray-400 px-2 py-1 text-center text-sm">계</td>
                        <td className="border border-gray-400 px-2 py-1"></td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-sm">{totalQty || ''}</td>
                        <td className="border border-gray-400 px-2 py-1 text-center text-sm"></td>
                        <td className="border border-gray-400 px-2 py-1 text-right text-sm pr-3">{data.totalAmount?.toLocaleString() || ''}</td>
                    </tr>
                </tbody>
            </table>

        </div>
    );
};
