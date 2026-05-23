export type PaymentStatus = "bank_transfer" | "cash" | "processing";
export type UserRole = "super_admin" | "admin" | "hr" | "employee";
export type EmployeeStatus = "active" | "suspended" | "terminated";

export interface Department {
  id: string;
  name: string;
  employeeCount: number;
  createdAt: Date;
}

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  nationalId: string;
  mobileNumber: string;
  department: string;
  departmentId: string;
  branch: string;
  workType: "hourly" | "daily";
  rate: number;
  baseSalary: number;
  workHours: number;
  withdrawals: number;
  deductions: number;
  remaining: number;
  paymentStatus: PaymentStatus;
  cashDays: number;
  walletPhone?: string;
  walletOwnerName?: string;
  walletOwnerId?: string;
  password: string;
  role: UserRole;
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryHistory {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  baseSalary: number;
  workHours: number;
  withdrawals: number;
  deductions: number;
  remaining: number;
  paymentStatus: PaymentStatus;
  paidAt: Date | null;
  createdAt: Date;
}

export interface User {
  id: string;
  employeeId: string;
  fullName: string;
  role: UserRole;
  department: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalEmployees: number;
  totalSalaries: number;
  totalWithdrawals: number;
  totalDeductions: number;
  cashPayments: number;
  bankTransfers: number;
  processing: number;
}

export interface DepartmentStats {
  name: string;
  employeeCount: number;
  totalSalary: number;
  totalWithdrawals: number;
}

export type PayrollSheetStatus = "draft" | "approved" | "closed";

export interface PayrollSheetRow {
  employeeId: string;
  fullName: string;
  department: string;
  hoursOrDays: number;
  rate: number;
  totalSalary: number;
  withdrawals: number;
  cashReceived: number;
  transferReceived: number;
  netSalary: number;
  remaining: number;
  notes?: string;
}

export interface PayrollSheet {
  id: string;
  month: number;
  year: number;
  fileName?: string;
  status: PayrollSheetStatus;
  rows: PayrollSheetRow[];
  totalSalary: number;
  totalWithdrawals: number;
  cashAlertThreshold: number;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export type SalaryRequestStatus = "pending" | "approved" | "rejected";

export interface SalaryRequest {
  id: string;
  employeeId: string;
  fullName: string;
  reason: string;
  message?: string;
  status: SalaryRequestStatus;
  reply?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}

export type AuditActionType =
  | "profile_update"
  | "password_change"
  | "status_change"
  | "payroll_upload"
  | "payroll_close";

export interface AuditLog {
  id: string;
  employeeId: string;
  action: AuditActionType;
  changes: Record<string, unknown>;
  changedBy: string;
  timestamp: Date;
}

export interface ExcelUploadSession {
  id: string;
  fileName: string;
  parsedData: PayrollSheetRow[];
  columnMapping: Record<string, number>;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}
