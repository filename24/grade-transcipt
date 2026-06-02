'use client'

import { useEffect, useState } from 'react'

/**
 * localStorage에 동기화되는 상태 훅.
 * - SSR/하이드레이션 불일치를 피하기 위해 초기 렌더는 `initialValue`로 하고,
 *   마운트 후 useEffect에서 저장값을 읽어와 반영한다.
 * - 반환되는 setter는 React setState와 동일하게 값/업데이터 함수를 모두 받는다
 *   (TanStack Table의 onChange 핸들러로 그대로 넘길 수 있음).
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) {
        setValue(JSON.parse(raw) as T)
      }
    } catch {
      // 손상된 값/접근 불가는 무시하고 기본값 유지
    }
    setHydrated(true)
  }, [key])

  useEffect(() => {
    if (!hydrated) {
      return
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 용량 초과/접근 불가는 무시
    }
  }, [key, value, hydrated])

  return [value, setValue]
}
