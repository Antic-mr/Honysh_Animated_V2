import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InvoiceItem, InvoiceStatus } from '../../types';
import { formatToman, formatNumber, getTodayJalali, getJalaliDateOffset } from '../../utils/persian';
import { Modal } from '../common/Modal';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Eye,
  UserPlus,
  Search,
  Printer,
  CheckCircle2,
  Clock,
  ChevronDown,
} from 'lucide-react';

export const SalesInvoiceView: React.FC = () => {
  const {
    salesInvoices,
    products,
    contacts,
    addSalesInvoice,
    deleteInvoice,
    addContact,
    setActiveReceiptInvoice,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Quick Add Customer Modal inside builder
  const [isQuickAddCustomerOpen, setIsQuickAddCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Invoice Builder State
  const [selectedContactId, setSelectedContactId] = useState<string>(
    contacts[0]?.id || ''
  );

  const [invoiceDate, setInvoiceDate] = useState<string>(getTodayJalali());
  const [dueDate, setDueDate] = useState<string>(getJalaliDateOffset(30)); // 30 days due
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'credit' | 'split'>('cash');
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      unit: products[0]?.unit || 'کیلوگرم',
      quantity: 1,
      unitPrice: products[0]?.sellingPrice || 390000,
      discount: 0,
      totalPrice: products[0]?.sellingPrice || 390000,
    },
  ]);

  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Auto-calculated totals
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const finalTotal = Math.max(0, subtotal - invoiceDiscount + shippingCost);
  const [paidAmount, setPaidAmount] = useState<number>(finalTotal);

  // Sync paidAmount when finalTotal changes if cash/bank
  const handlePaymentMethodChange = (method: 'cash' | 'bank' | 'credit' | 'split') => {
    setPaymentMethod(method);
    if (method === 'cash' || method === 'bank') {
      setPaidAmount(finalTotal);
    } else if (method === 'credit') {
      setPaidAmount(0);
    }
  };

  // Add Item Row to Builder
  const handleAddItemRow = () => {
    const defaultP = products[0];
    if (!defaultP) return;
    setItems((prev) => [
      ...prev,
      {
        productId: defaultP.id,
        productName: defaultP.name,
        unit: defaultP.unit,
        quantity: 1,
        unitPrice: defaultP.sellingPrice,
        discount: 0,
        totalPrice: defaultP.sellingPrice,
      },
    ]);
  };

  // Update Item Row in Builder
  const handleUpdateItemRow = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const cur = { ...updated[index] };

      if (field === 'productId') {
        const foundP = products.find((p) => p.id === value);
        if (foundP) {
          cur.productId = foundP.id;
          cur.productName = foundP.name;
          cur.unit = foundP.unit;
          cur.unitPrice = foundP.sellingPrice;
        }
      } else if (field === 'quantity') {
        cur.quantity = Math.max(1, Number(value));
      } else if (field === 'unitPrice') {
        cur.unitPrice = Number(value);
      } else if (field === 'discount') {
        cur.discount = Number(value);
      }

      cur.totalPrice = Math.max(0, cur.quantity * cur.unitPrice - cur.discount);
      updated[index] = cur;
      return updated;
    });
  };

  // Remove Item Row
  const handleRemoveItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Quick Add Customer Handler
  const handleSaveQuickCustomer = () => {
    if (!newCustomerName || !newCustomerPhone) return;
    const created = addContact({
      code: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      name: newCustomerName,
      phone: newCustomerPhone,
      type: 'customer',
      balance: 0,
    });
    setSelectedContactId(created.id);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setIsQuickAddCustomerOpen(false);
  };

  // Submit Invoice Handler
  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const contactObj = contacts.find((c) => c.id === selectedContactId);
    if (!contactObj || items.length === 0) return;

    const invoiceNum = `INV-1405-${Math.floor(100 + Math.random() * 900)}`;
    const status: InvoiceStatus =
      paidAmount >= finalTotal
        ? 'paid'
        : paidAmount > 0
        ? 'partially_paid'
        : 'credit';

    const newInv = addSalesInvoice({
      number: invoiceNum,
      type: 'sale',
      contactId: contactObj.id,
      contactName: contactObj.name,
      contactPhone: contactObj.phone,
      date: invoiceDate,
      dueDate: status === 'paid' ? undefined : dueDate,
      items,
      subtotal,
      invoiceDiscount,
      shippingCost,
      commissionTax: 0,
      finalTotal,
      paidAmount,
      status,
      paymentMethod,
      notes,
    });

    setActiveReceiptInvoice(newInv);
    setActiveSubTab('list');
  };

  // Filter Sales Invoices List
  const filteredInvoices = salesInvoices.filter((inv) => {
    const matchesSearch =
      inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.contactName.includes(searchTerm);

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'paid') return inv.status === 'paid';
    if (statusFilter === 'credit') return inv.status === 'credit' || inv.status === 'partially_paid';

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Section Header & SubTabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm">
        <div>
          <h2 className="text-xl font-black text-amber-950 dark:text-amber-400 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-600" />
            فاکتورهای فروش عسل و محصولات
          </h2>
          <p className="text-xs text-amber-800/60 dark:text-amber-200/60 mt-0.5">
            صدور فاکتور رسمی و غیررسمی، محاسبه تخفیفات و چاپ فاکتور فروشگاه
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#FAF6EE] dark:bg-[#1A120C] p-1.5 rounded-2xl border border-[#EFE4D2] dark:border-[#3A2A1E]">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'list'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-amber-900/70 dark:text-amber-200/70 hover:bg-amber-100/40'
            }`}
          >
            لیست فاکتورها ({salesInvoices.length})
          </button>
          <button
            onClick={() => setActiveSubTab('create')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'create'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-amber-900/70 dark:text-amber-200/70 hover:bg-amber-100/40'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>صدور فاکتور جدید</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'list' ? (
        /* LIST VIEW */
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFDF8] dark:bg-[#251B13] p-4 rounded-2xl border border-[#EFE4D2] dark:border-[#3D2D21]">
            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجوی شماره فاکتور یا مشتری..."
                className="w-full pr-9 pl-3 py-2 rounded-xl text-xs bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {[
                { id: 'all', label: 'همه فاکتورها' },
                { id: 'paid', label: 'تسویه‌شده' },
                { id: 'credit', label: 'نسیه و مانده‌دار' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-[#FAF6EE] dark:bg-[#1A120C] text-amber-900/80 dark:text-amber-200/70'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#FFFDF8] dark:bg-[#251B13] rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF6EE] dark:bg-[#1A120C] text-amber-950 dark:text-amber-300 font-bold border-b border-[#EFE4D2] dark:border-[#3A2A1E]">
                    <th className="p-3.5">شماره فاکتور</th>
                    <th className="p-3.5">مشتری</th>
                    <th className="p-3.5">تاریخ صدور</th>
                    <th className="p-3.5">جمع کل</th>
                    <th className="p-3.5">پرداختی</th>
                    <th className="p-3.5">وضعیت</th>
                    <th className="p-3.5 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE4D2] dark:divide-[#3A2A1E]">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors"
                    >
                      <td className="p-3.5 font-bold text-amber-950 dark:text-amber-200">
                        {inv.number}
                      </td>
                      <td className="p-3.5 font-bold text-stone-900 dark:text-stone-100">
                        {inv.contactName}
                      </td>
                      <td className="p-3.5 text-stone-600 dark:text-stone-400">{inv.date}</td>
                      <td className="p-3.5 font-extrabold text-amber-900 dark:text-amber-300">
                        {formatToman(inv.finalTotal)}
                      </td>
                      <td className="p-3.5 text-emerald-700 font-bold">
                        {formatToman(inv.paidAmount)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {inv.status === 'paid' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> تسویه‌شده
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> نسیه
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setActiveReceiptInvoice(inv)}
                            className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 hover:bg-amber-200 transition-colors cursor-pointer"
                            title="پیش‌نمایش و چاپ فاکتور"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`آیا از حذف فاکتور ${inv.number} اطمینان دارید؟`)) {
                                deleteInvoice(inv.id, 'sale');
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* CREATE BUILDER VIEW */
        <form onSubmit={handleSaveInvoice} className="space-y-6">
          <div className="bg-[#FFFDF8] dark:bg-[#251B13] p-6 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm space-y-6">
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-400 border-b border-[#EFE4D2] dark:border-[#3D2D21] pb-3">
              مشخصات اولیه فاکتور فروش
            </h3>

            {/* Top Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Customer Selector + Quick Add */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-amber-900 dark:text-amber-300">
                    انتخاب خریدار / مشتری *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickAddCustomerOpen(true)}
                    className="text-amber-600 font-bold hover:underline flex items-center gap-1 cursor-pointer text-[11px]"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>افزودن سریع</span>
                  </button>
                </div>
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] font-bold"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - مانده: {formatToman(c.balance)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                  تاریخ صدور (جلالی)
                </label>
                <input
                  type="text"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                  نحوه تسویه
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    handlePaymentMethodChange(e.target.value as 'cash' | 'bank' | 'credit' | 'split')
                  }
                  className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] font-bold"
                >
                  <option value="cash">نقدی - کارت‌خوان</option>
                  <option value="bank">واریز بانکی کارت به کارت</option>
                  <option value="credit">نسیه (اقساطی / چك)</option>
                  <option value="split">ترکیبی (بخشی نقد، بخشی نسیه)</option>
                </select>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-3 pt-4 border-t border-[#EFE4D2] dark:border-[#3D2D21]">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-950 dark:text-amber-300 text-sm">
                  ردیف‌های کالا (عسل، موم، ظروف)
                </h4>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن ردیف کالا</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF6EE] dark:bg-[#1A120C] text-amber-900 dark:text-amber-300 font-bold border-b border-[#EFE4D2] dark:border-[#3A2A1E]">
                      <th className="p-2.5 w-10 text-center">#</th>
                      <th className="p-2.5">محصول / کالا</th>
                      <th className="p-2.5 text-center w-24">تعداد/کیلو</th>
                      <th className="p-2.5 text-left w-32">قیمت واحد (تومان)</th>
                      <th className="p-2.5 text-left w-28">تخفیف (تومان)</th>
                      <th className="p-2.5 text-left w-36">جمع ردیف (تومان)</th>
                      <th className="p-2.5 text-center w-12">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE4D2] dark:divide-[#3A2A1E]">
                    {items.map((item, index) => (
                      <tr key={index} className="hover:bg-amber-50/30">
                        <td className="p-2.5 text-center font-bold text-stone-500">
                          {index + 1}
                        </td>
                        <td className="p-2.5">
                          <select
                            value={item.productId}
                            onChange={(e) =>
                              handleUpdateItemRow(index, 'productId', e.target.value)
                            }
                            className="w-full p-2 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] font-bold"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (موجودی: {p.stock} {p.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItemRow(index, 'quantity', e.target.value)
                            }
                            className="w-full p-2 text-center rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] font-bold"
                          />
                        </td>
                        <td className="p-2.5 text-left">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleUpdateItemRow(index, 'unitPrice', e.target.value)
                            }
                            className="w-full p-2 text-left rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] font-bold"
                          />
                        </td>
                        <td className="p-2.5 text-left">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) =>
                              handleUpdateItemRow(index, 'discount', e.target.value)
                            }
                            className="w-full p-2 text-left rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
                          />
                        </td>
                        <td className="p-2.5 text-left font-black text-amber-900 dark:text-amber-300">
                          {formatNumber(item.totalPrice)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(index)}
                            disabled={items.length === 1}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dual Totals & Final Calculations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#EFE4D2] dark:border-[#3D2D21]">
              <div className="space-y-3 text-xs">
                <label className="block font-bold text-amber-900 dark:text-amber-300">
                  یادداشت و شرایط تحویل فاکتور
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثلا: ارسال با پیک موتوری / تسویه سررسید تاریخ..."
                  className="w-full p-3 rounded-2xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
                />
              </div>

              <div className="bg-[#FAF6EE] dark:bg-[#1A120C] p-5 rounded-2xl border border-[#EFE4D2] dark:border-[#3A2A1E] space-y-3 text-xs">
                <div className="flex justify-between font-bold text-stone-700 dark:text-stone-300">
                  <span>جمع اولیه اقلام:</span>
                  <span>{formatToman(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-amber-900 dark:text-amber-300">
                    تخفیف کلی فاکتور:
                  </span>
                  <input
                    type="number"
                    value={invoiceDiscount}
                    onChange={(e) => setInvoiceDiscount(Number(e.target.value))}
                    className="w-32 p-1.5 text-left rounded-xl bg-[#FFFDF8] dark:bg-[#251B13] border border-[#EFE4D2] dark:border-[#3A2A1E] font-bold"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-amber-900 dark:text-amber-300">
                    هزینه حمل و ارسال:
                  </span>
                  <input
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(Number(e.target.value))}
                    className="w-32 p-1.5 text-left rounded-xl bg-[#FFFDF8] dark:bg-[#251B13] border border-[#EFE4D2] dark:border-[#3A2A1E] font-bold"
                  />
                </div>

                <div className="border-t border-amber-300 dark:border-amber-800 pt-2 flex justify-between text-sm font-black text-amber-950 dark:text-amber-300">
                  <span>جمع نهایی قابل پرداخت:</span>
                  <span className="text-amber-600 dark:text-amber-400 text-base">
                    {formatToman(finalTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    مبلغ دریافتی نقد:
                  </span>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-36 p-1.5 text-left rounded-xl bg-[#FFFDF8] dark:bg-[#251B13] border border-emerald-400 font-black text-emerald-800 dark:text-emerald-300"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFE4D2] dark:border-[#3D2D21]">
              <button
                type="button"
                onClick={() => setActiveSubTab('list')}
                className="px-5 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ثبت فاکتور و صدور پیش‌نمایش چاپ</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Quick Add Customer Modal */}
      <Modal
        isOpen={isQuickAddCustomerOpen}
        onClose={() => setIsQuickAddCustomerOpen(false)}
        title="افزودن سریع مشتری جدید"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1">نام و نام خانوادگی خریدار *</label>
            <input
              type="text"
              placeholder="مثال: آقای محمدی"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">شماره همراه *</label>
            <input
              type="text"
              placeholder="09120000000"
              value={newCustomerPhone}
              onChange={(e) => setNewCustomerPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsQuickAddCustomerOpen(false)}
              className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 font-bold"
            >
              انصراف
            </button>
            <button
              onClick={handleSaveQuickCustomer}
              className="px-5 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold shadow-md"
            >
              ثبت و انتخاب
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
