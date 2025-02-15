import { fetchGradeData } from '@/utils/fetch'

const STUDENT_GROUP_ID = '100004237680887'

export async function GET(req: Request) {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json(
      {
        data: null,
        message: 'Unauthorized'
      },
      { status: 401 }
    )
  }

  const studentGrades = await fetchGradeData(STUDENT_GROUP_ID, 'edit')

  return Response.json(
    {
      data: {
        size: studentGrades
      },
      message: 'Success'
    },
    { status: 200 }
  )
}
