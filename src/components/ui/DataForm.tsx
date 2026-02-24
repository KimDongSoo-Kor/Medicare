import React from 'react';
import { CaregiverRecord } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Props {
    data: Partial<CaregiverRecord>;
    onChange: (field: keyof CaregiverRecord, value: any) => void;
}

export const DataForm: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        // 숫자 타입 처리 (일당, 총액, 총 일수)
        if (type === 'number') {
            onChange(name as keyof CaregiverRecord, value === '' ? 0 : Number(value));
        } else {
            onChange(name as keyof CaregiverRecord, value);
        }
    };

    // 날짜 간 일수 자동 계산 헬퍼
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onChange(name as keyof CaregiverRecord, value);

        // 날짜가 둘 다 있으면 총 일수를 자동 계산
        const start = name === 'startDate' ? value : data.startDate;
        const end = name === 'endDate' ? value : data.endDate;

        if (start && end) {
            const d1 = new Date(start);
            const d2 = new Date(end);
            if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
                const diffTime = Math.abs(d2.getTime() - d1.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 당일 포함이면 +1 (시작일, 종료일 모두 포함)
                onChange('totalDays', diffDays);

                // 일당이 있으면 총액도 계산
                if (data.dailyRate) {
                    onChange('totalAmount', diffDays * data.dailyRate);
                }
            }
        }
    };

    // 일당/총일수 변경 시 총액 자동 계산
    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === '' ? 0 : Number(value);
        onChange(name as keyof CaregiverRecord, numValue);

        if (name === 'dailyRate' && data.totalDays) {
            onChange('totalAmount', numValue * data.totalDays);
        }
    };

    return (
        <Card className="w-full bg-slate-900 border-slate-800 shadow-xl shadow-slate-900/50">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl text-slate-100 font-bold tracking-tight">
                    데이터 확인 및 수정
                </CardTitle>
                <p className="text-sm text-slate-400">
                    생성된 증명서의 세부 내용을 필요에 따라 수정할 수 있습니다.
                </p>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* 1. 간병인/환자 정보 */}
                <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-200 border-b border-slate-700/50 pb-2">기본 정보</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="caregiverName" className="text-slate-300">간병인 성명</Label>
                            <Input id="caregiverName" type="text" name="caregiverName" value={data.caregiverName || ''} onChange={handleChange} placeholder="홍길동" className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patientName" className="text-slate-300">환자 성명</Label>
                            <Input id="patientName" type="text" name="patientName" value={data.patientName || ''} onChange={handleChange} placeholder="김철수" className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="caregiverBirthDate" className="text-slate-300">간병인 생년월일</Label>
                            <Input id="caregiverBirthDate" type="date" name="caregiverBirthDate" value={data.caregiverBirthDate || ''} onChange={handleChange} className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-blue-500 [color-scheme:dark]" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patientBirthDate" className="text-slate-300">환자 생년월일</Label>
                            <Input id="patientBirthDate" type="date" name="patientBirthDate" value={data.patientBirthDate || ''} onChange={handleChange} className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-blue-500 [color-scheme:dark]" />
                        </div>
                    </div>
                    <div className="space-y-2 pt-2">
                        <Label htmlFor="protectorIdNumber" className="text-slate-300">보호자 주민등록번호 (있는 경우)</Label>
                        <Input id="protectorIdNumber" type="text" name="protectorIdNumber" value={data.protectorIdNumber || ''} onChange={handleChange} placeholder="123456-1234567" className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-blue-500" />
                    </div>
                </div>

                {/* 2. 간병 서비스 상세 정보 */}
                <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-200 border-b border-slate-700/50 pb-2">간병 서비스 내역</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2 md:col-span-2 text-slate-300">
                            <Label htmlFor="hospitalName">병원명</Label>
                            <Input id="hospitalName" type="text" name="hospitalName" value={data.hospitalName || ''} onChange={handleChange} placeholder="서울대학교병원" className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-slate-300">시작일</Label>
                            <Input id="startDate" type="date" name="startDate" value={data.startDate || ''} onChange={handleDateChange} className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-blue-500 [color-scheme:dark]" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-slate-300">종료일</Label>
                            <Input id="endDate" type="date" name="endDate" value={data.endDate || ''} onChange={handleDateChange} className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-blue-500 [color-scheme:dark]" />
                        </div>
                    </div>
                </div>

                {/* 3. 비용 정보 */}
                <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-200 border-b border-slate-700/50 pb-2">비용 정보</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="totalDays" className="text-slate-300">총 일수</Label>
                            <Input id="totalDays" type="number" name="totalDays" value={data.totalDays || 0} onChange={handleChange} className="bg-slate-800 border-slate-700 text-slate-100 text-right font-mono focus-visible:ring-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dailyRate" className="text-slate-300">일당 (원)</Label>
                            <Input
                                id="dailyRate"
                                type="text"
                                name="dailyRate"
                                value={data.dailyRate ? data.dailyRate.toLocaleString() : '0'}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/,/g, '');
                                    const num = raw === '' ? 0 : Number(raw);
                                    if (!isNaN(num)) {
                                        onChange('dailyRate', num);
                                        if (data.totalDays) onChange('totalAmount', num * data.totalDays);
                                    }
                                }}
                                className="bg-slate-800 border-slate-700 text-slate-100 text-right font-mono focus-visible:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="totalAmount" className="text-slate-300">총 금액 (원)</Label>
                            <Input
                                id="totalAmount"
                                type="text"
                                name="totalAmount"
                                value={data.totalAmount ? data.totalAmount.toLocaleString() : '0'}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/,/g, '');
                                    const num = raw === '' ? 0 : Number(raw);
                                    if (!isNaN(num)) onChange('totalAmount', num);
                                }}
                                className="bg-slate-800 border-slate-700 text-blue-400 font-bold text-right font-mono focus-visible:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 4. 발급 정보 */}
                <div className="space-y-4 text-slate-300">
                    <h3 className="text-base font-semibold text-slate-200 border-b border-slate-700/50 pb-2">발급 상세</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="issueDate">발급일자</Label>
                            <Input id="issueDate" type="date" name="issueDate" value={data.issueDate || ''} onChange={handleChange} className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-blue-500 [color-scheme:dark]" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
