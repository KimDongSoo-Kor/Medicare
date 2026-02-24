import { toPng } from 'html-to-image';

export interface DocumentGenerationOptions {
    fileName?: string;
    backgroundColor?: string;
}

/**
 * 특정 HTML 요소의 ID를 기반으로 해당 영역을 PNG 이미지로 변환하여 다운로드합니다.
 * @param elementId 이미지로 변환할 대상의 HTML ID
 * @param options 생성 옵션 (파일명 등)
 */
export const generateDocumentImage = async (
    elementId: string,
    options: DocumentGenerationOptions = {}
): Promise<void> => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element with id '${elementId}' not found.`);
    }

    try {
        const defaultFileName = `document_${new Date().getTime()}.png`;
        const { fileName = defaultFileName, backgroundColor = '#ffffff' } = options;

        // 화면에 노출되지 않던 요소가 그려질 시간을 충분히 확보 (깜빡임 완화)
        await new Promise(resolve => setTimeout(resolve, 300));

        const dataUrl = await toPng(element, {
            quality: 1.0,
            pixelRatio: 2,
            backgroundColor,
            skipFonts: false, // 폰트 강제 로드
            style: {
                transform: 'scale(1)', // 변환 시 축소 스케일 초기화
                transformOrigin: 'top left'
            }
        });

        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('이미지 생성 중 오류 발생:', err);
        throw new Error('서류 이미지 생성에 실패했습니다.');
    }
};
