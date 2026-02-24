'use client';

import React, { useState, useEffect } from 'react';
import { DEFAULT_COMPANY_INFO } from '@/constants';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const [companyInfo, setCompanyInfo] = useState(DEFAULT_COMPANY_INFO);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        // 마운트 시 로컬 스토리지에서 회사 정보 불러오기
        const saved = localStorage.getItem('caregiverCompanyInfo');
        if (saved) {
            try {
                setCompanyInfo(JSON.parse(saved));
            } catch (e) {
                console.error('설정 파싱 오류');
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCompanyInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('caregiverCompanyInfo', JSON.stringify(companyInfo));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const inputClass = "w-full border border-slate-700 bg-slate-800 text-slate-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-slate-500";
    const labelClass = "block text-sm font-semibold text-slate-300 mb-2";

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-8">
                <h2 className="text-2xl font-bold text-slate-100 mb-2">설정</h2>
                <p className="text-slate-400 mb-8 border-b border-slate-800 pb-4">
                    서류에 기본으로 출력될 우리 회사(간병인 업체) 정보를 설정합니다. 한 번 저장하면 계속 유지됩니다.
                </p>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>업체명</label>
                            <input type="text" name="companyName" value={companyInfo.companyName} onChange={handleChange} className={inputClass} placeholder="예: 무지개 간병 협회" />
                        </div>
                        <div>
                            <label className={labelClass}>대표자명</label>
                            <input type="text" name="representativeName" value={companyInfo.representativeName} onChange={handleChange} className={inputClass} placeholder="홍길동" />
                        </div>
                        <div>
                            <label className={labelClass}>사업자등록번호</label>
                            <input type="text" name="businessNumber" value={companyInfo.businessNumber} onChange={handleChange} className={inputClass} placeholder="123-45-67890" />
                        </div>
                        <div>
                            <label className={labelClass}>연락처</label>
                            <input type="text" name="companyPhone" value={companyInfo.companyPhone} onChange={handleChange} className={inputClass} placeholder="02-123-4567" />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>사업장 주소</label>
                            <input type="text" name="companyAddress" value={companyInfo.companyAddress} onChange={handleChange} className={inputClass} placeholder="서울특별시 강남구 테헤란로 123" />
                        </div>
                    </div>

                    <div className="pt-6 flex items-center justify-end space-x-4 border-t border-slate-800 mt-8">
                        {isSaved && <span className="text-green-400 font-semibold inline-flex items-center">✅ 저장되었습니다!</span>}
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-2 border border-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            메인으로 돌아가기
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm"
                        >
                            설정 저장하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
