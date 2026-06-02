import { GradeStatus, type GradeStatusType } from '@gt/esis'

import { Badge } from '@/components/ui/badge'

// /dash/grade 와 관리자 성적 편집 테이블에서 공유하는 상태 뱃지.
const STATUS_BADGE_CLASS: Record<GradeStatusType, string> = {
  APPROVED: 'bg-[#c0f1b6] text-[#548164] dark:bg-[#375841] dark:text-[#64d88d]',
  NEW: 'bg-[#c1e6f4] text-[#487CA5] dark:bg-[#2f4469] dark:text-[#63a1fc]',
  PENDING: 'bg-[#eedeaa] text-[#C29343] dark:bg-[#836534] dark:text-[#e4ab43]',
  REJECTED: 'bg-[#f6baba] text-[#C4554D] dark:bg-[#673932] dark:text-[#e66359]'
}

export function GradeStatusBadge({
  status
}: {
  status: GradeStatusType | null | undefined
}) {
  if (!status) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <Badge variant="secondary" className={STATUS_BADGE_CLASS[status]}>
      {GradeStatus[status]}
    </Badge>
  )
}
