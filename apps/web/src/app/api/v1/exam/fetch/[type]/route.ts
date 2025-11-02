import { STUDENT_GROUP_ID } from '@/utils/constants'
import { type FetchType, fetchTestData } from '@/utils/fetch'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  if (!params) {
    return Response.json(
      {
        data: null,
        message: 'Params are required'
      },
      { status: 400 }
    )
  }
  const type = (await params).type as FetchType

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const studentExamData = await fetchTestData(STUDENT_GROUP_ID, type)

  return Response.json(
    {
      data: {
        size:
          typeof studentExamData === 'number'
            ? studentExamData
            : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              studentExamData.length
      },
      message: 'Success'
    },
    { status: 200 }
  )
}
