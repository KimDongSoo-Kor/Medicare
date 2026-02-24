import { CaregiverRecord } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API 라우트 환경에서는 process.env에 접근 가능
const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    return new GoogleGenerativeAI(apiKey);
};

/**
 * 텍스트나 이미지(Base64)를 입력받아 간병 기록 데이터를 추출합니다.
 */
export async function analyzeCaregiverData(
    text?: string,
    imageBase64?: string,
    mimeType?: string
): Promise<Partial<CaregiverRecord>> {
    const genAI = getGenAI();
    // 실제 API 가용 모델 조회 결과 확인된 최신 모델 사용
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
당신은 간병비 영수증/사용확인서 전문 데이터 추출 AI입니다.
사용자가 입력한 정보(이미지 또는 텍스트)에서 다음 JSON 형식으로 정확히 데이터를 추출해 주세요.
반드시 JSON 형식만 반환해야 하며, 마크다운(\`\`\`json 등)은 제외하고 순수한 JSON 응답만 주세요.
정보가 명확하지 않거나 없는 필드는 빈 문자열("") 또는 0으로 처리하세요.

{
  "companyName": "업체명",
  "companyAddress": "업체 주소",
  "companyPhone": "업체 연락처",
  "businessNumber": "사업자번호",
  "representativeName": "대표자명",
  "caregiverName": "간병인 성명",
  "caregiverBirthDate": "간병인 생년월일 (YYYY-MM-DD)",
  "patientName": "환자명",
  "patientBirthDate": "환자 생년월일 (YYYY-MM-DD)",
  "protectorIdNumber": "보호자 주민등록번호 (예: 123456-1234567, 없는 경우 빈칸)",
  "hospitalName": "병원명(지점 포함)",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "totalDays": 0,
  "dailyRate": 0,
  "totalAmount": 0,
  "issueDate": "YYYY-MM-DD"
}

추가 조건:
- 날짜는 반드시 YYYY-MM-DD 형식으로 통일하세요.
- 주민등록번호 형식(YYMMDD-XXXXXXX) 이 있을 경우 protectorIdNumber에 추출하세요.
- 입력 텍스트나 이미지에서 '보호자'라고 지칭된 사람은 '간병인'과 동일 인물이므로, 보호자의 이름과 생년월일을 각각 caregiverName, caregiverBirthDate로 추출하세요.
- 텍스트나 이미지에 나와 있는 '금액'은 무조건 1일 간병비(일당)를 뜻합니다. 따라서 해당 금액은 **반드시 dailyRate 필드**에 넣으세요. totalAmount는 0으로 두어도 됩니다.
- 금액(dailyRate, totalAmount)은 천단위 콤마나 화폐 단위를 제거한 순수 숫자만 입력하세요.
- 이미지에 입력된 값이 분명할 경우에만 값을 채우고, 추측하지 마세요.

입력 텍스트:
${text || '텍스트 없음'}
`;

    try {
        let result;

        if (imageBase64 && mimeType) {
            // 이미지가 포함된 경우
            const imagePart = {
                inlineData: {
                    data: imageBase64.replace(/^data:image\/\w+;base64,/, ''), // prefix 제거
                    mimeType,
                },
            };
            result = await model.generateContent([prompt, imagePart]);
        } else {
            // 텍스트만 있는 경우
            result = await model.generateContent(prompt);
        }

        const responseText = result.response.text();
        // 마크다운 흔적을 제거하고 파싱
        const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsedData = JSON.parse(cleanJsonString);
        return parsedData as Partial<CaregiverRecord>;
    } catch (error: any) {
        console.error('Gemini API 분석 실패 상세 내역:', error);

        let errorMessage = '데이터 추출 중 오류가 발생했습니다.';
        if (error.message) {
            if (error.message.includes('API key not valid')) {
                errorMessage = 'API 키가 유효하지 않습니다. .env.local 파일의 API 키를 올바르게 입력했는지 확인해 주세요.';
            } else if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
                errorMessage = 'AI 응답 처리에 실패했습니다. 입력하신 텍스트 내용이 너무 부족하거나 형식이 맞지 않습니다.';
            } else {
                errorMessage = `AI 엔진 오류: ${error.message}`;
            }
        }
        throw new Error(errorMessage);
    }
}
