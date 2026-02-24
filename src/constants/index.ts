export const DEFAULT_COMPANY_INFO = {
    companyName: 'OOO 간병 서비스',
    companyAddress: '서울특별시 강남구 테헤란로 123',
    companyPhone: '02-1234-5678',
    businessNumber: '123-45-67890',
    representativeName: '홍길동',
};

export const DOCUMENT_TITLES = {
    AFFILIATION: '소 속 확 인 서',
    USAGE: '입원 간병인 사용 확인서',
    RECEIPT: '영 수 증',
    INVOICE: '청 구 서',
};

// 서류 생성 시 적용할 A4 비율 (가로세로 비율 약 1:1.414)
export const DOCUMENT_DIMENSIONS = {
    width: 794,  // 210mm at 96 DPI
    height: 1123 // 297mm at 96 DPI
};
