import { STUDENT_GROUP_ID } from '@/utils/constants'
import { fetchGradeData, type FetchGradeType } from '@/utils/fetch'


export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: FetchGradeType }> }
) {
  if (!params) {
    return Response.json(
      {
        data: null,
        message: 'Params is required'
      },
      { status: 400 }
    )
  }
  const type = (await params).type

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const studentGrades = await fetchGradeData(STUDENT_GROUP_ID, type)

  return Response.json(
    {
      data: {
        size:
          typeof studentGrades === 'number'
            ? studentGrades
            : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              studentGrades.length
      },
      message: 'Success'
    },
    { status: 200 }
  )
}
