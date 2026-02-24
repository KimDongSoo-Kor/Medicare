'use client';

import React, { useState, useEffect } from 'react';
import { TextUploader } from '@/components/ui/TextUploader';
import { DataForm } from '@/components/ui/DataForm';
import { DocumentPreview } from '@/components/ui/DocumentPreview';
import { CaregiverRecord } from '@/types';
import { DEFAULT_COMPANY_INFO } from '@/constants';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<CaregiverRecord>({
    ...DEFAULT_COMPANY_INFO,
    caregiverName: '',
    caregiverBirthDate: '',
    patientName: '',
    patientBirthDate: '',
    protectorIdNumber: '',
    hospitalName: '',
    startDate: '',
    endDate: '',
    totalDays: 0,
    dailyRate: 0,
    totalAmount: 0,
    // 한국(KST) 기준 오늘 날짜를 YYYY-MM-DD 형식으로 안정적으로 생성
    issueDate: (() => {
      const now = new Date();
      const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000));
      return kst.toISOString().split('T')[0];
    })(),
  });

  // 초기 렌더링 시 로컬스토리지에서 회사 정보 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('caregiverCompanyInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('회사 정보 로드 실패');
      }
    }
  }, []);


  const handleTextSubmit = async (text: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '서버 오류가 발생했습니다.');
      }

      // 분석된 데이터 병합 (기존 회사 정보 보존 및 총액 자동 계산)
      setData(prev => {
        const merged = { ...prev, ...result.data };

        // 텍스트/이미지에서 추출된 금액(dailyRate)과 계산된 총 일수(totalDays) 기반으로 총액 강제 세팅
        if (merged.dailyRate && merged.totalDays) {
          merged.totalAmount = merged.dailyRate * merged.totalDays;
        }

        return {
          ...merged,
          // API에서 빈 값으로 왔을 경우를 대비해 기존 회사 정보가 덮어씌워지지 않도록 방어 로직
          companyName: result.data.companyName || prev.companyName,
          companyAddress: result.data.companyAddress || prev.companyAddress,
          companyPhone: result.data.companyPhone || prev.companyPhone,
          businessNumber: result.data.businessNumber || prev.businessNumber,
          representativeName: result.data.representativeName || prev.representativeName,
          issueDate: result.data.issueDate || prev.issueDate,
        };
      });

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '이미지 분석에 실패했습니다. 직접 입력해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataChange = (field: keyof CaregiverRecord, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="mb-8 md:mb-12 text-center md:text-left">
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
          간병인 영수증 발급 시스템
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
          AI가 간병 내역 텍스트를 분석하여 <strong>사용자 증명서, 간병인 영수증, 소속 증명서</strong>를 자동으로 생성합니다.
        </p>
      </div>

      {/* 1단계: 입력 영역 */}
      <section className="bg-card rounded-2xl shadow-xl shadow-background/40 border border-border/50 p-6 md:p-10 relative overflow-hidden">
        {/* Subtle decorative background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <h2 className="text-xl md:text-2xl font-semibold mb-3 tracking-tight text-card-foreground">
          1. 간병 내역 텍스트 분석
        </h2>
        <p className="text-muted-foreground mb-8 text-sm max-w-2xl">
          카카오톡이나 문자로 받은 간병 내역을 아래에 붙여넣어주세요. AI가 자동으로 빈칸을 채워줍니다.
        </p>

        <div className="relative z-10">
          <TextUploader onTextSubmit={handleTextSubmit} isLoading={isLoading} />
        </div>

        {errorMsg && (
          <div className="mt-6 p-4 bg-destructive/10 text-destructive-foreground rounded-lg text-sm border border-destructive/20 font-medium">
            ❌ {errorMsg}
          </div>
        )}
      </section>

      {/* 2단계: 폼 & 3단계: 미리보기 화면 (Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-10">
        <section className="xl:col-span-5">
          <DataForm data={data} onChange={handleDataChange} />
        </section>

        <section className="xl:col-span-7 h-[850px] relative">
          <div className="absolute inset-x-0 -top-6 -bottom-6 bg-gradient-to-br from-primary/5 to-transparent -z-10 rounded-3xl" />
          <h2 className="text-xl md:text-2xl font-semibold mb-6 tracking-tight text-foreground px-2 xl:px-0">
            문서 미리보기
          </h2>
          <DocumentPreview data={data} />
        </section>
      </div>
    </div>
  );
}
