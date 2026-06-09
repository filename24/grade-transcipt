import { z } from 'zod'

const MAX_BULK_ENTRIES = 500

// 추가 정보 항목 이름/값의 공통 제약
export const UserInfoFieldSchema = z.object({
  name: z.string().trim().min(1).max(100),
  data: z.string().trim().min(1).max(500)
})

// 일괄 입력 미리보기 요청 (붙여넣은 원본 텍스트). 항목 이름은 저장(commit) 단계에서만 필요하다.
export const PreviewBulkSchema = z.object({
  raw: z.string().min(1).max(100_000)
})

// 일괄 저장 요청 (이름 매칭이 끝난 항목들)
export const CommitBulkSchema = z.object({
  name: z.string().trim().min(1).max(100),
  entries: z
    .array(
      z.object({
        userId: z.string().uuid(),
        data: z.string().trim().min(1).max(500)
      })
    )
    .min(1)
    .max(MAX_BULK_ENTRIES)
})

// 개별 추가/수정 요청 (항목 이름 기준 upsert)
export const UpsertUserInfoSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  data: z.string().trim().min(1).max(500)
})

// PK 기준 수정 요청 (인라인 편집 — 항목 이름 변경 허용)
export const UpdateUserInfoByIdSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  data: z.string().trim().min(1).max(500)
})

// 일괄 삭제 요청
export const BulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500)
})

// 전체 목록 조회 필터
export const ListUserInfoQuerySchema = z.object({
  name: z.string().trim().max(100).optional(),
  query: z.string().trim().max(100).optional(),
  skip: z.number().int().min(0).default(0),
  take: z.number().int().min(1).max(100).default(20)
})

export type PreviewBulkInput = z.infer<typeof PreviewBulkSchema>
export type CommitBulkInput = z.infer<typeof CommitBulkSchema>
export type UpsertUserInfoInput = z.infer<typeof UpsertUserInfoSchema>
export type UpdateUserInfoByIdInput = z.infer<typeof UpdateUserInfoByIdSchema>
export type ListUserInfoQuery = z.infer<typeof ListUserInfoQuerySchema>
export type BulkDeleteInput = z.infer<typeof BulkDeleteSchema>
