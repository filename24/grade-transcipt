// admin/users/info 기능에서 서버 액션과 클라이언트 컴포넌트가 공유하는 타입.
// 단일 출처로 두어 반환 형태 변경 시 타입 드리프트를 막는다.

export type MatchCandidate = {
  id: string
  name: string
  registerNumber: string
}

export type PreviewStatus = 'matched' | 'ambiguous' | 'not_found'

export type PreviewRow = {
  index: number
  rawName: string
  data: string
  status: PreviewStatus
  userId?: string
  candidates?: MatchCandidate[]
}

export type InfoItem = {
  id: string
  name: string
  data: string
}

// 전체 목록 페이지의 한 행 (학생 정보를 평탄화하여 포함)
export type UserInfoListRow = {
  id: string
  name: string
  data: string
  studentName: string
  registerNumber: string
}
