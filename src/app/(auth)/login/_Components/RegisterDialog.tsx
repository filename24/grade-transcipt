import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

export default function RegisterUnknow() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Бүртгүүлэх</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Одоогоор бүртгүүлэх боломжгүй 😞</DialogTitle>
          <DialogDescription className="font-medium">
            Knea - Grade transcript project маань одоогоор тодорхой ангид
            явагдаж байгаа учраас бүртгүүлэх боломжгүй. Удахгүй хүрээгээ тэлэх
            болно :)
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="w-full">
              Хаах
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
