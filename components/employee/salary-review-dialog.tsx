'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import type { Employee } from '@/lib/types'

interface SalaryReviewDialogProps {
    employee: Employee
}

export function SalaryReviewDialog({ employee }: SalaryReviewDialogProps) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState('')
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { addSalaryRequest } = useAppStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!reason.trim()) {
            toast.error('يرجى إدخال سبب الطلب')
            return
        }

        setIsLoading(true)
        try {
            addSalaryRequest({
                employeeId: employee.id,
                fullName: employee.fullName,
                reason: reason.trim(),
                message: message.trim() || undefined,
                status: 'pending',
            })

            toast.success('تم تقديم طلب مراجعة الراتب بنجاح')
            setReason('')
            setMessage('')
            setOpen(false)
        } catch (error) {
            toast.error('حدث خطأ في تقديم الطلب')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Send className="h-4 w-4 ml-2" />
                    طلب مراجعة راتب
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>طلب مراجعة الراتب</DialogTitle>
                    <DialogDescription>
                        قدم طلب مراجعة راتب مع شرح السبب والتفاصيل
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">سبب الطلب *</Label>
                        <Input
                            id="reason"
                            placeholder="مثال: زيادة الراتب، تصحيح خطأ، إعادة تقييم..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">تفاصيل إضافية</Label>
                        <Textarea
                            id="message"
                            placeholder="أضف أي معلومات إضافية تساعد الإدارة على فهم طلبك..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isLoading}
                            rows={4}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'جاري التقديم...' : 'تقديم الطلب'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
