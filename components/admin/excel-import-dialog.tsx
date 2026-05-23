'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, AlertCircle, Check, X } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { toast } from 'sonner'
import { parseExcelFile } from '@/lib/excel-utils'
import type { PayrollSheetRow } from '@/lib/types'

interface ExcelImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (month: number, year: number, rows: PayrollSheetRow[]) => void
}

export function ExcelImportDialog({ open, onOpenChange, onImport }: ExcelImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [month, setMonth] = useState<string>('')
  const [year, setYear] = useState<string>(new Date().getFullYear().toString())
  const [parsedData, setParsedData] = useState<PayrollSheetRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    setIsLoading(true)

    try {
      const result = await parseExcelFile(selectedFile)

      if (!result.success) {
        setErrors(result.errors)
        toast.error('فشل تحليل الملف')
        return
      }

      setParsedData(result.rows)
      setErrors(result.errors)
      setStep('preview')

      if (result.errors.length === 0) {
        toast.success(`تم تحليل ${result.rows.length} موظف بنجاح`)
      } else {
        toast.warning(`تم تحليل ${result.rows.length} موظف مع ${result.errors.length} تحذيرات`)
      }
    } catch (error) {
      setErrors(['حدث خطأ غير متوقع'])
      toast.error('خطأ في معالجة الملف')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = () => {
    if (!month || !year) {
      toast.error('اختر الشهر والسنة')
      return
    }

    onImport(Number(month), Number(year), parsedData)
    handleReset()
  }

  const handleReset = () => {
    setStep('upload')
    setFile(null)
    setMonth('')
    setYear(new Date().getFullYear().toString())
    setParsedData([])
    setErrors([])
    onOpenChange(false)
  }

  const currentYear = new Date().getFullYear()
  const months = [
    { value: '1', label: 'يناير' },
    { value: '2', label: 'فبراير' },
    { value: '3', label: 'مارس' },
    { value: '4', label: 'أبريل' },
    { value: '5', label: 'مايو' },
    { value: '6', label: 'يونيو' },
    { value: '7', label: 'يوليو' },
    { value: '8', label: 'أغسطس' },
    { value: '9', label: 'سبتمبر' },
    { value: '10', label: 'أكتوبر' },
    { value: '11', label: 'نوفمبر' },
    { value: '12', label: 'ديسمبر' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>رفع جدول الرواتب</DialogTitle>
          <DialogDescription>استيراد بيانات الرواتب الشهرية من ملف Excel</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Month and Year Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الشهر</label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الشهر" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">السنة</label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">ملف Excel</label>
                <div className="relative border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />

                  <motion.div whileHover={{ scale: 1.1 }} className="mb-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.div>

                  <p className="font-medium">اسحب الملف هنا أو انقر للاختيار</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    نوع الملف المدعوم: Excel (.xlsx, .xls, .csv)
                  </p>

                  {file && (
                    <p className="text-sm text-green-600 mt-4 font-medium">✓ {file.name}</p>
                  )}
                </div>
              </div>

              {file && (
                <Button
                  onClick={() => handleFileSelect(file)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'جاري التحليل...' : 'تحليل الملف'}
                </Button>
              )}
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Summary */}
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm">
                  <span className="font-medium">تم العثور على:</span> {parsedData.length} موظف
                  <span className="text-muted-foreground mr-4">
                    الشهر: <span className="font-medium">{months.find((m) => m.value === month)?.label}</span>
                  </span>
                </p>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">توجد تحذيرات:</p>
                      <ul className="list-disc list-inside text-sm">
                        {errors.slice(0, 3).map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                        {errors.length > 3 && <li>و {errors.length - 3} تحذيرات أخرى</li>}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Table Preview */}
              <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-right px-4 py-2 font-medium">رقم الموظف</th>
                      <th className="text-right px-4 py-2 font-medium">الاسم</th>
                      <th className="text-right px-4 py-2 font-medium">الراتب</th>
                      <th className="text-right px-4 py-2 font-medium">السحوبات</th>
                      <th className="text-right px-4 py-2 font-medium">صافي الراتب</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-muted/50">
                        <td className="text-right px-4 py-2 font-mono">{row.employeeId}</td>
                        <td className="text-right px-4 py-2">{row.fullName}</td>
                        <td className="text-right px-4 py-2">{row.totalSalary.toLocaleString()} ₪</td>
                        <td className="text-right px-4 py-2 text-destructive">
                          {row.withdrawals.toLocaleString()} ₪
                        </td>
                        <td className="text-right px-4 py-2 font-medium">
                          {row.netSalary.toLocaleString()} ₪
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {parsedData.length > 10 && (
                  <div className="bg-muted px-4 py-2 text-sm text-center text-muted-foreground">
                    وأكثر من {parsedData.length - 10} موظف
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('upload')}
                  className="flex-1"
                >
                  رجوع
                </Button>
                <Button
                  onClick={handleImport}
                  className="flex-1"
                >
                  استيراد البيانات
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
