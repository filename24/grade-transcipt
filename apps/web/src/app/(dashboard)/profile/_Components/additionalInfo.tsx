import { CopyButton } from '@/components/copy-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type AdditionalInfoItem = {
  id: string
  name: string
  data: string
}

export default function AdditionalInfo({
  items
}: {
  items: AdditionalInfoItem[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Нэмэлт мэдээлэл</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="grid gap-1">
              <h2 className="font-medium text-lg">{item.name}</h2>
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm">
                  {item.data}
                </span>
                <CopyButton textToCopy={item.data} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
