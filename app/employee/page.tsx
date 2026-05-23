'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Building2,
  Wallet,
  Clock,
  TrendingDown,
  Banknote,
  FileText,
  LogOut,
  Moon,
  Sun,
  AlertTriangle,
  CheckCircle2,
  History
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import type { PaymentStatus, Employee, SalaryHistory } from '@/lib/types'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { toast } from 'sonner'
import { ProfileEditDialog } from '@/components/employee/profile-edit-dialog'
import { SalaryReviewDialog } from '@/components/employee/salary-review-dialog'
import { SalaryReviewTracker } from '@/components/employee/salary-review-tracker'

const statusLabels: Record<PaymentStatus, string> = {
  bank_transfer: 'تحويل بنكي',
  cash: 'كاش',
  processing: 'قيد المعالجة'
}

const statusColors: Record<PaymentStatus, string> = {
  bank_transfer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cash: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
}

export default function EmployeeDashboard() {
  const router = useRouter()
  const { currentUser, employees, salaryHistory, logout } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [history, setHistory] = useState<SalaryHistory[]>([])

  useEffect(() => {
    if (!currentUser) {
      router.push('/')
      return
    }

    const emp = employees.find(e => e.employeeId === currentUser.employeeId)
    if (emp) {
      setEmployee(emp)
      setHistory(salaryHistory.filter(h => h.employeeId === emp.employeeId))
    }
  }, [currentUser, employees, salaryHistory, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const exportPDF = () => {
    if (!employee) return

    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text('O2 Payroll System', 105, 20, { align: 'center' })
    doc.setFontSize(14)
    doc.text('Salary Slip', 105, 30, { align: 'center' })

    doc.setFontSize(12)
    const startY = 50
    doc.text(`Employee ID: ${employee.employeeId}`, 20, startY)
    doc.text(`Name: ${employee.fullName}`, 20, startY + 10)
    doc.text(`Department: ${employee.department}`, 20, startY + 20)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, startY + 30)

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
    toast.success('تم تحميل كشف الراتب')
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
      </div>
    )
  }

  const showCashAlert = employee.remaining < 700

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
              O2
            </div>
            <div>
              <h1 className="font-bold">O2 Payroll</h1>
              <p className="text-xs text-muted-foreground">لوحة الموظف</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-5 w-5 ml-2" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-1">مرحباً، {employee.fullName}</h2>
          <p className="text-muted-foreground">إليك ملخص راتبك الشهري</p>
        </motion.div>

        {/* Cash Alert */}
        {showCashAlert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 rounded-2xl border-2 border-amber-500/50 bg-amber-50 dark:bg-amber-900/20 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  سيتم استلام الراتب كاش
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  سيتم استلام الراتب كاش خلال {employee.cashDays} أيام
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Employee Info & Salary Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Employee Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  البيانات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    {employee.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{employee.fullName}</p>
                    <p className="text-sm text-muted-foreground font-mono">{employee.employeeId}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.workHours} ساعة</span>
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  <ProfileEditDialog employee={employee} />
                  <SalaryReviewDialog employee={employee} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Salary Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    ملخص الراتب
                  </CardTitle>
                  <Badge variant="secondary" className={statusColors[employee.paymentStatus]}>
                    {statusLabels[employee.paymentStatus]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-primary/10 p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">الراتب الأساسي</p>
                    <p className="text-xl font-bold text-primary">{employee.baseSalary.toLocaleString()} ₪</p>
                  </div>
                  <div className="rounded-xl bg-destructive/10 p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">السحوبات</p>
                    <p className="text-xl font-bold text-destructive">-{employee.withdrawals.toLocaleString()} ₪</p>
                  </div>
                  <div className="rounded-xl bg-amber-500/10 p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">الخصومات</p>
                    <p className="text-xl font-bold text-amber-600">-{employee.deductions.toLocaleString()} ₪</p>
                  </div>
                  <div className="rounded-xl bg-green-500/10 p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">المتبقي</p>
                    <p className="text-xl font-bold text-green-600">{employee.remaining.toLocaleString()} ₪</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={exportPDF}>
                    <FileText className="h-4 w-4 ml-2" />
                    تحميل كشف الراتب
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Salary Review Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <SalaryReviewTracker employeeId={employee.id} />
        </motion.div>

        {/* Salary History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                سجل الرواتب السابقة
              </CardTitle>
              <CardDescription>آخر 6 أشهر</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا يوجد سجل رواتب سابقة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4 font-semibold">الشهر</th>
                        <th className="text-right py-3 px-4 font-semibold">الراتب</th>
                        <th className="text-right py-3 px-4 font-semibold">السحوبات</th>
                        <th className="text-right py-3 px-4 font-semibold">المتبقي</th>
                        <th className="text-right py-3 px-4 font-semibold">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-4">{h.month} {h.year}</td>
                          <td className="py-3 px-4">{h.baseSalary.toLocaleString()} ₪</td>
                          <td className="py-3 px-4 text-destructive">-{h.withdrawals.toLocaleString()} ₪</td>
                          <td className="py-3 px-4 font-medium">{h.remaining.toLocaleString()} ₪</td>
                          <td className="py-3 px-4">
                            {h.paidAt ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3 ml-1" />
                                تم الدفع
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className={statusColors[h.paymentStatus]}>
                                {statusLabels[h.paymentStatus]}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 O2 Restaurant. جميع الحقوق محفوظة
        </div>
      </footer>
    </div>
  )
}
