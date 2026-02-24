import React from 'react';
import { CaregiverRecord } from '@/types';
import { DOCUMENT_TITLES, DOCUMENT_DIMENSIONS } from '@/constants';

interface Props {
    data: CaregiverRecord;
}

export const Invoice: React.FC<Props> = ({ data }) => {
    // 요구사항: 7,000원 * 간병일수
    const feePerDay = 7000;
    const totalFee = feePerDay * (data.totalDays || 0);

    return (
        <div
            className="bg-white text-black p-10 relative flex flex-col items-center"
            style={{
                width: `${DOCUMENT_DIMENSIONS.width}px`,
                height: `${DOCUMENT_DIMENSIONS.height}px`,
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                fontFamily: 'sans-serif',
                fontSize: '16px', // 일반 영수증보다 글씨를 다소 크게 설정
            }}
            id="invoice-certificate"
        >
            {/* ========== 워터마크 (중앙 배치, 텍스트 뒤에 깔림) ========== */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
                <img src="/logo.png" alt="" className="w-[550px] h-auto object-contain" style={{ opacity: 0.1 }} crossOrigin="anonymous" />
            </div>

            {/* ========== 제목 영역 ========== */}
            <h1 className="font-bold tracking-[0.5em] text-blue-600 mt-20 mb-16" style={{ fontSize: '36px' }}>
                {DOCUMENT_TITLES.INVOICE}
            </h1>

            {/* ========== 본문 내용 ========== */}
            <div className="w-full max-w-lg mt-10 p-12 border-2 border-gray-800 rounded-xl leading-loose bg-white shadow-sm" style={{ zIndex: 1, fontSize: '20px' }}>
                <p className="mb-6 font-bold text-2xl border-b-2 border-gray-200 pb-4">
                    <span className="text-blue-700">{data.patientName || '(환자 성명)'}</span>님
                </p>

                <div className="space-y-4 mb-8">
                    <p className="flex justify-between">
                        <span className="text-gray-600 font-bold w-24">계좌번호</span>
                        <span className="font-bold tracking-wider">카카오뱅크 3333-3093-7046</span>
                    </p>
                    <p className="flex justify-between">
                        <span className="text-gray-600 font-bold w-24">예금주</span>
                        <span className="font-bold">클라우드나인 메디케어</span>
                    </p>
                </div>

                <div className="bg-gray-100 p-6 rounded-lg mb-8 text-center text-xl">
                    <p className="mb-2 font-bold text-gray-700">산출 내역</p>
                    <p className="font-mono text-gray-800">
                        7,000원 &times; <span className="text-blue-600 font-bold">{data.totalDays || 0}일</span>
                        <span className="mx-4">=</span>
                        <span className="text-2xl font-bold text-red-600">{totalFee.toLocaleString()}원</span>
                    </p>
                </div>

                <p className="text-center font-bold text-2xl mt-4">
                    입금 부탁드립니다.
                </p>
            </div>

            {/* ========== 직인 및 업체 정보 ========== */}
            <div className="mt-auto mb-20 text-center w-full" style={{ zIndex: 1 }}>
                <p className="text-xl mb-6">{data.issueDate}</p>
                <div className="flex items-center justify-center relative inline-block">
                    <span className="text-2xl font-bold mr-4">{data.companyName}</span>
                    <span className="text-xl font-bold relative">
                        {data.representativeName} (인)
                        {/* 직인(도장) */}
                        <div className="absolute -right-10 -top-6 w-20 h-20 opacity-90 mix-blend-multiply pointer-events-none">
                            <img src="/stamp.png" alt="직인" className="w-full h-full object-contain" crossOrigin="anonymous" />
                        </div>
                    </span>
                </div>
            </div>
        </div>
    );
};
