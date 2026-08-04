import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TabType,
  ThemeMode,
  Product,
  Contact,
  Invoice,
  BankAccount,
  Transaction,
  Employee,
  AttendanceLog,
  DebtReminder,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CONTACTS,
  INITIAL_SALES_INVOICES,
  INITIAL_PURCHASE_INVOICES,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_REMINDERS,
} from '../data/initialData';
import { getTodayJalali, toPersianDigits } from '../utils/persian';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  // Data
  products: Product[];
  contacts: Contact[];
  salesInvoices: Invoice[];
  purchaseInvoices: Invoice[];
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  employees: Employee[];
  attendance: AttendanceLog[];
  reminders: DebtReminder[];

  // Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Contact;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;

  addSalesInvoice: (invoice: Omit<Invoice, 'id'>) => Invoice;
  addPurchaseInvoice: (invoice: Omit<Invoice, 'id'>) => Invoice;
  deleteInvoice: (id: string, type: 'sale' | 'purchase') => void;

  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  addBankAccount: (account: Omit<BankAccount, 'id'>) => void;

  toggleEmployeeClock: (empId: string) => void;

  // Reminders
  addReminder: (reminder: Omit<DebtReminder, 'id' | 'createdAt' | 'status'>) => void;
  updateReminder: (reminder: DebtReminder) => void;
  deleteReminder: (id: string) => void;
  settleReminder: (id: string) => void;
  markAsReminded: (id: string) => void;

  resetAllData: () => void;

  // Toast
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Selected Invoice for Modal View/Print
  activeReceiptInvoice: Invoice | null;
  setActiveReceiptInvoice: (inv: Invoice | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'honish_theme_v1',
  PRODUCTS: 'honish_products_v1',
  CONTACTS: 'honish_contacts_v1',
  SALES: 'honish_sales_v1',
  PURCHASES: 'honish_purchases_v1',
  ACCOUNTS: 'honish_accounts_v1',
  TRANSACTIONS: 'honish_transactions_v1',
  EMPLOYEES: 'honish_employees_v1',
  ATTENDANCE: 'honish_attendance_v1',
  REMINDERS: 'honish_reminders_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as ThemeMode) || 'light';
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [activeReceiptInvoice, setActiveReceiptInvoice] = useState<Invoice | null>(null);

  // State with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [salesInvoices, setSalesInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : INITIAL_SALES_INVOICES;
  });

  const [purchaseInvoices, setPurchaseInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_INVOICES;
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState<AttendanceLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [reminders, setReminders] = useState<DebtReminder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  // Save to LocalStorage effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(salesInvoices));
  }, [salesInvoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchaseInvoices));
  }, [purchaseInvoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Product Actions
  const addProduct = (newP: Omit<Product, 'id'>) => {
    const id = `p-${Date.now()}`;
    const product: Product = { ...newP, id };
    setProducts((prev) => [product, ...prev]);
    showToast(`محصول «${product.name}» با موفقیت افزوده شد.`);
  };

  const updateProduct = (updatedP: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedP.id ? updatedP : p)));
    showToast(`بروزرسانی محصول «${updatedP.name}» انجام شد.`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('محصول با موفقیت حذف گردید.', 'info');
  };

  // Contact Actions
  const addContact = (newC: Omit<Contact, 'id' | 'createdAt'>): Contact => {
    const id = `c-${Date.now()}`;
    const contact: Contact = {
      ...newC,
      id,
      createdAt: getTodayJalali(),
    };
    setContacts((prev) => [contact, ...prev]);
    showToast(`شخص «${contact.name}» ثبت شد.`);
    return contact;
  };

  const updateContact = (updatedC: Contact) => {
    setContacts((prev) => prev.map((c) => (c.id === updatedC.id ? updatedC : c)));
    showToast(`اطلاعات «${updatedC.name}» بروز شد.`);
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    showToast('شخص مورد نظر حذف شد.', 'info');
  };

  // Sales Invoice Action (Deducts stock & updates contact balance)
  const addSalesInvoice = (newInv: Omit<Invoice, 'id'>): Invoice => {
    const id = `inv-s-${Date.now()}`;
    const invoice: Invoice = { ...newInv, id };
    
    // Deduct products inventory
    setProducts((prev) =>
      prev.map((p) => {
        const item = invoice.items.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      })
    );

    // Update Contact Balance if credit or partial
    const remainingUnpaid = invoice.finalTotal - invoice.paidAmount;
    if (remainingUnpaid > 0 && invoice.contactId) {
      setContacts((prev) =>
        prev.map((c) => {
          if (c.id === invoice.contactId) {
            return { ...c, balance: c.balance + remainingUnpaid };
          }
          return c;
        })
      );
    }

    // Add cash/bank transaction if paid
    if (invoice.paidAmount > 0) {
      const mainAcc = bankAccounts.find((a) => a.isMain) || bankAccounts[0];
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        date: invoice.date,
        type: 'income',
        amount: invoice.paidAmount,
        category: 'فروش عسل و محصولات',
        sourceAccount: mainAcc ? mainAcc.id : 'acc-1',
        contactId: invoice.contactId,
        contactName: invoice.contactName,
        description: `دریافتی فاکتور فروش ${invoice.number}`,
      };
      setTransactions((prev) => [newTx, ...prev]);

      if (mainAcc) {
        setBankAccounts((prev) =>
          prev.map((a) => (a.id === mainAcc.id ? { ...a, balance: a.balance + invoice.paidAmount } : a))
        );
      }
    }

    setSalesInvoices((prev) => [invoice, ...prev]);
    showToast(`فاکتور فروش ${invoice.number} با موفقیت صادر شد.`);
    return invoice;
  };

  // Purchase Invoice Action (Restocks inventory & updates contact balance)
  const addPurchaseInvoice = (newInv: Omit<Invoice, 'id'>): Invoice => {
    const id = `inv-p-${Date.now()}`;
    const invoice: Invoice = { ...newInv, id };

    // Increase product stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = invoice.items.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, stock: p.stock + item.quantity };
        }
        return p;
      })
    );

    // Update supplier balance
    const remainingUnpaid = invoice.finalTotal - invoice.paidAmount;
    if (remainingUnpaid > 0 && invoice.contactId) {
      setContacts((prev) =>
        prev.map((c) => {
          if (c.id === invoice.contactId) {
            return { ...c, balance: c.balance - remainingUnpaid };
          }
          return c;
        })
      );
    }

    setPurchaseInvoices((prev) => [invoice, ...prev]);
    showToast(`فاکتور خرید ${invoice.number} ثبت گردید و انبار بروز شد.`);
    return invoice;
  };

  const deleteInvoice = (id: string, type: 'sale' | 'purchase') => {
    if (type === 'sale') {
      setSalesInvoices((prev) => prev.filter((i) => i.id !== id));
    } else {
      setPurchaseInvoices((prev) => prev.filter((i) => i.id !== id));
    }
    showToast('فاکتور مورد نظر حذف شد.', 'info');
  };

  const addTransaction = (tData: Omit<Transaction, 'id' | 'date'>) => {
    const newTx: Transaction = {
      ...tData,
      id: `tx-${Date.now()}`,
      date: getTodayJalali(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Adjust Bank Account balances
    setBankAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === newTx.sourceAccount) {
          const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        if (newTx.type === 'transfer' && acc.id === newTx.destinationAccount) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        return acc;
      })
    );

    showToast('تراکنش مالی با موفقیت ثبت شد.');
  };

  const addBankAccount = (accData: Omit<BankAccount, 'id'>) => {
    const newAcc: BankAccount = {
      ...accData,
      id: `acc-${Date.now()}`,
    };
    setBankAccounts((prev) => [...prev, newAcc]);
    showToast(`حساب «${newAcc.name}» افزوده شد.`);
  };

  const toggleEmployeeClock = (empId: string) => {
    const nowTime = `${toPersianDigits(new Date().getHours().toString().padStart(2, '0'))}:${toPersianDigits(
      new Date().getMinutes().toString().padStart(2, '0')
    )}`;

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId) {
          const isCheckIn = emp.status !== 'حاضر';
          const newStatus = isCheckIn ? 'حاضر' : 'پایان شیفت';
          showToast(
            `${emp.name} ${isCheckIn ? 'وارد شیفت کاری شد' : 'از شیفت کاری خارج شد'}.`
          );
          return {
            ...emp,
            status: newStatus,
            checkInTime: isCheckIn ? nowTime : emp.checkInTime,
            checkOutTime: !isCheckIn ? nowTime : undefined,
          };
        }
        return emp;
      })
    );
  };

  // Reminder Actions
  const addReminder = (remData: Omit<DebtReminder, 'id' | 'createdAt' | 'status'>) => {
    const newRem: DebtReminder = {
      ...remData,
      id: `rem-${Date.now()}`,
      status: 'pending',
      createdAt: getTodayJalali(),
    };
    setReminders((prev) => [newRem, ...prev]);
    showToast(`یادآور سررسید برای «${newRem.contactName}» با موفقیت تنظیم گردید.`);
  };

  const updateReminder = (updatedRem: DebtReminder) => {
    setReminders((prev) => prev.map((r) => (r.id === updatedRem.id ? updatedRem : r)));
    showToast('یادآور با موفقیت بروزرسانی شد.');
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    showToast('یادآور مورد نظر حذف شد.', 'info');
  };

  const settleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'settled' as const } : r))
    );
    showToast('وضعیت یادآور به «تسویه‌شده» تغییر یافت.');
  };

  const markAsReminded = (id: string) => {
    const today = getTodayJalali();
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'reminded' as const, lastRemindedAt: today } : r
      )
    );
    showToast('ثبت یادآوری و ارسال پیامک با موفقیت انجام شد.');
  };

  const resetAllData = () => {
    setProducts(INITIAL_PRODUCTS);
    setContacts(INITIAL_CONTACTS);
    setSalesInvoices(INITIAL_SALES_INVOICES);
    setPurchaseInvoices(INITIAL_PURCHASE_INVOICES);
    setBankAccounts(INITIAL_BANK_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setEmployees(INITIAL_EMPLOYEES);
    setAttendance(INITIAL_ATTENDANCE);
    setReminders(INITIAL_REMINDERS);
    localStorage.clear();
    showToast('تمامی داده‌ها به حالت نمونه بازگردانده شدند.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        products,
        contacts,
        salesInvoices,
        purchaseInvoices,
        bankAccounts,
        transactions,
        employees,
        attendance,
        reminders,
        addProduct,
        updateProduct,
        deleteProduct,
        addContact,
        updateContact,
        deleteContact,
        addSalesInvoice,
        addPurchaseInvoice,
        deleteInvoice,
        addTransaction,
        addBankAccount,
        toggleEmployeeClock,
        addReminder,
        updateReminder,
        deleteReminder,
        settleReminder,
        markAsReminded,
        resetAllData,
        toasts,
        showToast,
        activeReceiptInvoice,
        setActiveReceiptInvoice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
