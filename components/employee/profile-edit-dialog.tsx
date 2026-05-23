'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import type { Employee } from '@/lib/types'
import { User, Save, Wallet, Phone, Fingerprint } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileEditDialogProps {
  employee: Employee
}

export function ProfileEditDialog({ employee }: ProfileEditDialogProps) {
  const [open, setOpen] = useState(false)
  const { employeeUpdateProfile } = useAppStore()
  
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    mobileNumber: '',
    walletPhone: '',
    walletOwnerName: '',
    walletOwnerId: '',
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        fullName: employee.fullName,
        nationalId: employee.nationalId || '',
        mobileNumber: employee.mobileNumber || '',
        walletPhone: employee.walletPhone || '',
        walletOwnerName: employee.walletOwnerName || '',
        walletOwnerId: employee.walletOwnerId || '',
      })
    }
  }, [employee, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    employeeUpdateProfile(employee.id, formData, employee.fullName)
    
    toast.success('تم تحديث البيانات بنجاح وسيتم إشعار المسؤول')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <User className="h-4 w-4 ml-2" />
          تعديل الملف الشخصي
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            تعديل الملف الشخصي
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2">
              <Fingerprint className="h-4 w-4" />
              المعلومات الأساسية
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="الاسم الكامل"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId">رقم الهوية</Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={e => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                  placeholder="9 أرقام"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="mobileNumber">رقم الجوال</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobileNumber"
                    className="pr-10"
                    value={formData.mobileNumber}
                    onChange={e => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    placeholder="05x-xxxxxxx"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2 pt-2">
              <Wallet className="h-4 w-4" />
              معلومات المحفظة (Wallet)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="walletPhone">رقم المحفظة</Label>
                <Input
                  id="walletPhone"
                  value={formData.walletPhone}
                  onChange={e => setFormData(prev => ({ ...prev, walletPhone: e.target.value }))}
                  placeholder="05x-xxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="walletOwnerName">اسم صاحب المحفظة</Label>
                <Input
                  id="walletOwnerName"
                  value={formData.walletOwnerName}
                  onChange={e => setFormData(prev => ({ ...prev, walletOwnerName: e.target.value }))}
                  placeholder="الاسم الكامل"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="walletOwnerId">رقم هوية صاحب المحفظة</Label>
                <Input
                  id="walletOwnerId"
                  value={formData.walletOwnerId}
                  onChange={e => setFormData(prev => ({ ...prev, walletOwnerId: e.target.value }))}
                  placeholder="9 أرقام"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
