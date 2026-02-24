import React from 'react';
import { CaregiverRecord } from '@/types';
import { DOCUMENT_DIMENSIONS } from '@/constants';

interface Props {
    data: CaregiverRecord;
}

export const UsageCertificate: React.FC<Props> = ({ data }) => {
    return (
        <div
            className="bg-white text-black p-12 relative flex flex-col"
            style={{
                width: `${DOCUMENT_DIMENSIONS.width}px`,
                height: `${DOCUMENT_DIMENSIONS.height}px`,
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                fontFamily: 'sans-serif',
                fontSize: '14px',
            }}
            id="usage-certificate"
        >
            {/* 워터마크 (중앙 배치, 텍스트 뒤에 깔림) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
                <img src="/logo.png" alt="" className="w-[550px] h-auto object-contain" style={{ opacity: 0.1 }} crossOrigin="anonymous" />
            </div>

            {/* ========== 최상단 파란 줄 ========== */}
            <div className="w-full h-8 mb-4 border-b-[6px]" style={{ borderColor: '#005bb5' }}></div>

            {/* ========== 제목 ========== */}
            <h1 className="text-3xl font-extrabold tracking-widest mb-10 absolute top-[14px] bg-white pr-4">
                입원 간병인 사용 확인서
            </h1>

            <div className="flex-grow space-y-8 mt-4 relative z-10">
                {/* ========== 1. 환자(피보험자) ========== */}
                <div>
                    <h2 className="font-bold text-[15px] mb-1">1.환자(피보험자)</h2>
                    <table className="w-full border-collapse text-[13px]">
                        <tbody>
                            <tr>
                                <td rowSpan={2} className="border border-black bg-[#9bb0d8] text-center font-bold px-2 py-1 w-[120px]">성명</td>
                                <td rowSpan={2} className="border border-black text-center px-4 py-1 text-[14px]">{data.patientName || ' '}</td>
                                <td className="border border-black bg-[#9bb0d8] text-center font-bold px-2 py-1 w-[120px]">생년월일</td>
                                <td className="border border-black text-center px-4 py-1 text-[13px]">{data.patientBirthDate || ' '}</td>
                            </tr>
                            <tr>
                                <td className="border border-black bg-[#9bb0d8] text-center font-bold px-2 py-1 w-[120px]">의료기관</td>
                                <td className="border border-black text-center px-4 py-1">{data.hospitalName || ' '}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* ========== 2. 간병 회사 ========== */}
                <div>
                    <h2 className="font-bold text-[15px] mb-1">2.간병 회사</h2>
                    <table className="w-full border-collapse text-[13px]">
                        <tbody>
                            <tr>
                                <td className="border border-black bg-[#9bb0d8] text-center font-bold px-2 py-1 w-[120px]">업체명</td>
                                <td className="border border-black text-center px-4 py-1">{data.companyName || ' '}</td>
                                <td className="border border-black bg-[#9bb0d8] text-center font-bold px-2 py-1 w-[120px]">연락처</td>
                                <td className="border border-black text-center px-4 py-1">{data.companyPhone || ' '}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* ========== 3. 간병인 세부 사용내역 ========== */}
                <div>
                    <h2 className="font-bold text-[15px] mb-1 mt-8">3.간병인 세부 사용내역</h2>
                    <table className="w-full border-collapse text-[13px]">
                        <tbody>
                            <tr>
                                <td className="border border-black text-center font-bold px-2 py-1 w-[120px]">간병인성명</td>
                                <td className="border border-black text-center px-4 py-1">{data.caregiverName || ' '}</td>
                                <td className="border border-black text-center font-bold px-2 py-1 w-[120px]">생년월일</td>
                                <td className="border border-black text-center px-4 py-1 text-[13px]">{data.caregiverBirthDate || ' '}</td>
                            </tr>
                            <tr>
                                <td className="border border-black text-center font-bold px-2 py-1 w-[120px]">간병비</td>
                                <td className="border border-black text-center px-4 py-1">
                                    {data.totalAmount ? `${data.totalAmount.toLocaleString()} 원` : ' 원'}
                                </td>
                                <td className="border border-black text-center font-bold px-2 py-1 w-[120px]">지급일수</td>
                                <td className="border border-black text-center px-4 py-1">{data.totalDays ? `${data.totalDays}일` : ' '}</td>
                            </tr>
                            <tr>
                                <td className="border border-black text-center font-bold px-2 py-1 w-[120px]">간병인사용기간</td>
                                <td colSpan={3} className="border border-black text-center px-4 py-1">
                                    {data.startDate ? data.startDate.replace(/-/g, '/') : ''}~{data.endDate ? data.endDate.replace(/-/g, '/') : ''}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========== 하단 안내문 (세로 중앙 배치) ========== */}
            <div className="flex-grow flex flex-col justify-center items-center relative z-10 w-full min-h-[150px]">
                <div className="text-[18px] text-center text-gray-800 font-semibold">
                    상기와 같이 환자(피보험자)를 간병하였음을 확인합니다.
                </div>
            </div>

            <div className="mt-12 text-right text-[14px] relative z-10 mr-16">
                발급일자 {data.issueDate}
            </div>

            {/* ========== 공급자 정보 및 직인 ========== */}
            <div className="mt-6 text-right relative z-10 flex flex-col items-end mr-6 gap-0">
                <div className="flex items-center mr-2 relative">
                    <span className="text-[20px] font-extrabold tracking-widest">{data.companyName}</span>
                    {/* 직인(도장) - 클라우드나인 메디케어의 '어'자 위치(-right-2 정도)에 겹치도록 설정 */}
                    <div className="absolute -right-2 top-[-10px] w-16 h-16 opacity-90 mix-blend-multiply pointer-events-none">
                        <img src="/stamp.png" alt="직인" className="w-full h-full object-contain" crossOrigin="anonymous" />
                    </div>
                </div>
                <div className="text-[13px] text-gray-700 leading-tight pr-20">{data.businessNumber}</div>
                <div className="text-[13px] text-gray-700 leading-tight pr-20">{data.companyAddress}</div>
            </div>

            {/* ========== 최하단 작은 주석 ========== */}
            <div className="mt-16 text-[11px] text-gray-600 leading-tight relative z-10">
                *본 간병 노무 계약의 당사자는 구인자와 구직자 이며, 당사는 간병인 알선 업체로써 양 당사자를 중개합니다.<br />
                계약 당사자간 불성실 간병 또는 허위 간병의 경우 당사는 어떠한 법적 책임이나 의무도 부담하지 아니 합니다.
            </div>
        </div>
    );
};
