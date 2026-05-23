# O2 Payroll System - Technical API Reference

## Type Definitions

### PayrollSheetStatus

```typescript
type PayrollSheetStatus = "draft" | "approved" | "closed";
```

### PayrollSheetRow

```typescript
interface PayrollSheetRow {
  employeeId: string; // E.g., "E20001"
  fullName: string; // Employee name
  department: string; // Department name
  hoursOrDays: number; // Hours worked or days
  rate: number; // Hourly/daily rate
  totalSalary: number; // Total salary amount
  withdrawals: number; // Withdrawals/deductions
  cashReceived: number; // Cash payment received
  transferReceived: number; // Bank transfer received
  netSalary: number; // Auto-calculated: totalSalary - withdrawals
  remaining: number; // Auto-calculated: netSalary - (cashReceived + transferReceived)
  notes?: string; // Optional notes
}
```

### PayrollSheet

```typescript
interface PayrollSheet {
  id: string; // UUID
  month: number; // 1-12
  year: number; // E.g., 2026
  fileName?: string; // Original Excel file name
  status: PayrollSheetStatus; // draft | approved | closed
  rows: PayrollSheetRow[]; // Payroll data rows
  totalSalary: number; // Sum of all totalSalary
  totalWithdrawals: number; // Sum of all withdrawals
  cashAlertThreshold: number; // Amount threshold (default 700)
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
  closedAt?: Date; // Closed timestamp
}
```

### SalaryRequest

```typescript
interface SalaryRequest {
  id: string; // UUID
  employeeId: string; // Reference to employee
  fullName: string; // Employee name (denormalized)
  reason: string; // Request reason
  message?: string; // Detailed message
  status: "pending" | "approved" | "rejected";
  reply?: string; // Admin reply message
  createdAt: Date; // Request date
  updatedAt: Date; // Last update date
  approvedAt?: Date; // Approval date
}
```

### AuditLog

```typescript
interface AuditLog {
  id: string; // UUID
  employeeId: string; // Affected employee
  action: AuditActionType; // Type of action
  changes: Record<string, unknown>; // What changed
  changedBy: string; // Who made the change
  timestamp: Date; // When it happened
}

type AuditActionType =
  | "profile_update"
  | "password_change"
  | "status_change"
  | "payroll_upload"
  | "payroll_close";
```

---

## Zustand Store API

### Payroll Sheet Actions

#### addPayrollSheet(sheetData)

Creates a new payroll sheet and automatically calculates totals.

```typescript
payrollStoreActions.addPayrollSheet({
  month: 5,
  year: 2026,
  status: 'draft',
  rows: [...],
  cashAlertThreshold: 700,
})

// Automatically calculates:
// - totalSalary = sum of all row.totalSalary
// - totalWithdrawals = sum of all row.withdrawals
// - id, createdAt, updatedAt
```

#### updatePayrollSheet(id, data)

Updates an existing payroll sheet.

```typescript
payrollStoreActions.updatePayrollSheet(sheetId, {
  status: "closed",
  closedAt: new Date(),
});

// If rows are updated, totals are recalculated automatically
```

#### getPayrollSheet(id)

Retrieves a payroll sheet by ID.

```typescript
const sheet = payrollStoreActions.getPayrollSheet(sheetId);
// Returns: PayrollSheet | undefined
```

#### getPayrollSheetByMonth(month, year)

Retrieves payroll sheet for a specific month/year.

```typescript
const sheet = payrollStoreActions.getPayrollSheetByMonth(5, 2026);
// Returns: PayrollSheet | undefined
```

#### deletePayrollSheet(id)

Deletes a payroll sheet permanently.

```typescript
payrollStoreActions.deletePayrollSheet(sheetId);
```

### Salary Request Actions

#### addSalaryRequest(requestData)

Creates a new salary request.

```typescript
payrollStoreActions.addSalaryRequest({
  employeeId: "E20001",
  fullName: "أحمد محمد",
  reason: "مراجعة الراتب",
  message: "أود مراجعة راتبي",
  status: "pending",
});
```

#### updateSalaryRequest(id, data)

Updates a salary request.

```typescript
payrollStoreActions.updateSalaryRequest(requestId, {
  status: "approved",
  reply: "تمت الموافقة",
  approvedAt: new Date(),
});
```

#### getSalaryRequest(id)

Retrieves a salary request by ID.

```typescript
const request = payrollStoreActions.getSalaryRequest(requestId);
// Returns: SalaryRequest | undefined
```

#### deleteSalaryRequest(id)

Deletes a salary request.

```typescript
payrollStoreActions.deleteSalaryRequest(requestId);
```

### Audit Log Actions

#### addAuditLog(logData)

Creates an audit log entry.

```typescript
payrollStoreActions.addAuditLog({
  employeeId: "E20001",
  action: "profile_update",
  changes: { mobileNumber: "+970599123456" },
  changedBy: "admin@company.com",
  timestamp: new Date(),
});

// Automatically generates id
```

### Notification Actions

#### deleteNotification(id)

Deletes a notification (extends existing useAppStore).

```typescript
const { deleteNotification } = useAppStore();
deleteNotification(notificationId);
```

---

## Excel Utilities (`lib/excel-utils.ts`)

### parseExcelFile(file: File)

Parses an Excel file and extracts payroll data.

```typescript
const result = await parseExcelFile(excelFile);

// Returns: ExcelImportResult
interface ExcelImportResult {
  success: boolean;
  rows: PayrollSheetRow[];
  errors: string[];
  columnMapping: Record<string, number>;
}

// Usage:
const result = await parseExcelFile(selectedFile);
if (result.success) {
  payrollStoreActions.addPayrollSheet({
    month,
    year,
    status: "draft",
    rows: result.rows,
  });
}
```

**Features:**

- Auto-detects columns (handles variations in naming)
- Automatic calculation of netSalary and remaining
- Full validation with Arabic error messages
- Returns column mapping for transparency

### exportPayrollToExcel(rows, fileName)

Exports payroll rows to an Excel file.

```typescript
const sheet = payrollStoreActions.getPayrollSheet(sheetId);
if (sheet) {
  exportPayrollToExcel(sheet.rows, `payroll-05-2026.xlsx`);
}

// Features:
// - Arabic headers
// - Formatted columns
// - Currency symbols
// - Auto-download via browser
```

---

## Excel Column Auto-Mapping

The system recognizes these column name variations:

| Field            | Recognized Names                              |
| ---------------- | --------------------------------------------- |
| employeeId       | employee_id, employeeid, id, emp_id           |
| fullName         | full_name, fullname, name, employee_name      |
| department       | department, dept                              |
| hoursOrDays      | hours_or_days, hoursdays, hours, days, worked |
| rate             | rate, hourly_rate, daily_rate                 |
| totalSalary      | total_salary, totalsalary, salary             |
| withdrawals      | withdrawals, deductions, deduct               |
| cashReceived     | cash_received, cash, cash_payment             |
| transferReceived | transfer_received, transfer, bank_transfer    |
| notes            | notes, comment, remarks                       |

---

## Store State Structure

```typescript
interface AppState {
  // ... existing state ...

  // Payroll Sheets
  payrollSheets: PayrollSheet[];
  addPayrollSheet: (
    sheet: Omit<PayrollSheet, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updatePayrollSheet: (id: string, data: Partial<PayrollSheet>) => void;
  getPayrollSheet: (id: string) => PayrollSheet | undefined;
  getPayrollSheetByMonth: (
    month: number,
    year: number,
  ) => PayrollSheet | undefined;
  deletePayrollSheet: (id: string) => void;

  // Salary Requests
  salaryRequests: SalaryRequest[];
  addSalaryRequest: (
    request: Omit<SalaryRequest, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateSalaryRequest: (id: string, data: Partial<SalaryRequest>) => void;
  getSalaryRequest: (id: string) => SalaryRequest | undefined;
  deleteSalaryRequest: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, "id">) => void;

  // Notifications
  deleteNotification: (id: string) => void;

  // Settings
  cashAlertThreshold: number;
  setCashAlertThreshold: (amount: number) => void;
}
```

---

## Component: ExcelImportDialog

```typescript
interface ExcelImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (month: number, year: number, rows: PayrollSheetRow[]) => void;
}
```

**Usage:**

```tsx
import { ExcelImportDialog } from "@/components/admin/excel-import-dialog";

export function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Import</Button>
      <ExcelImportDialog
        open={open}
        onOpenChange={setOpen}
        onImport={(month, year, rows) => {
          // Handle import
          payrollStoreActions.addPayrollSheet({
            month,
            year,
            status: "draft",
            rows,
          });
        }}
      />
    </>
  );
}
```

**Features:**

- Step-by-step wizard (upload → preview → confirm)
- Month/Year selection
- File validation
- Data preview table (first 10 rows)
- Error reporting with count
- Animated transitions

---

## Validation Rules

### Payroll Sheet Import

- ✅ Employee ID required
- ✅ Total Salary > 0
- ✅ No duplicate sheets for same month/year
- ✅ Date parsing flexible (accepts multiple formats)

### Error Handling

- All errors returned in Arabic
- Row-level validation with row numbers
- Summary count of success/error items
- Clear guidance on what needs fixing

---

## Calculations

### Net Salary

```
netSalary = totalSalary - withdrawals
```

### Remaining Balance

```
remaining = netSalary - (cashReceived + transferReceived)
```

### Cash Alert

```
if (remaining < cashAlertThreshold) {
  // Show: "سيتم استلام الراتب كاش خلال X أيام"
}
```

---

## Data Persistence

All data persisted to localStorage via Zustand:

```javascript
{
  "o2-payroll-storage": {
    "payrollSheets": [...],
    "salaryRequests": [...],
    "auditLogs": [...],
    "notifications": [...],
    "cashAlertThreshold": 700,
    // ... other state
  }
}
```

---

## Event Triggers (TODO)

```typescript
// Auto-create notifications for:
const triggers = {
  employee_profile_update: "New profile change request",
  salary_request_created: "New salary review request",
  payroll_upload_complete: "Payroll sheet imported",
  payroll_approved: "Payroll approved by manager",
  payroll_closed: "Payroll locked and closed",
};
```

---

## Performance Considerations

- All calculations happen client-side
- Zustand maintains shallow equality
- localStorage persists ~1MB easily
- For large-scale (>1000 employees), consider pagination

---

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE: ❌ Not supported (XLSX library requirement)

---

## Security Notes

- Passwords stored in Zustand (plaintext for now)
- Consider Supabase integration for:
  - Secure authentication
  - Server-side calculations
  - Audit logging
  - Data encryption

---

## Testing Example

```typescript
// Test Excel parsing
import { parseExcelFile } from "@/lib/excel-utils";

test("Should parse Excel file correctly", async () => {
  const file = new File([xlsxContent], "payroll.xlsx");
  const result = await parseExcelFile(file);

  expect(result.success).toBe(true);
  expect(result.rows).toHaveLength(10);
  expect(result.rows[0].netSalary).toBe(900); // 1000 - 100
  expect(result.errors).toHaveLength(0);
});
```

---

**API Version**: 1.0
**Last Updated**: 2026-05-23
**Status**: Stable (Phase 2)
