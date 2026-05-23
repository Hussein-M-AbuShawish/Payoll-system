'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Check, X, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { SalaryRequestDialog } from './salary-request-dialog'
import type { SalaryRequest } from '@/lib/types'

interface SalaryRequestsTableProps {
    requests: SalaryRequest[]
    onApprove: (id: string) => void
    onReject: (id: string) => void
    onReply: (id: string, reply: string) => void
}

export function SalaryRequestsTable({
    requests,
    onApprove,
    onReject,
    onReply,
}: SalaryRequestsTableProps) {
    const [selectedRequest, setSelectedRequest] = useState<SalaryRequest | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [rejectId, setRejectId] = useState<string | null>(null)

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

    const handleViewDetails = (request: SalaryRequest) => {
        setSelectedRequest(request)
        setDialogOpen(true)
    }

    const handleReply = (reply: string) => {
        if (selectedRequest) {
            onReply(selectedRequest.id, reply)
            setDialogOpen(false)
            setSelectedRequest(null)
        }
    }

    return (
        <>
            <div className="rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="text-right">الموظف</TableHead>
                            <TableHead className="text-right">السبب</TableHead>
                            <TableHead className="text-right">التاريخ</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">الإجراء</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    لا توجد طلبات مراجعة راتب
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request) => (
                                <TableRow key={request.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{request.fullName}</TableCell>
                                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(request.createdAt), {
                                            addSuffix: true,
                                            locale: ar,
                                        })}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleViewDetails(request)}>
                                                    <MessageSquare className="h-4 w-4 ml-2" />
                                                    عرض التفاصيل
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {request.status === 'pending' && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => onApprove(request.id)}
                                                            className="text-green-600 dark:text-green-400"
                                                        >
                                                            <Check className="h-4 w-4 ml-2" />
                                                            الموافقة
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setRejectId(request.id)}
                                                            className="text-red-600 dark:text-red-400"
                                                        >
                                                            <X className="h-4 w-4 ml-2" />
                                                            الرفض
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {selectedRequest && (
                <SalaryRequestDialog
                    request={selectedRequest}
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onReply={handleReply}
                    onApprove={() => {
                        onApprove(selectedRequest.id)
                        setDialogOpen(false)
                        setSelectedRequest(null)
                    }}
                    onReject={() => {
                        setRejectId(selectedRequest.id)
                        setDialogOpen(false)
                    }}
                />
            )}

            <AlertDialog open={rejectId !== null} onOpenChange={(open) => !open && setRejectId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الرفض</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من رفض هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            if (rejectId) {
                                onReject(rejectId)
                                setRejectId(null)
                            }
                        }}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        تأكيد الرفض
                    </AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
