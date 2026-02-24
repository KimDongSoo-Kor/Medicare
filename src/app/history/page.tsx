'use client';

import React, { useEffect, useState } from 'react';
import { IssueHistory, DocumentType } from '@/types';
import { Trash2, ArrowLeft } from 'lucide-react';

export default function HistoryPage() {
    const [history, setHistory] = useState<IssueHistory[]>([]);

    useEffect(() => {
        const loadHistory = () => {
            try {
                const raw = localStorage.getItem('caregiverIssueHistory');
                if (raw) {
                    setHistory(JSON.parse(raw));
                }
            } catch (e) {
                console.error('발급 이력 로드 실패', e);
            }
        };
        loadHistory();
    }, []);

    const handleDeleteAll = () => {
        if (confirm('모든 발급 이력을 삭제하시겠습니까?')) {
            localStorage.removeItem('caregiverIssueHistory');
            setHistory([]);
        }
    };

    const handleDeleteItem = (id: string) => {
        if (confirm('해당 기록을 삭제하시겠습니까?')) {
            const newHistory = history.filter(item => item.id !== id);
            localStorage.setItem('caregiverIssueHistory', JSON.stringify(newHistory));
            setHistory(newHistory);
        }
    };

    const getDocTypeName = (type: DocumentType) => {
        switch (type) {
            case DocumentType.AFFILIATION: return '소속확인서';
            case DocumentType.USAGE: return '사용확인서';
            case DocumentType.RECEIPT: return '영수증';
            default: return '알 수 없음';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <a href="/" className="p-2 border border-slate-700 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
                        <ArrowLeft size={20} />
                    </a>
                    <h1 className="text-2xl font-bold">발급 이력 관리</h1>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={handleDeleteAll}
                        className="px-4 py-2 bg-red-600/20 text-red-500 border border-red-800/50 rounded-lg hover:bg-red-600/40 transition text-sm flex items-center gap-2"
                    >
                        <Trash2 size={16} /> 전부 지우기
                    </button>
                )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg min-h-[400px]">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20 mt-10">
                        <p>저장된 발급 이력이 없습니다.</p>
                        <p className="text-sm mt-2">서류를 다운로드하면 이곳에 기록됩니다.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-800 border-b border-slate-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-slate-300">발급 일시</th>
                                    <th className="px-4 py-3 font-semibold text-slate-300">서류 종류</th>
                                    <th className="px-4 py-3 font-semibold text-slate-300">환자 성명</th>
                                    <th className="px-4 py-3 font-semibold text-slate-300">간병인 성명</th>
                                    <th className="px-4 py-3 font-semibold text-slate-300 text-right">금액</th>
                                    <th className="px-4 py-3 font-semibold text-slate-300 text-center">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {history.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3 text-slate-400">{item.issueDate}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded-md text-xs border border-blue-800/30">
                                                {getDocTypeName(item.documentType)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-200">{item.patientName}</td>
                                        <td className="px-4 py-3 text-slate-300">{item.caregiverName}</td>
                                        <td className="px-4 py-3 text-right text-slate-300">
                                            {item.totalAmount ? `₩${item.totalAmount.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="p-1 text-slate-500 hover:text-red-400 transition"
                                                title="기록 삭제"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
