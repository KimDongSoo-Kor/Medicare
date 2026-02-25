import { toPng } from 'html-to-image';

export interface DocumentGenerationOptions {
    fileName?: string;
    backgroundColor?: string;
}

/**
 * HTML 요소를 PNG dataUrl 문자열로 변환하여 반환합니다.
 * 왜: Web Share API로 파일을 공유할 때 File 객체 생성이 필요하므로
 *    dataUrl을 직접 반환하는 함수를 분리했습니다.
 */
export const getDocumentImageDataUrl = async (
    elementId: string,
    options: DocumentGenerationOptions = {}
): Promise<string> => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element with id '${elementId}' not found.`);
    }

    const { backgroundColor = '#ffffff' } = options;

    // 화면 밖에 있던 요소가 렌더링될 시간을 충분히 확보
    await new Promise(resolve => setTimeout(resolve, 300));

    return toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor,
        skipFonts: false,
        style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
        }
    });
};

/**
 * 특정 HTML 요소의 ID를 기반으로 해당 영역을 PNG 이미지로 변환하여 다운로드합니다.
 * @param elementId 이미지로 변환할 대상의 HTML ID
 * @param options 생성 옵션 (파일명 등)
 */
export const generateDocumentImage = async (
    elementId: string,
    options: DocumentGenerationOptions = {}
): Promise<void> => {
    const { fileName = `document_${new Date().getTime()}.png` } = options;

    try {
        const dataUrl = await getDocumentImageDataUrl(elementId, options);

        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('이미지 생성 중 오류 발생:', err);
        throw new Error('서류 이미지 생성에 실패했습니다.');
    }
};
