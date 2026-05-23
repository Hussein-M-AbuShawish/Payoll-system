'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Pencil, Trash2, FileText, ChevronRight, ChevronLeft } from 'lucide-react'
import type { Employee, PaymentStatus, EmployeeStatus } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface EmployeesTableProps {
  employees: Employee[]
  onView?: (employee: Employee) => void
  onEdit?: (employee: Employee) => void
  onDelete?: (employee: Employee) => void
  onExportPDF?: (employee: Employee) => void
}

const statusLabels: Record<EmployeeStatus, string> = {
  active: 'نشط',
  suspended: 'موقوف',
  terminated: 'منتهي',
}

const statusColors: Record<EmployeeStatus, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  suspended: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  terminated: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const paymentStatusLabels: Record<PaymentStatus, string> = {
  bank_transfer: 'تحويل بنكي',
  cash: 'كاش',
  processing: 'قيد المعالجة'
}

export function EmployeesTable({ 
  employees, 
  onView, 
  onEdit, 
  onDelete,
  onExportPDF 
}: EmployeesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(employees.length / itemsPerPage)
  
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEmployees = employees.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right font-semibold">الموظف</TableHead>
              <TableHead className="text-right font-semibold">القسم / الفرع</TableHead>
              <TableHead className="text-right font-semibold">نوع العمل</TableHead>
              <TableHead className="text-right font-semibold">الراتب الأساسي</TableHead>
              <TableHead className="text-right font-semibold">المتبقي</TableHead>
              <TableHead className="text-right font-semibold">الحالة</TableHead>
              <TableHead className="text-right font-semibold">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {paginatedEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    لا يوجد موظفين
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEmployees.map((employee, index) => (
                  <motion.tr
                    key={employee.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{employee.fullName}</span>
                        <span className="text-xs text-muted-foreground font-mono">{employee.employeeId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{employee.department}</span>
                        <span className="text-xs text-muted-foreground">{employee.branch}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {employee.workType === 'hourly' ? 'بالساعة' : 'يومي'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{employee.baseSalary.toLocaleString()} ₪</span>
                        <span className="text-xs text-muted-foreground">{employee.rate} ₪ / {employee.workType === 'hourly' ? 'ساعة' : 'يوم'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${employee.remaining < 700 ? 'text-amber-600' : 'text-green-600'}`}>
                        {employee.remaining.toLocaleString()} ₪
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[employee.status]}>
                        {statusLabels[employee.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onView?.(employee)}>
                            <Eye className="h-4 w-4 ml-2 text-blue-500" />
                            عرض الملف
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit?.(employee)}>
                            <Pencil className="h-4 w-4 ml-2 text-amber-500" />
                            تعديل البيانات
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onExportPDF?.(employee)}>
                            <FileText className="h-4 w-4 ml-2 text-green-500" />
                            كشف الراتب
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete?.(employee)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف الموظف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            عرض {startIndex + 1} إلى {Math.min(startIndex + itemsPerPage, employees.length)} من {employees.length} موظف
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronRight className="h-4 w-4 ml-1" />
              السابق
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              التالي
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
