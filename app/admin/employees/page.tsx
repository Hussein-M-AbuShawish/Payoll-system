'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { EmployeesTable } from '@/components/admin/employees-table'
import { EmployeeDialog } from '@/components/admin/employee-dialog'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Search, FileDown, FileSpreadsheet } from 'lucide-react'
import type { Employee } from '@/lib/types'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function EmployeesPage() {
  const { employees, departments, deleteEmployee } = useAppStore()
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.fullName.includes(search) || 
      emp.employeeId.toLowerCase().includes(search.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || emp.departmentId === departmentFilter
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDialogMode('view')
    setDialogOpen(true)
  }

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const handleDelete = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete.id)
      toast.success('تم حذف الموظف بنجاح')
      setDeleteDialogOpen(false)
      setEmployeeToDelete(null)
    }
  }

  const handleAdd = () => {
    setSelectedEmployee(null)
    setDialogMode('add')
    setDialogOpen(true)
  }

  const exportToPDF = (employee: Employee) => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.text('O2 Payroll System', 105, 20, { align: 'center' })
    doc.setFontSize(14)
    doc.text('Salary Slip', 105, 30, { align: 'center' })
    
    // Employee Info
    doc.setFontSize(12)
    const startY = 50
    doc.text(`Employee ID: ${employee.employeeId}`, 20, startY)
    doc.text(`Name: ${employee.fullName}`, 20, startY + 10)
    doc.text(`Department: ${employee.department}`, 20, startY + 20)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, startY + 30)
    
    // Salary Details
    const tableData = [
      ['Base Salary', `${employee.baseSalary.toLocaleString()} ILS`],
      ['Work Hours', `${employee.workHours} hours`],
      ['Withdrawals', `-${employee.withdrawals.toLocaleString()} ILS`],
      ['Deductions', `-${employee.deductions.toLocaleString()} ILS`],
      ['Net Salary', `${employee.remaining.toLocaleString()} ILS`],
    ]
    
    // @ts-expect-error - jspdf-autotable types
    doc.autoTable({
      startY: startY + 45,
      head: [['Description', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    })
    
    doc.save(`salary-slip-${employee.employeeId}.pdf`)
    toast.success('تم تصدير كشف الراتب')
  }

  const exportAllToExcel = () => {
    // Create CSV content
    const headers = ['الرقم الوظيفي', 'الاسم', 'القسم', 'الراتب', 'السحوبات', 'الخصومات', 'المتبقي', 'الحالة']
    const statusLabels = {
      bank_transfer: 'تحويل بنكي',
      cash: 'كاش',
      processing: 'قيد المعالجة'
    }
    
    const rows = filteredEmployees.map(emp => [
      emp.employeeId,
      emp.fullName,
      emp.department,
      emp.baseSalary,
      emp.withdrawals,
      emp.deductions,
      emp.remaining,
      statusLabels[emp.paymentStatus]
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'employees.csv'
    link.click()
    
    toast.success('تم تصدير البيانات')
  }

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="إدارة الموظفين" 
        description={`${filteredEmployees.length} موظف`}
      />
      
      <div className="p-6 space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو الرقم الوظيفي..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
          
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="جميع الأقسام" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأقسام</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="suspended">موقوف</SelectItem>
              <SelectItem value="terminated">منتهي</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportAllToExcel}>
              <FileSpreadsheet className="h-4 w-4 ml-2" />
              تصدير Excel
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة موظف
            </Button>
          </div>
        </motion.div>

        {/* Table */}
        <EmployeesTable
          employees={filteredEmployees}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onExportPDF={exportToPDF}
        />
      </div>

      {/* Employee Dialog */}
      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={selectedEmployee}
        mode={dialogMode}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الموظف {employeeToDelete?.fullName} نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
