'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Check, X, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { SalaryRequest } from '@/lib/types'

interface SalaryRequestDialogProps {
    request: SalaryRequest
    open: boolean
    onOpenChange: (open: boolean) => void
    onReply: (reply: string) => void
    onApprove: () => void
    onReject: () => void
}

export function SalaryRequestDialog({
    request,
    open,
    onOpenChange,
    onReply,
    onApprove,
    onReject,
}: SalaryRequestDialogProps) {
    const [replyText, setReplyText] = useState('')
    const [isReplying, setIsReplying] = useState(false)

    const handleSubmitReply = () => {
        if (replyText.trim()) {
            onReply(replyText)
            setReplyText('')
            setIsReplying(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <Check className="h-3 w-3 ml-1" />
                        موافق عليه
                    </Badge>
                )
            case 'rejected':
                return (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <X className="h-3 w-3 ml-1" />
                        مرفوض
                    </Badge>
                )
            default:
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        قيد الانتظار
                    </Badge>
                )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>طلب مراجعة الراتب</span>
                        {getStatusBadge(request.status)}
                    </DialogTitle>
                    <DialogDescription>
                        من: {request.fullName} • {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, locale: ar })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Request Details */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-semibold text-muted-foreground">السبب</Label>
                            <p className="mt-1 text-base">{request.reason}</p>
                        </div>

                        {request.message && (
                            <div>
                                <Label className="text-sm font-semibold text-muted-foreground">التفاصيل</Label>
                                <div className="mt-1 p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">
                                    {request.message}
                                </div>
                            </div>
                        )}

                        {request.reply && (
                            <div>
                                <Label className="text-sm font-semibold text-muted-foreground">رد الإدارة</Label>
                                <div className="mt-1 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-sm whitespace-pre-wrap">
                                    {request.reply}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reply Section */}
                    {request.status === 'pending' && !isReplying && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setIsReplying(true)}
                        >
                            <MessageSquare className="h-4 w-4 ml-2" />
                            إضافة رد
                        </Button>
                    )}

                    {isReplying && (
                        <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                            <Label htmlFor="reply">الرد</Label>
                            <Textarea
                                id="reply"
                                placeholder="أضف ردك على الطلب..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={3}
                            />
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsReplying(false)
                                        setReplyText('')
                                    }}
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSubmitReply}
                                    disabled={!replyText.trim()}
                                >
                                    إرسال الرد
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {request.status === 'pending' && (
                        <div className="flex gap-2 justify-end pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={onReject}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                                <X className="h-4 w-4 ml-2" />
                                رفض
                            </Button>
                            <Button
                                onClick={onApprove}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Check className="h-4 w-4 ml-2" />
                                الموافقة
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
