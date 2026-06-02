import type { Row } from '@tanstack/react-table'

/**
 * displayName은 "<성 이니셜>.<이름>" 형식이다 (예: "A.Ankhgerel").
 * 정렬·검색에 쓸 "이름" 부분(점 뒤)을 반환한다. 점이 없으면 전체를 그대로 반환한다.
 */
export function getGivenName(displayName: string): string {
  const dotIndex = displayName.indexOf('.')
  if (dotIndex === -1) {
    return displayName.trim()
  }
  return displayName.slice(dotIndex + 1).trim()
}

/**
 * displayName("<성 이니셜>.<이름>")을 lastName(성)·firstName(이름)으로 분리한다.
 * 점이 없으면 firstName에 전체를 넣고 lastName은 빈 문자열로 둔다.
 */
export function splitDisplayName(displayName: string): {
  firstName: string
  lastName: string
} {
  const dotIndex = displayName.indexOf('.')
  if (dotIndex === -1) {
    return { firstName: displayName.trim(), lastName: '' }
  }
  return {
    firstName: displayName.slice(dotIndex + 1).trim(),
    lastName: displayName.slice(0, dotIndex).trim()
  }
}

/**
 * 이름 컬럼(성 이니셜.이름)을 성이 아니라 "이름" 기준으로 정렬하는 TanStack sortingFn.
 * 컬럼 정의에 `sortingFn: givenNameSort`로 지정해 사용한다.
 */
export function givenNameSort<T>(
  rowA: Row<T>,
  rowB: Row<T>,
  columnId: string
): number {
  const a = getGivenName(String(rowA.getValue(columnId) ?? ''))
  const b = getGivenName(String(rowB.getValue(columnId) ?? ''))
  return a.localeCompare(b)
}
