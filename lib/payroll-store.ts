// Payroll-specific store actions
import { useAppStore } from "./store";
import type { PayrollSheet, AuditLog, PayrollSheetRow } from "./types";

export const payrollStoreActions = {
  // Payroll Sheets
  addPayrollSheet: (
    sheetData: Omit<PayrollSheet, "id" | "createdAt" | "updatedAt">,
  ) => {
    const totalSalary = sheetData.rows.reduce(
      (sum, row) => sum + row.totalSalary,
      0,
    );
    const totalWithdrawals = sheetData.rows.reduce(
      (sum, row) => sum + row.withdrawals,
      0,
    );

    const newSheet: PayrollSheet = {
      ...sheetData,
      id: crypto.randomUUID(),
      totalSalary,
      totalWithdrawals,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    useAppStore.setState((state) => ({
      payrollSheets: [...(state.payrollSheets || []), newSheet],
    }));
    useAppStore.getState().addAuditLog({
      employeeId: useAppStore.getState().currentUser?.employeeId || "N/A",
      action: "payroll_upload",
      changes: {
        month: newSheet.month,
        year: newSheet.year,
        fileName: newSheet.fileName,
      },
      changedBy: useAppStore.getState().currentUser?.fullName || "System",
      timestamp: new Date(),
    });
    return newSheet;
  },

  updatePayrollSheet: (id: string, data: Partial<PayrollSheet>) => {
    useAppStore.setState((state) => ({
      payrollSheets: (state.payrollSheets || []).map((sheet) => {
        if (sheet.id === id) {
          const updated = { ...sheet, ...data, updatedAt: new Date() };
          if (data.rows) {
            updated.totalSalary = data.rows.reduce(
              (sum, row) => sum + row.totalSalary,
              0,
            );
            updated.totalWithdrawals = data.rows.reduce(
              (sum, row) => sum + row.withdrawals,
              0,
            );
          }
          return updated;
        }
        return sheet;
      }),
    }));
  },

  getPayrollSheet: (id: string) => {
    const state = useAppStore.getState();
    return (state.payrollSheets || []).find((s) => s.id === id);
  },

  getPayrollSheetByMonth: (month: number, year: number) => {
    const state = useAppStore.getState();
    return (state.payrollSheets || []).find(
      (s) => s.month === month && s.year === year,
    );
  },

  deletePayrollSheet: (id: string) => {
    useAppStore.setState((state) => ({
      payrollSheets: (state.payrollSheets || []).filter((s) => s.id !== id),
    }));
  },

  // Audit Logs
  addAuditLog: (logData: Omit<AuditLog, "id">) => {
    const newLog: AuditLog = {
      ...logData,
      id: crypto.randomUUID(),
    };
    useAppStore.setState((state) => ({
      auditLogs: [...(state.auditLogs || []), newLog],
    }));
    return newLog;
  },

  // Settings
  setCashAlertThreshold: (amount: number) => {
    useAppStore.setState({ cashAlertThreshold: amount });
  },
};
