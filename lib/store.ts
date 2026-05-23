import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Employee,
  Department,
  SalaryHistory,
  User,
  Notification,
  PayrollSheet,
  SalaryRequest,
  AuditLog,
  PayrollSheetRow,
} from "./types";
import { mockEmployees, mockDepartments, mockSalaryHistory } from "./mock-data";

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (employeeId: string, password: string) => boolean;
  logout: () => void;

  // Employees
  employees: Employee[];
  addEmployee: (
    employee: Omit<Employee, "id" | "createdAt" | "updatedAt" | "remaining">,
  ) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getEmployeeByEmployeeId: (employeeId: string) => Employee | undefined;
  employeeUpdateProfile: (
    id: string,
    data: Partial<Employee>,
    changedBy: string,
  ) => void;

  // Departments
  departments: Department[];
  addDepartment: (name: string) => void;
  updateDepartment: (id: string, name: string) => void;
  deleteDepartment: (id: string) => void;

  // Salary History
  salaryHistory: SalaryHistory[];
  addSalaryHistory: (history: Omit<SalaryHistory, "id" | "createdAt">) => void;

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
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "read">,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;

  // Settings
  cashDaysDefault: number;
  setCashDaysDefault: (days: number) => void;
  cashAlertThreshold: number;
  setCashAlertThreshold: (amount: number) => void;

  // Import
  importEmployees: (employees: Partial<Employee>[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      isAuthenticated: false,

      login: (employeeId: string, password: string) => {
        const employee = get().employees.find(
          (e) =>
            e.employeeId === employeeId &&
            (e.password === password || password === e.employeeId.slice(-4)),
        );

        if (employee) {
          set({
            currentUser: {
              id: employee.id,
              employeeId: employee.employeeId,
              fullName: employee.fullName,
              role: employee.role,
              department: employee.department,
            },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      // Employees
      employees: mockEmployees,

      addEmployee: (employeeData) => {
        const baseSalary = employeeData.rate * employeeData.workHours;
        const remaining =
          baseSalary - employeeData.withdrawals - employeeData.deductions;
        const newEmployee: Employee = {
          ...employeeData,
          id: crypto.randomUUID(),
          baseSalary,
          remaining,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ employees: [...state.employees, newEmployee] }));

        // Update department count
        const dept = get().departments.find(
          (d) => d.id === employeeData.departmentId,
        );
        if (dept) {
          set((state) => ({
            departments: state.departments.map((d) =>
              d.id === employeeData.departmentId
                ? { ...d, employeeCount: d.employeeCount + 1 }
                : d,
            ),
          }));
        }
      },

      updateEmployee: (id, data) => {
        set((state) => {
          const empIndex = state.employees.findIndex((e) => e.id === id);
          if (empIndex === -1) return state;

          const oldEmp = state.employees[empIndex];
          const updatedEmp = { ...oldEmp, ...data, updatedAt: new Date() };

          // Re-calculate baseSalary and remaining if rate or workHours changed
          if (data.rate !== undefined || data.workHours !== undefined) {
            updatedEmp.baseSalary = updatedEmp.rate * updatedEmp.workHours;
          }

          updatedEmp.remaining =
            updatedEmp.baseSalary -
            updatedEmp.withdrawals -
            updatedEmp.deductions;

          const newEmployees = [...state.employees];
          newEmployees[empIndex] = updatedEmp;

          return { employees: newEmployees };
        });
      },

      deleteEmployee: (id) => {
        const employee = get().employees.find((e) => e.id === id);
        if (employee) {
          set((state) => ({
            employees: state.employees.filter((e) => e.id !== id),
            departments: state.departments.map((d) =>
              d.id === employee.departmentId
                ? { ...d, employeeCount: Math.max(0, d.employeeCount - 1) }
                : d,
            ),
          }));
        }
      },

      getEmployeeById: (id) => get().employees.find((e) => e.id === id),
      getEmployeeByEmployeeId: (employeeId) =>
        get().employees.find((e) => e.employeeId === employeeId),

      employeeUpdateProfile: (id, data, changedBy) => {
        const oldEmp = get().employees.find((e) => e.id === id);
        if (!oldEmp) return;

        get().updateEmployee(id, data);

        // Create audit log
        get().addAuditLog({
          employeeId: oldEmp.employeeId,
          action: "profile_update",
          changes: data,
          changedBy: changedBy,
          timestamp: new Date(),
        });

        // Send notification to admin
        get().addNotification({
          title: "تحديث الملف الشخصي",
          message: `قام الموظف ${oldEmp.fullName} بتحديث بيانات ملفه الشخصي.`,
          type: "info",
        });
      },

      // Departments
      departments: mockDepartments,

      addDepartment: (name) => {
        const newDept: Department = {
          id: crypto.randomUUID(),
          name,
          employeeCount: 0,
          createdAt: new Date(),
        };
        set((state) => ({ departments: [...state.departments, newDept] }));
      },

      updateDepartment: (id, name) => {
        set((state) => ({
          departments: state.departments.map((d) =>
            d.id === id ? { ...d, name } : d,
          ),
          employees: state.employees.map((e) =>
            e.departmentId === id ? { ...e, department: name } : e,
          ),
        }));
      },

      deleteDepartment: (id) => {
        set((state) => ({
          departments: state.departments.filter((d) => d.id !== id),
        }));
      },

      // Salary History
      salaryHistory: mockSalaryHistory,

      addSalaryHistory: (history) => {
        const newHistory: SalaryHistory = {
          ...history,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        set((state) => ({
          salaryHistory: [...state.salaryHistory, newHistory],
        }));
      },

      // Salary Requests
      salaryRequests: [],
      addSalaryRequest: (requestData) => {
        const newRequest: SalaryRequest = {
          ...requestData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          salaryRequests: [...state.salaryRequests, newRequest],
        }));
        get().addNotification({
          title: "طلب مراجعة راتب جديد",
          message: `تم تقديم طلب مراجعة راتب جديد من قبل ${requestData.fullName}.`,
          type: "info",
        });
        return newRequest;
      },
      updateSalaryRequest: (id, data) => {
        set((state) => ({
          salaryRequests: state.salaryRequests.map((req) =>
            req.id === id ? { ...req, ...data, updatedAt: new Date() } : req,
          ),
        }));
        const updatedRequest = get().salaryRequests.find(
          (req) => req.id === id,
        );
        if (updatedRequest && data.status) {
          let notificationMessage = "";
          if (data.status === "approved") {
            notificationMessage = `تمت الموافقة على طلب مراجعة الراتب الخاص بك من قبل الإدارة.`;
          } else if (data.status === "rejected") {
            notificationMessage = `تم رفض طلب مراجعة الراتب الخاص بك من قبل الإدارة.`;
          }
          if (notificationMessage) {
            get().addNotification({
              title: "تحديث طلب مراجعة الراتب",
              message: notificationMessage,
              type: data.status === "approved" ? "success" : "error",
            });
          }
        }
      },

      // Audit Logs
      auditLogs: [],

      addAuditLog: (log) => {
        const newLog: AuditLog = {
          ...log,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };
        set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }));

        if (log.action === "profile_update") {
          get().addNotification({
            title: "تحديث ملف الموظف",
            message: `تم تحديث ملف الموظف ${log.changedBy} (${log.employeeId}).`,
            type: "info",
          });
        } else if (log.action === "payroll_upload") {
          get().addNotification({
            title: "تحميل كشوف الرواتب",
            message: `تم تحميل كشوف رواتب جديدة بواسطة ${log.changedBy}.`,
            type: "info",
          });
        }
      },

      // Notifications
      notifications: [],

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          read: false,
          createdAt: new Date(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      getSalaryRequest: (id: string) =>
        get().salaryRequests.find((r) => r.id === id),
      deleteSalaryRequest: (id: string) => {
        set((state) => ({
          salaryRequests: state.salaryRequests.filter((r) => r.id !== id),
        }));
      },

      // Settings
      cashDaysDefault: 3,
      setCashDaysDefault: (days) => set({ cashDaysDefault: days }),

      // Import
      importEmployees: (importedEmployees) => {
        const newEmployees = importedEmployees.map((emp) => {
          const dept = get().departments.find((d) => d.name === emp.department);
          const baseSalary = emp.baseSalary || 0;
          const withdrawals = emp.withdrawals || 0;
          const deductions = emp.deductions || 0;

          return {
            id: crypto.randomUUID(),
            employeeId: emp.employeeId || `E${Date.now()}`,
            fullName: emp.fullName || "غير معروف",
            department: emp.department || "إدارة",
            departmentId: dept?.id || get().departments[0]?.id || "",
            baseSalary,
            workHours: emp.workHours || 0,
            withdrawals,
            deductions,
            remaining: baseSalary - withdrawals - deductions,
            paymentStatus: emp.paymentStatus || "processing",
            cashDays: emp.cashDays || get().cashDaysDefault,
            password: emp.password || emp.employeeId?.slice(-4) || "0000",
            role: emp.role || "employee",
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Employee;
        });

        set((state) => ({ employees: [...state.employees, ...newEmployees] }));
      },
    }),
    {
      name: "o2-payroll-storage",
      partialize: (state) => ({
        employees: state.employees,
        departments: state.departments,
        salaryHistory: state.salaryHistory,
        payrollSheets: state.payrollSheets || [],
        salaryRequests: state.salaryRequests || [],
        auditLogs: state.auditLogs || [],
        notifications: state.notifications,
        cashDaysDefault: state.cashDaysDefault,
        cashAlertThreshold: state.cashAlertThreshold || 700,
      }),
    },
  ),
);
