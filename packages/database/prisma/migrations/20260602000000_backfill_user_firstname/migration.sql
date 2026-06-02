-- 이름순(성이 아닌 이름) 서버 정렬을 위한 firstName/lastName 백필.
-- 자동 생성된 유저는 name("성 이니셜.이름")만 채워지고 firstName/lastName가
-- 비어 있을 수 있으므로, 비어 있는 경우에만 name에서 파생해 채운다.
-- 기존에 값이 있는 행은 보존한다 (데이터 손실 없음).

-- firstName <- name의 점 뒤 부분 (예: "A.Ankhgerel" -> "Ankhgerel")
UPDATE "user"
SET "firstName" = btrim(split_part("name", '.', 2))
WHERE ("firstName" IS NULL OR btrim("firstName") = '')
  AND position('.' IN "name") > 0;

-- lastName <- name의 점 앞 부분 (예: "A.Ankhgerel" -> "A")
UPDATE "user"
SET "lastName" = btrim(split_part("name", '.', 1))
WHERE ("lastName" IS NULL OR btrim("lastName") = '')
  AND position('.' IN "name") > 0;
