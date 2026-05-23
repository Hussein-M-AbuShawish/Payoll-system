'use client'

import { useState, useMemo } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SalaryRequestsTable } from "@/components/admin/salary-requests-table"
import { motion } from 'framer-motion'
import { Search, Filter, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function SalaryRequestsPage() {
  const store = useAppStore()
  const { salaryRequests, updateSalaryRequest } = store
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const filteredRequests = useMemo(() => {
    return salaryRequests.filter((req) => {
      const matchesSearch = req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [salaryRequests, searchTerm, statusFilter])

  const stats = {
    total: salaryRequests.length,
    pending: salaryRequests.filter((r) => r.status === 'pending').length,
    approved: salaryRequests.filter((r) => r.status === 'approved').length,
    rejected: salaryRequests.filter((r) => r.status === 'rejected').length,
  }

  const handleApprove = (id: string) => {
    updateSalaryRequest(id, {
      status: 'approved',
      approvedAt: new Date(),
    })
    toast.success('تم الموافقة على الطلب')
  }

  const handleReject = (id: string) => {
    updateSalaryRequest(id, {
      status: 'rejected',
    })
    toast.success('تم رفض الطلب')
  }

  const handleReply = (id: string, reply: string) => {
    updateSalaryRequest(id, {
      reply,
    })
    toast.success('تم إرسال الرد بنجاح')
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="طلبات مراجعة الرواتب"
        description="إدارة طلبات مراجعة رواتب الموظفين والموافقة عليها أو رفضها"
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Filter className="h-6 w-6 text-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد الانتظار</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">موافق عليه</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.approved}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مرفوض</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg border bg-card p-4 space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن الموظف أو السبب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="approved">موافق عليه</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Requests Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SalaryRequestsTable
            requests={filteredRequests}
            onApprove={handleApprove}
            onReject={handleReject}
            onReply={handleReply}
          />
        </motion.div>
      </div>
    </div>
  )
}
