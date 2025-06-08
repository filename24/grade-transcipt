/**
 * NEW - 등록함
 * REJECTED - 취소함
 * PENDING - 심사받는중
 * APPROVED - 심사받음
 */
export type GradeStatusType = 'APPROVED' | 'PENDING' | 'REJECTED' | 'NEW'

export enum GradeStatus {
  APPROVED = 'Батлагдсан',
  PENDING = 'Хянагдаж байгаа',
  REJECTED = 'Цуцлагдсан',
  NEW = 'Бүртгэсэн'
}

export const GradeStatusKeys = Object.keys(GradeStatus) as GradeStatusType[]

export enum CourseCode {
  МХЛ = 'Монгол хэл',
  УЗО = 'Уран зохиол',
  МБЧ = 'Үндэсний бичиг',
  МАТ = 'Математик',
  БИО = 'Биологи',
  ФИЗ = 'Физик',
  ХИМ = 'Хими',
  ГЗЗ = 'Газар зүй',
  ЭМД = 'Эрүүн мэнд',
  БНТ = 'Биеийн тамир',
  АНГ = 'Англи хэл',
  МТХ = 'Монголын түүх',
  НСУ = 'Нийгэм судлал',
  МТИ = 'Мэдээлэл технологи',
  ИБЛ = 'Иргэний ёс зүй',
  ДЗЗ = 'Дизайн, зураг зүй, технологи',
  ТҮҮ = 'Түүх',

  ТХН = 'Технологи',
  ХӨГ = 'Хөгжим',
  ОРХ = 'Орос хэл',
  ЗРЗ = 'Зураг зүй',
  ДУГ = 'Дүрслэх урлаг',

  ХБН = 'Хүн ба нийгэм',
  ХББ = 'Хүн ба байгаль',
  ДУТ = 'Дүрслэх урлаг Технологи',
  ХГҮ = 'Хичээлээс гадуурх үйл ажиллагаа',
  АЧС = 'Амьдрах чадварт суралцах үйл ажиллагаа',
  ХБО = 'Хүн болон орчин',
  БЭХ = 'Бэлтгэл хичээл'
}

export type CourseCodeKeys = keyof typeof CourseCode
export const CourseCodeKeys = Object.keys(CourseCode) as CourseCodeKeys[]
