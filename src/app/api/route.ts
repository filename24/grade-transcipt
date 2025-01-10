export async function GET() {
  return Response.json(
    {
      data: 'Hello World',
    },
    { status: 200 },
  )
}
