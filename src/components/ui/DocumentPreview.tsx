import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ZoomIn, ZoomOut, Maximize, Share2 } from 'lucide-react';
import { CaregiverRecord } from '@/types';
import { AffiliationCertificate } from '../documents/AffiliationCertificate';
import { UsageCertificate } from '../documents/UsageCertificate';
import { Receipt } from '../documents/Receipt';
import { Invoice } from '../documents/Invoice';
import { generateDocumentImage, getDocumentImageDataUrl } from '@/lib/documentGenerator';
import { DOCUMENT_DIMENSIONS } from '@/constants';

interface Props {
    data: CaregiverRecord;
}

type TabType = 'AFFILIATION' | 'USAGE' | 'RECEIPT' | 'INVOICE';

// 확대/축소 단위(10%)와 최솟값/최댓값
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 1.5;

export const DocumentPreview: React.FC<Props> = ({ data }) => {
    const [activeTab, setActiveTab] = useState<TabType>('RECEIPT');
    const [isGenerating, setIsGenerating] = useState(false);
    const [scale, setScale] = useState(1);
    // 접속 환경이 모바일인지 여부: 버튼 이름/아이콘 및 공유/다운로드 동작을 결정함
    const [isMobile, setIsMobile] = useState(false);

    // 마우스 드래그 스크롤 상태
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    // 미리보기 영역의 실제 DOM 사이즈를 추적하는 ref
    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * 컨테이너 크기에 맞춰 A4 문서를 "fit" 하도록 디폴트 스케일 계산
     * 가로/세로 모두 넘치지 않는 최적 배율을 구함
     */
    const calculateFitScale = useCallback(() => {
        if (!containerRef.current) return 0.5; // fallback
        const containerWidth = containerRef.current.clientWidth - 48;  // padding 24px 양쪽
        const containerHeight = containerRef.current.clientHeight - 48;

        const scaleX = containerWidth / DOCUMENT_DIMENSIONS.width;
        const scaleY = containerHeight / DOCUMENT_DIMENSIONS.height;

        // 둘 중 작은 쪽에 맞춰야 넘치지 않음
        return Math.min(scaleX, scaleY, 1); // 최대 1배(원본)까지만
    }, []);

    useEffect(() => {
        // 접속 환경이 모바일인지 감지 (버튼 이름/동작 분기용)
        // 데스크탑 크롬 개발자 도구나 특정 윈도우 환경에서 userAgent로 모바일을 판별하는 것은 부정확할 수 있으므로
        // 터치 기기 등 미디어 쿼리를 기반으로 모바일 환경을 판단합니다.
        const mobile = window.matchMedia("(any-pointer: coarse)").matches ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setIsMobile(mobile);
    }, []);

    useEffect(() => {
        const updateScale = () => setScale(calculateFitScale());
        // 초기 로딩 시 약간의 딜레이 후 계산 (DOM이 그려진 후)
        const timer = setTimeout(updateScale, 100);

        window.addEventListener('resize', updateScale);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateScale);
        };
    }, [calculateFitScale]);

    const handleZoomIn = () => setScale(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
    const handleZoomOut = () => setScale(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
    const handleFitToScreen = () => setScale(calculateFitScale());

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || scale <= calculateFitScale() + 0.01) return;
        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setStartY(e.pageY - containerRef.current.offsetTop);
        setScrollLeft(containerRef.current.scrollLeft);
        setScrollTop(containerRef.current.scrollTop);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !containerRef.current) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const y = e.pageY - containerRef.current.offsetTop;
        const walkX = (x - startX) * 1.5; // 스크롤 민감도
        const walkY = (y - startY) * 1.5;
        containerRef.current.scrollLeft = scrollLeft - walkX;
        containerRef.current.scrollTop = scrollTop - walkY;
    };

    const tabs: { id: TabType; label: string; elementId: string }[] = [
        { id: 'RECEIPT', label: '영수증', elementId: 'receipt-certificate' },
        { id: 'USAGE', label: '사용확인서', elementId: 'usage-certificate' },
        { id: 'AFFILIATION', label: '소속확인서', elementId: 'affiliation-certificate' },
        { id: 'INVOICE', label: '청구서', elementId: 'invoice-certificate' },
    ];

    const saveHistory = (docType: TabType) => {
        try {
            const raw = localStorage.getItem('caregiverIssueHistory');
            const history = raw ? JSON.parse(raw) : [];
            const newIssue = {
                id: Date.now().toString() + Math.random().toString(36).substring(7),
                issueDate: new Date().toLocaleString('ko-KR'),
                documentType: docType,
                patientName: data.patientName || '-',
                caregiverName: data.caregiverName || '-',
                totalAmount: data.totalAmount || 0,
            };
            history.unshift(newIssue); // 최신 내역을 앞에 추가
            localStorage.setItem('caregiverIssueHistory', JSON.stringify(history));
        } catch (e) {
            console.error('이력 저장 실패', e);
        }
    };

    const handleDownloadSingle = async () => {
        const currentTab = tabs.find(t => t.id === activeTab);
        if (!currentTab) return;

        setIsGenerating(true);
        try {
            await generateDocumentImage(currentTab.elementId, {
                fileName: `${data.patientName || '환자'}_${currentTab.label}_${data.issueDate || '발급일'}.png`
            });
            saveHistory(currentTab.id); // 성공 시 이력 저장
        } catch (err) {
            alert('다운로드 중 오류가 발생했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    /**
     * dataUrl 문자열을 File 객체로 변환하는 헬퍼
     * 왜: Web Share API는 File[] 배열을 받기 때문에 변환이 필요함
     */
    const dataUrlToFile = (dataUrl: string, fileName: string): File => {
        const [header, base64Data] = dataUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/png';
        const binary = atob(base64Data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new File([bytes], fileName, { type: mimeType });
    };

    /**
     * 4종 서류를 이미지로 변환 후 Web Share API로 공유합니다.
     * - 모바일(Android/iOS): navigator.share() 사용 → 카카오톡 등 공유 시트 열림
     * - 데스크탑: Chrome도 canShare()가 true지만 파일 공유 시 오류 다이얼로그가 뜨므로
     *   userAgent로 모바일 여부를 먼저 판단하여 데스크탑은 바로 다운로드 처리
     */
    const handleShareAll = async () => {
        setIsGenerating(true);
        try {
            const patientName = data.patientName || '환자';
            const issueDate = data.issueDate || '발급일';

            // 1단계: 4종 서류를 모두 이미지로 변환
            const files: File[] = [];
            for (const tab of tabs) {
                const fileName = `${patientName}_${tab.label}_${issueDate}.png`;
                const dataUrl = await getDocumentImageDataUrl(tab.elementId, { backgroundColor: '#ffffff' });
                files.push(dataUrlToFile(dataUrl, fileName));
                saveHistory(tab.id);
            }

            // 2단계: 실제 모바일 환경인지 userAgent로 판단
            // 왜: 데스크탑 Chrome도 navigator.canShare()가 true를 반환하지만
            //     파일 공유 시 "다시 시도하세요" 오류 다이얼로그가 뜨는 문제가 있음
            const isMobileEnv = window.matchMedia("(any-pointer: coarse)").matches ||
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            const canMobileShare = isMobileEnv &&
                typeof navigator.share === 'function' &&
                navigator.canShare &&
                navigator.canShare({ files });

            if (canMobileShare) {
                // 모바일 환경: 카카오톡, 갤러리 앱 등 공유 시트 열림
                await navigator.share({
                    title: `${patientName} 간병 서류 4종`,
                    text: `${patientName}님 간병 서류 4종 (영수증, 사용확인서, 소속확인서, 청구서)`,
                    files,
                });
            } else {
                // 데스크탑 또는 share 미지원 환경: 1장씩 자동 다운로드
                for (const file of files) {
                    const objectUrl = URL.createObjectURL(file);
                    const link = document.createElement('a');
                    link.href = objectUrl;
                    link.download = file.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
                    await new Promise(resolve => setTimeout(resolve, 800));
                }
            }
        } catch (err) {
            // 사용자가 공유 취소한 경우는 에러 아님
            if (err instanceof Error && err.name !== 'AbortError') {
                console.error(err);
                alert('공유 중 오류가 발생했습니다.');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 flex flex-col h-full overflow-hidden">
            {/* 상단 탭 + 다운로드 버튼 */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-5">
                {/* 서류 선택 2x2 그리드 버튼 */}
                <div className="grid grid-cols-2 gap-2 w-full xl:w-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 shadow-sm ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500/50 scale-[1.02]'
                                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-slate-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto mt-4 xl:mt-0">
                    <button
                        onClick={handleDownloadSingle}
                        disabled={isGenerating}
                        className="flex-1 flex justify-center items-center px-4 md:px-8 py-2.5 sm:py-2 bg-slate-700 text-white text-xs md:text-sm font-semibold rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        <Download size={16} className="mr-2 shrink-0" />
                        현재 서류 다운로드
                    </button>
                    <button
                        onClick={handleShareAll}
                        disabled={isGenerating}
                        className="flex-1 flex justify-center items-center px-4 md:px-8 py-2.5 sm:py-2 bg-blue-600 text-white text-xs md:text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        {/* isMobile에 따라 아이콘과 버튼 이름을 다르게 표시 */}
                        {isMobile
                            ? <Share2 size={16} className="mr-2 shrink-0" />
                            : <Download size={16} className="mr-2 shrink-0" />}
                        {isMobile ? '4종 모두 공유' : '4종 모두 다운로드'}
                    </button>
                </div>
            </div>

            {/* 확대/축소 컨트롤 바 */}
            <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/30 flex items-center justify-center space-x-3">
                <button
                    onClick={handleZoomOut}
                    disabled={scale <= MIN_ZOOM}
                    className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="축소"
                >
                    <ZoomOut size={18} />
                </button>

                {/* 현재 배율 표시 */}
                <span className="text-sm font-mono text-slate-400 min-w-[60px] text-center select-none">
                    {Math.round(scale * 100)}%
                </span>

                <button
                    onClick={handleZoomIn}
                    disabled={scale >= MAX_ZOOM}
                    className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="확대"
                >
                    <ZoomIn size={18} />
                </button>

                <div className="w-px h-5 bg-slate-700 mx-1" />

                <button
                    onClick={handleFitToScreen}
                    className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                    title="화면에 맞추기"
                >
                    <Maximize size={18} />
                </button>
            </div>

            {/* 서류 미리보기 영역: CSS transform으로 확대/축소 및 마우스 드래그 스크롤 */}
            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={`flex-1 p-6 bg-slate-950 flex justify-center items-start shadow-inner ${
                    // 스케일이 화면 맞춤(디폴트) 이하일 때는 스크롤을 막고, 확대 시에만 스크롤 허용
                    scale <= calculateFitScale() + 0.01
                        ? 'overflow-hidden cursor-default'
                        : isDragging ? 'overflow-hidden cursor-grabbing' : 'overflow-auto cursor-grab'
                    }`}
            >
                <div
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        // 축소 시에도 스크롤 영역이 올바르게 계산되도록 실제 크기 지정
                        width: DOCUMENT_DIMENSIONS.width,
                        height: DOCUMENT_DIMENSIONS.height,
                        pointerEvents: isDragging ? 'none' : 'auto', // 드래그 중 내부 텍스트 선택 방지
                        // 서류 래퍼 레벨에서 다크모드 차단 (이중 보호)
                        backgroundColor: '#ffffff',
                        colorScheme: 'only light' as unknown as 'light',
                    }}
                >
                    {/* 모든 서류를 렌더하되 활성 탭만 표시 
                        주의: html-to-image 모듈은 display: none 인 요소를 이미지로 그릴 수 없어 손상된 이미지를 반환합니다.
                        따라서 안 보이는 탭은 화면 밖(absolute)으로 치워 렌더링되게 유지합니다. */}
                    <div className={activeTab === 'RECEIPT' ? 'block' : 'absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none'}>
                        <Receipt data={data} />
                    </div>
                    <div className={activeTab === 'USAGE' ? 'block' : 'absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none'}>
                        <UsageCertificate data={data} />
                    </div>
                    <div className={activeTab === 'AFFILIATION' ? 'block' : 'absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none'}>
                        <AffiliationCertificate data={data} />
                    </div>
                    <div className={activeTab === 'INVOICE' ? 'block' : 'absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none'}>
                        <Invoice data={data} />
                    </div>
                </div>
            </div>
        </div>
    );
};
