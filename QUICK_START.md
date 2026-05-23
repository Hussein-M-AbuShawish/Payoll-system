# O2 Payroll System - Quick Start Guide

## ✅ What's Been Implemented

### Phase 1: Database & Types (Complete)

- Extended type system for payroll sheets, salary requests, audit logs
- New Employee fields: nationalId, mobileNumber, branch, workType, walletInfo, status
- Store actions for payroll management

### Phase 2: Monthly Payroll System (85% Complete)

#### Excel Import Dialog (`/components/admin/excel-import-dialog.tsx`)

- ✅ File upload with drag-and-drop support
- ✅ Month/Year selection
- ✅ Data preview with first 10 rows
- ✅ Auto-column detection for Excel headers
- ✅ Arabic error reporting
- ✅ Client-side validation

#### Excel Utilities (`/lib/excel-utils.ts`)

- ✅ Parse Excel files with auto-column mapping
- ✅ Automatic calculations:
  - Net Salary = Total Salary - Withdrawals
  - Remaining = Net Salary - (Cash Received + Transfer Received)
- ✅ Export payroll to Excel with Arabic headers
- ✅ Full validation with error messages

#### Payroll Store Helper (`/lib/payroll-store.ts`)

- ✅ Actions for payroll sheet CRUD
- ✅ Salary request management
- ✅ Audit log management
- ✅ Notification deletion

#### Sidebar Updated

- ✅ Changed "استيراد Excel" menu to "جداول الرواتب"
- ✅ Points to /admin/import (existing payroll/employee import page)

---

## 📖 How to Use

### 1. Import Payroll Data

Navigate to `/admin/import` (جداول الرواتب in sidebar)

#### Using the Excel Import Dialog:

```javascript
import { ExcelImportDialog } from '@/components/admin/excel-import-dialog'
import { payrollStoreActions } from '@/lib/payroll-store'

// In your component:
const [importOpen, setImportOpen] = useState(false)

const handleImport = (month: number, year: number, rows: PayrollSheetRow[]) => {
  payrollStoreActions.addPayrollSheet({
    month,
    year,
    status: 'draft',
    rows,
    cashAlertThreshold: 700,
  })
}

// Render:
<ExcelImportDialog
  open={importOpen}
  onOpenChange={setImportOpen}
  onImport={handleImport}
/>
```

### 2. Excel Format

Your Excel file should contain these columns (auto-detects variations):

- `employee_id` / `employeeid` / `id` - Required
- `full_name` / `name` - Required
- `department` / `dept`
- `hours_or_days` / `worked`
- `rate` / `hourly_rate` / `daily_rate`
- `total_salary` / `salary` - Required
- `withdrawals` / `deductions`
- `cash_received` / `cash`
- `transfer_received` / `transfer`
- `notes` / `remarks`

### 3. Export Payroll Data

```javascript
import { exportPayrollToExcel } from "@/lib/excel-utils";

// Export a payroll sheet
const sheet = payrollStoreActions.getPayrollSheet(sheetId);
if (sheet) {
  const fileName = `payroll-${sheet.month}-${sheet.year}.xlsx`;
  exportPayrollToExcel(sheet.rows, fileName);
}
```

### 4. Manage Payroll Sheets

```javascript
// Get a sheet by ID
const sheet = payrollStoreActions.getPayrollSheet(sheetId);

// Get sheet by month/year
const sheet = payrollStoreActions.getPayrollSheetByMonth(5, 2026); // May 2026

// Update sheet (e.g., close/approve it)
payrollStoreActions.updatePayrollSheet(sheetId, {
  status: "approved", // or 'closed'
  closedAt: new Date(),
});

// Delete sheet
payrollStoreActions.deletePayrollSheet(sheetId);
```

### 5. Salary Requests

```javascript
import { payrollStoreActions } from "@/lib/payroll-store";

// Add a request
payrollStoreActions.addSalaryRequest({
  employeeId: "E20001",
  fullName: "أحمد محمد",
  reason: "مراجعة الراتب",
  message: "أود مراجعة راتبي للشهر الماضي",
  status: "pending",
});

// Update request (approve/reject)
payrollStoreActions.updateSalaryRequest(requestId, {
  status: "approved",
  reply: "تم الموافقة على طلبك",
  approvedAt: new Date(),
});

// Get request
const request = payrollStoreActions.getSalaryRequest(requestId);
```

### 6. Audit Logs

```javascript
// Log an action
payrollStoreActions.addAuditLog({
  employeeId: "E20001",
  action: "profile_update",
  changes: { mobileNumber: "0599123456" },
  changedBy: "admin@example.com",
  timestamp: new Date(),
});
```

### 7. Notifications

```javascript
const { addNotification, deleteNotification } = useAppStore();

// Add notification
addNotification({
  title: "تم رفع جدول الرواتب",
  message: "تم استيراد بيانات الرواتب لشهر مايو",
  type: "success",
});

// Delete notification
deleteNotification(notificationId);
```

---

## 🎨 Component Examples

### Payroll Sheet Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>مايو 2026</CardTitle>
    <Badge className="bg-blue-100 text-blue-800">مسودة</Badge>
  </CardHeader>
  <CardContent>
    <p>إجمالي الرواتب: 50,000 ₪</p>
    <p>إجمالي السحوبات: 5,000 ₪</p>
  </CardContent>
</Card>
```

### Payroll Stats

```tsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <p className="text-sm text-muted-foreground">إجمالي الرواتب</p>
    <p className="text-lg font-semibold">50,000 ₪</p>
  </div>
  <div>
    <p className="text-sm text-muted-foreground">إجمالي السحوبات</p>
    <p className="text-lg font-semibold text-destructive">5,000 ₪</p>
  </div>
</div>
```

---

## 📊 Data Model Examples

### PayrollSheetRow

```typescript
{
  employeeId: "E20001",
  fullName: "أحمد محمد",
  department: "المبيعات",
  hoursOrDays: 20,
  rate: 50,
  totalSalary: 1000,
  withdrawals: 100,
  cashReceived: 500,
  transferReceived: 400,
  netSalary: 900,
  remaining: 0,
  notes: ""
}
```

### PayrollSheet

```typescript
{
  id: "uuid",
  month: 5,
  year: 2026,
  status: "draft",
  rows: [...],
  totalSalary: 50000,
  totalWithdrawals: 5000,
  cashAlertThreshold: 700,
  createdAt: Date,
  updatedAt: Date,
  closedAt?: Date
}
```

---

## 🔄 Workflow

1. **Upload Excel** → Dialog validates and previews
2. **Create Payroll Sheet** → Stored in Zustand with month/year key
3. **View Payroll** → List all sheets with filters
4. **Export** → Download as Excel
5. **Manage Requests** → Employees submit, admins approve
6. **Close Payroll** → Lock sheet, no further edits
7. **Archive** → Historical data stays in localStorage

---

## 🚀 Next Steps

To complete the system:

1. **Phase 3**: Salary Requests
   - Employee request form
   - Admin approval panel
   - Notifications on state change

2. **Phase 4**: Notifications
   - Bell icon in header
   - Notification dropdown
   - Auto-triggers on payroll events

3. **Phase 5**: PDF Slips
   - Individual salary slips
   - O2 branding
   - Print functionality

4. **Phase 6**: Advanced Filtering
   - Department/Branch filters
   - Status filters
   - Live search

5. **Phase 7-9**: Refinements
   - Dark mode
   - Mobile optimization
   - Admin settings page

---

## 🧪 Test Checklist

- [ ] Upload Excel with various column names
- [ ] Verify calculations (Net Salary, Remaining)
- [ ] Download exported Excel matches uploaded data
- [ ] Create multiple payroll sheets for different months
- [ ] Test month/year filtering
- [ ] Close payroll and verify lock
- [ ] Try duplicate month detection
- [ ] Test on mobile devices
- [ ] Verify dark mode appearance
- [ ] Check Arabic text rendering

---

## 📁 File Location Reference

```
/lib/
  ├── types.ts ........................ Extended with payroll types
  ├── store.ts ....................... Enhanced with payroll state
  ├── payroll-store.ts ............... NEW - Payroll action helpers
  ├── excel-utils.ts ................. NEW - Excel import/export

/components/admin/
  ├── sidebar.tsx .................... Updated menu item
  ├── excel-import-dialog.tsx ........ NEW - Import UI dialog
  └── [Future payroll components]

/app/admin/
  └── import/page.tsx ................ Can integrate payroll tab

[Future Routes]
  /app/admin/payroll/page.tsx ........ Payroll list view
  /app/admin/salaries/page.tsx ....... Salary filtering
  /app/admin/requests/page.tsx ....... Request approvals
```

---

## ⚙️ Configuration

Default settings (in store):

```javascript
cashAlertThreshold: 700; // ₪ - Alert when remaining < 700
cashDaysDefault: 3; // Days until cash payment
```

Change defaults:

```javascript
store.setCashAlertThreshold(800);
store.setCashDaysDefault(5);
```

---

## 💾 Data Persistence

All payroll data is automatically persisted to localStorage via Zustand:

- payroll sheets
- salary requests
- audit logs
- notifications

Data syncs on every update.

---

**Last Updated**: 2026-05-23
**Status**: Phase 2 (85%) ✅ | Ready for Phase 3
