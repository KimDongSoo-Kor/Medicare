import { NextRequest, NextResponse } from 'next/server';
import { analyzeCaregiverData } from '@/lib/analyzer';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, imageBase64, mimeType } = body;

        if (!text && !imageBase64) {
            return NextResponse.json(
                { error: '텍스트나 이미지 정보가 필요합니다.' },
                { status: 400 }
            );
        }

        // Gemini API 호출하여 데이터 분석
        const extractedData = await analyzeCaregiverData(text, imageBase64, mimeType);

        return NextResponse.json({
            success: true,
            data: extractedData
        });
    } catch (error: any) {
        console.error('분석 API 에러:', error);
        return NextResponse.json(
            { success: false, error: error.message || '데이터 구조화 처리에 실패했습니다.' },
            { status: 500 }
        );
    }
}
