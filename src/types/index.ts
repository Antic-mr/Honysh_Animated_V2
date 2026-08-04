export type TabType =
  | 'dashboard'
  | 'contacts'
  | 'sales-invoices'
  | 'purchase-invoices'
  | 'products'
  | 'accounting'
  | 'attendance'
  | 'reports';

export type ContactType = 'customer' | 'supplier' | 'both';

export interface Contact {
  id: string;
  code: string;
  name: string;
  phone: string;
  nationalCode?: string;
  type: ContactType;
  balance: number; // positive = debtor (طلبکاریم ازش), negative = creditor (بدهکاریم بهش)
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: 'عسل تک‌گل' | 'عسل چندگل' | 'موم و فراورده‌ها' | 'ظروف و بسته‌بندی';
  unit: 'کیلوگرم' | 'عدد' | 'گرم' | 'بسته';
  stock: number;
  minStock: number; // Low stock threshold
  purchasePrice: number; // in Tomans
  sellingPrice: number; // in Tomans
  description?: string;
  imageUrl?: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number; // in Tomans
  discount: number; // in Tomans
  totalPrice: number; // (quantity * unitPrice) - discount
}

export type InvoiceStatus = 'paid' | 'credit' | 'partially_paid' | 'cancelled';

export interface Invoice {
  id: string;
  number: string;
  type: 'sale' | 'purchase';
  contactId: string;
  contactName: string;
  contactPhone?: string;
  date: string; // Jalali e.g. 1405/05/13
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  invoiceDiscount: number;
  shippingCost: number;
  commissionTax: number;
  finalTotal: number;
  paidAmount: number;
  status: InvoiceStatus;
  paymentMethod: 'cash' | 'bank' | 'credit' | 'split';
  notes?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  cardPickerNumber?: string;
  isMain?: boolean;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  category: string;
  sourceAccount: string;
  destinationAccount?: string;
  contactId?: string;
  contactName?: string;
  referenceNumber?: string;
  description: string;
}

export type EmployeeRole = 'فروشنده' | 'انباردار' | 'راننده توزیع' | 'حسابدار' | 'مدیر فروشگاه';

export type ReminderType = 'debtor' | 'creditor'; // debtor = طلب ما از مشتری (بدهکار به ما), creditor = بدهی ما به تامین‌کننده (بستانکار)
export type ReminderStatus = 'pending' | 'reminded' | 'settled';

export interface DebtReminder {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone?: string;
  type: ReminderType;
  amount: number; // in Tomans
  dueDate: string; // Jalali date e.g. 1405/05/15
  title: string; // e.g. تسویه فاکتور فروش یا قسط خرید
  status: ReminderStatus;
  notes?: string;
  lastRemindedAt?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'فروشنده' | 'انباردار' | 'راننده توزیع' | 'حسابدار' | 'مدیر فروشگاه';
  phone: string;
  baseSalary: number; // Monthly salary in Tomans
  shift: 'صبح (۸ تا ۱۶)' | 'عصر (۱۶ تا ۲۴)' | 'تمام وقت';
  status: 'حاضر' | 'مرخصی' | 'غایب' | 'پایان شیفت';
  checkInTime?: string;
  checkOutTime?: string;
  workingDaysThisMonth: number;
}

export interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hoursWorked?: number;
  status: 'حاضر' | 'تاخیر' | 'مرخصی';
}

export type ThemeMode = 'light' | 'dark';
