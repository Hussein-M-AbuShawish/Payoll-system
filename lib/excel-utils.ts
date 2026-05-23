// Excel import/export utilities for payroll
import * as XLSX from "xlsx";
import type { PayrollSheetRow } from "./types";

export interface ExcelImportResult {
  success: boolean;
  rows: PayrollSheetRow[];
  errors: string[];
  columnMapping: Record<string, number>;
}

const EXPECTED_COLUMNS = {
  employeeId: ["employee_id", "employeeid", "id", "emp_id"],
  fullName: ["full_name", "fullname", "name", "employee_name"],
  department: ["department", "dept"],
  hoursOrDays: ["hours_or_days", "hoursdays", "hours", "days", "worked"],
  rate: ["rate", "hourly_rate", "daily_rate"],
  totalSalary: ["total_salary", "totalsalary", "salary"],
  withdrawals: ["withdrawals", "deductions", "deduct"],
  cashReceived: ["cash_received", "cash", "cash_payment"],
  transferReceived: ["transfer_received", "transfer", "bank_transfer"],
  notes: ["notes", "comment", "remarks"],
};

export const parseExcelFile = (file: File): Promise<ExcelImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        if (!worksheet) {
          resolve({
            success: false,
            rows: [],
            errors: ["لم يتم العثور على أي ورقة عمل في الملف"],
            columnMapping: {},
          });
          return;
        }

        // Get headers
        const headerRow = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        })[0] as string[];
        if (!headerRow) {
          resolve({
            success: false,
            rows: [],
            errors: ["الملف فارغ أو لا يحتوي على رؤوس أعمدة"],
            columnMapping: {},
          });
          return;
        }

        // Auto-map columns
        const columnMapping: Record<string, number> = {};
        const lowerHeaders = headerRow.map((h) => h.toLowerCase().trim());

        for (const [fieldName, aliases] of Object.entries(EXPECTED_COLUMNS)) {
          const foundIndex = lowerHeaders.findIndex((header) =>
            aliases.some((alias) => header.includes(alias.toLowerCase())),
          );
          if (foundIndex !== -1) {
            columnMapping[fieldName] = foundIndex;
          }
        }

        // Parse rows
        const allRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as unknown[][];
        const rows: PayrollSheetRow[] = [];
        const errors: string[] = [];

        allRows.forEach((row, rowIndex) => {
          if (rowIndex === 0 || !row || row.length === 0) return;

          try {
            const parsed: PayrollSheetRow = {
              employeeId: String(row[columnMapping["employeeId"]] || "").trim(),
              fullName: String(
                row[columnMapping["fullName"]] || "غير معروف",
              ).trim(),
              department: String(
                row[columnMapping["department"]] || "إدارة",
              ).trim(),
              hoursOrDays: Number(row[columnMapping["hoursOrDays"]] || 0),
              rate: Number(row[columnMapping["rate"]] || 0),
              totalSalary: Number(row[columnMapping["totalSalary"]] || 0),
              withdrawals: Number(row[columnMapping["withdrawals"]] || 0),
              cashReceived: Number(row[columnMapping["cashReceived"]] || 0),
              transferReceived: Number(
                row[columnMapping["transferReceived"]] || 0,
              ),
              netSalary: 0,
              remaining: 0,
              notes: String(row[columnMapping["notes"]] || "").trim(),
            };

            // Calculate derived fields
            parsed.netSalary = parsed.totalSalary - parsed.withdrawals;
            parsed.remaining =
              parsed.netSalary -
              (parsed.cashReceived + parsed.transferReceived);

            // Validation
            if (!parsed.employeeId) {
              errors.push(`صف ${rowIndex + 1}: رقم الموظف مفقود`);
              return;
            }

            if (parsed.totalSalary <= 0) {
              errors.push(
                `صف ${rowIndex + 1}: الراتب الإجمالي يجب أن يكون أكبر من الصفر`,
              );
              return;
            }

            rows.push(parsed);
          } catch (err) {
            errors.push(`صف ${rowIndex + 1}: خطأ في معالجة البيانات`);
          }
        });

        if (rows.length === 0) {
          resolve({
            success: false,
            rows: [],
            errors:
              errors.length > 0
                ? errors
                : ["لم يتم العثور على أي بيانات صحيحة في الملف"],
            columnMapping,
          });
          return;
        }

        resolve({
          success: true,
          rows,
          errors,
          columnMapping,
        });
      } catch (err) {
        resolve({
          success: false,
          rows: [],
          errors: ["خطأ في قراءة الملف: " + String(err)],
          columnMapping: {},
        });
      }
    };

    reader.readAsArrayBuffer(file);
  });
};

export const exportPayrollToExcel = (
  rows: PayrollSheetRow[],
  fileName: string = "payroll-sheet.xlsx",
) => {
  const worksheet = XLSX.utils.json_to_sheet(
    rows.map((row) => ({
      "رقم الموظف": row.employeeId,
      "اسم الموظف": row.fullName,
      القسم: row.department,
      "الساعات/الأيام": row.hoursOrDays,
      السعر: row.rate,
      "الراتب الإجمالي": row.totalSalary,
      السحوبات: row.withdrawals,
      "الراتب الصافي": row.netSalary,
      "الكاش المستلم": row.cashReceived,
      "التحويل المستلم": row.transferReceived,
      المتبقي: row.remaining,
      ملاحظات: row.notes || "",
    })),
    {
      header: [
        "رقم الموظف",
        "اسم الموظف",
        "القسم",
        "الساعات/الأيام",
        "السعر",
        "الراتب الإجمالي",
        "السحوبات",
        "الراتب الصافي",
        "الكاش المستلم",
        "التحويل المستلم",
        "المتبقي",
        "ملاحظات",
      ],
    },
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "رواتب");

  XLSX.writeFile(workbook, fileName);
};
