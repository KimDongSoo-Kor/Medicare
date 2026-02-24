export interface CaregiverRecord {
  // 회사 정보
  companyName: string;        // 업체명
  companyAddress: string;     // 업체 주소
  companyPhone: string;       // 연락처
  businessNumber: string;     // 사업자등록번호
  representativeName: string; // 대표자명

  // 간병인 정보
  caregiverName: string;      // 간병인 성명
  caregiverBirthDate?: string;// 간병인 생년월일

  // 환자 정보
  patientName: string;        // 환자 성명
  patientBirthDate?: string;  // 환자 생년월일
  protectorIdNumber?: string; // 보호자 주민등록번호

  // 서비스 정보
  hospitalName: string;       // 병원명
  startDate: string;          // 간병 시작일 (YYYY-MM-DD 형식)
  endDate: string;            // 간병 종료일 (YYYY-MM-DD 형식)
  totalDays: number;          // 총 일수
  dailyRate: number;          // 일당 (원)
  totalAmount: number;        // 총 금액 (원)

  // 발급 정보
  issueDate: string;          // 발급일 (YYYY-MM-DD 형식)
}

export enum DocumentType {
  AFFILIATION = 'AFFILIATION', // 소속확인서
  USAGE = 'USAGE',             // 사용확인서
  RECEIPT = 'RECEIPT',         // 영수증
  INVOICE = 'INVOICE',         // 청구서
}

export interface IssueHistory {
  id: string;             // 고유 ID (예: 타임스탬프)
  issueDate: string;      // 실제 발급(다운로드) 한 일시 (YYYY-MM-DD HH:mm:ss)
  documentType: DocumentType;
  patientName: string;    // 환자 성명
  caregiverName: string;  // 간병인 성명
  totalAmount?: number;   // 총 금액 (영수증 등에 표시됨)
}
