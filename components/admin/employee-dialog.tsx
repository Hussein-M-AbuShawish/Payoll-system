'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { User, Briefcase, Wallet, ShieldCheck, AlertCircle, Pencil, Eye } from 'lucide-react'
import type { Employee, PaymentStatus, UserRole, EmployeeStatus } from '@/lib/types'
import { useAppStore } from '@/lib/store'

interface EmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee | null
  mode: 'add' | 'edit' | 'view'
}

export function EmployeeDialog({ open, onOpenChange, employee, mode }: EmployeeDialogProps) {
  const { departments, addEmployee, updateEmployee, cashDaysDefault, currentUser } = useAppStore()
  
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    nationalId: '',
    mobileNumber: '',
    departmentId: '',
    branch: '',
    workType: 'hourly' as 'hourly' | 'daily',
    rate: 0,
    baseSalary: 0,
    workHours: 0,
    withdrawals: 0,
    deductions: 0,
    paymentStatus: 'processing' as PaymentStatus,
    cashDays: cashDaysDefault,
    walletPhone: '',
    walletOwnerName: '',
    walletOwnerId: '',
    password: '',
    role: 'employee' as UserRole,
    status: 'active' as EmployeeStatus,
  })

  useEffect(() => {
    if (employee && (mode === 'edit' || mode === 'view')) {
      setFormData({
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        nationalId: employee.nationalId || '',
        mobileNumber: employee.mobileNumber || '',
        departmentId: employee.departmentId,
        branch: employee.branch || '',
        workType: employee.workType || 'hourly',
        rate: employee.rate || 0,
        baseSalary: employee.baseSalary,
        workHours: employee.workHours,
        withdrawals: employee.withdrawals,
        deductions: employee.deductions,
        paymentStatus: employee.paymentStatus,
        cashDays: employee.cashDays,
        walletPhone: employee.walletPhone || '',
        walletOwnerName: employee.walletOwnerName || '',
        walletOwnerId: employee.walletOwnerId || '',
        password: employee.password,
        role: employee.role,
        status: employee.status || 'active',
      })
    } else {
      setFormData({
        employeeId: `E${Date.now().toString().slice(-5)}`,
        fullName: '',
        nationalId: '',
        mobileNumber: '',
        departmentId: departments[0]?.id || '',
        branch: '',
        workType: 'hourly',
        rate: 0,
        baseSalary: 0,
        workHours: 0,
        withdrawals: 0,
        deductions: 0,
        paymentStatus: 'processing',
        cashDays: cashDaysDefault,
        walletPhone: '',
        walletOwnerName: '',
        walletOwnerId: '',
        password: '',
        role: 'employee',
        status: 'active',
      })
    }
  }, [employee, mode, departments, cashDaysDefault])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const dept = departments.find(d => d.id === formData.departmentId)
    
    if (mode === 'add') {
      addEmployee({
        ...formData,
        department: dept?.name || '',
      })
    } else if (mode === 'edit' && employee) {
      updateEmployee(employee.id, {
        ...formData,
        department: dept?.name || '',
      })
    }
    
    onOpenChange(false)
  }

  const isReadOnly = mode === 'view'
  const isSuperAdmin = currentUser?.role === 'super_admin'
  const isJobInfoLocked = mode === 'edit' && !isSuperAdmin

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {mode === 'add' && <><User className="h-6 w-6 text-primary" /> إضافة موظف جديد</>}
            {mode === 'edit' && <><Pencil className="h-6 w-6 text-amber-500" /> تعديل بيانات الموظف</>}
            {mode === 'view' && <><Eye className="h-6 w-6 text-blue-500" /> عرض بيانات الموظف</>}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 border-b">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-6">
                <TabsTrigger value="basic" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3">
                  <User className="h-4 w-4 ml-2" />
                  المعلومات الأساسية
                </TabsTrigger>
                <TabsTrigger value="job" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3">
                  <Briefcase className="h-4 w-4 ml-2" />
                  المعلومات الوظيفية
                </TabsTrigger>
                <TabsTrigger value="wallet" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3">
                  <Wallet className="h-4 w-4 ml-2" />
                  معلومات المحفظة
                </TabsTrigger>
                <TabsTrigger value="status" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3">
                  <ShieldCheck className="h-4 w-4 ml-2" />
                  الحالة والصلاحية
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="basic" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم الكامل</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      disabled={isReadOnly}
                      placeholder="أدخل الاسم الرباعي"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationalId">رقم الهوية</Label>
                    <Input
                      id="nationalId"
                      value={formData.nationalId}
                      onChange={e => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                      disabled={isReadOnly}
                      placeholder="9 أرقم"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">رقم الجوال</Label>
                    <Input
                      id="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={e => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                      disabled={isReadOnly}
                      placeholder="05x-xxxxxxx"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isReadOnly}
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="job" className="mt-0 space-y-4">
                {isJobInfoLocked && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      بيانات الوظيفة مقفلة. يمكن للمدير العام (Super Admin) فقط تعديل هذه البيانات.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">الرقم الوظيفي</Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={e => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                      disabled={isReadOnly || isJobInfoLocked}
                      placeholder="E20001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">الفرع</Label>
                    <Input
                      id="branch"
                      value={formData.branch}
                      onChange={e => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                      disabled={isReadOnly || isJobInfoLocked}
                      placeholder="اسم الفرع"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">القسم</Label>
                    <Select
                      value={formData.departmentId}
                      onValueChange={value => setFormData(prev => ({ ...prev, departmentId: value }))}
                      disabled={isReadOnly || isJobInfoLocked}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workType">نوع العمل</Label>
                    <Select
                      value={formData.workType}
                      onValueChange={value => setFormData(prev => ({ ...prev, workType: value as 'hourly' | 'daily' }))}
                      disabled={isReadOnly || isJobInfoLocked}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع العمل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">بالساعة</SelectItem>
                        <SelectItem value="daily">يومي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">سعر ال{formData.workType === 'hourly' ? 'ساعة' : 'يوم'} (₪)</Label>
                    <Input
                      id="rate"
                      type="number"
                      value={formData.rate}
                      onChange={e => setFormData(prev => ({ ...prev, rate: Number(e.target.value) }))}
                      disabled={isReadOnly || isJobInfoLocked}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workHours">{formData.workType === 'hourly' ? 'عدد ساعات العمل' : 'عدد أيام العمل'}</Label>
                    <Input
                      id="workHours"
                      type="number"
                      value={formData.workHours}
                      onChange={e => setFormData(prev => ({ ...prev, workHours: Number(e.target.value) }))}
                      disabled={isReadOnly}
                      required
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="wallet" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="walletPhone">رقم المحفظة (Wallet)</Label>
                    <Input
                      id="walletPhone"
                      value={formData.walletPhone}
                      onChange={e => setFormData(prev => ({ ...prev, walletPhone: e.target.value }))}
                      disabled={isReadOnly}
                      placeholder="05x-xxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="walletOwnerName">اسم صاحب المحفظة</Label>
                    <Input
                      id="walletOwnerName"
                      value={formData.walletOwnerName}
                      onChange={e => setFormData(prev => ({ ...prev, walletOwnerName: e.target.value }))}
                      disabled={isReadOnly}
                      placeholder="الاسم الكامل"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="walletOwnerId">رقم هوية صاحب المحفظة</Label>
                    <Input
                      id="walletOwnerId"
                      value={formData.walletOwnerId}
                      onChange={e => setFormData(prev => ({ ...prev, walletOwnerId: e.target.value }))}
                      disabled={isReadOnly}
                      placeholder="9 أرقام"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="status" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">حالة الموظف</Label>
                    <Select
                      value={formData.status}
                      onValueChange={value => setFormData(prev => ({ ...prev, status: value as EmployeeStatus }))}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="suspended">موقوف</SelectItem>
                        <SelectItem value="terminated">منتهي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">الصلاحية</Label>
                    <Select
                      value={formData.role}
                      onValueChange={value => setFormData(prev => ({ ...prev, role: value as UserRole }))}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الصلاحية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">موظف</SelectItem>
                        <SelectItem value="hr">موارد بشرية</SelectItem>
                        <SelectItem value="admin">مدير</SelectItem>
                        <SelectItem value="super_admin">مدير عام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">طريقة الدفع</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={value => setFormData(prev => ({ ...prev, paymentStatus: value as PaymentStatus }))}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الطريقة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                        <SelectItem value="cash">كاش</SelectItem>
                        <SelectItem value="processing">قيد المعالجة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cashDays">أيام استلام الكاش</Label>
                    <Input
                      id="cashDays"
                      type="number"
                      value={formData.cashDays}
                      onChange={e => setFormData(prev => ({ ...prev, cashDays: Number(e.target.value) }))}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="p-6 border-t bg-muted/50 flex gap-3 justify-between items-center">
            {mode === 'view' ? (
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground font-mono">آخر تحديث: {employee?.updatedAt.toLocaleDateString()}</span>
              </div>
            ) : (
              <div className="flex-1">
                <p className="text-xs text-muted-foreground italic">
                  * يرجى التأكد من دقة البيانات المدخلة قبل الحفظ
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إغاء
              </Button>
              {mode !== 'view' && (
                <Button type="submit">
                  {mode === 'add' ? 'إضافة موظف' : 'حفظ التغييرات'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
