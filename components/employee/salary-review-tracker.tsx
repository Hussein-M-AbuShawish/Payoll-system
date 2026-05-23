'use client'

import { useAppStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Clock, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { SalaryRequest } from '@/lib/types'

interface SalaryReviewTrackerProps {
    employeeId: string
}

export function SalaryReviewTracker({ employeeId }: SalaryReviewTrackerProps) {
    const { salaryRequests } = useAppStore()
    const employeeRequests = salaryRequests.filter((req) => req.employeeId === employeeId)

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'rejected':
                return <AlertCircle className="h-5 w-5 text-red-500" />
            default:
                return <Clock className="h-5 w-5 text-yellow-500" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800">موافق عليه</Badge>
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800">مرفوض</Badge>
            default:
                return <Badge className="bg-yellow-100 text-yellow-800">قيد الانتظار</Badge>
        }
    }

    if (employeeRequests.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>طلبات مراجعة الراتب</CardTitle>
                    <CardDescription>لم تقدم أي طلبات مراجعة راتب حتى الآن</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>طلبات مراجعة الراتب</CardTitle>
                <CardDescription>
                    لديك {employeeRequests.length} طلب{employeeRequests.length > 1 ? 'ات' : ''}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {employeeRequests.map((request) => (
                    <div
                        key={request.id}
                        className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                        <div className="mt-1">{getStatusIcon(request.status)}</div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-medium">{request.reason}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(request.createdAt), {
                                            addSuffix: true,
                                            locale: ar,
                                        })}
                                    </p>
                                </div>
                                {getStatusBadge(request.status)}
                            </div>

                            {request.message && (
                                <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                    {request.message}
                                </div>
                            )}

                            {request.reply && (
                                <div className="flex gap-2 text-sm bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
                                    <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-blue-900 dark:text-blue-100">رد الإدارة:</p>
                                        <p className="text-blue-800 dark:text-blue-200">{request.reply}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
