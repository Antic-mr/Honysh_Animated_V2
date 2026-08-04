import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InvoiceItem, InvoiceStatus } from '../../types';
import { formatToman, formatNumber, getTodayJalali, getJalaliDateOffset } from '../../utils/persian';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Eye,
  Search,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';

export const PurchaseInvoiceView: React.FC = () => {
  const {
    purchaseInvoices,
    products,
    contacts,
    addPurchaseInvoice,
    deleteInvoice,
    setActiveReceiptInvoice,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  // Suppliers filter
  const suppliers = contacts.filter((c) => c.type === 'supplier' || c.type === 'both');

  // Purchase Builder State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    suppliers[0]?.id || contacts[0]?.id || ''
  );

  const [invoiceDate, setInvoiceDate] = useState<string>(getTodayJalali());
  const [dueDate, setDueDate] = useState<string>(getJalaliDateOffset(30));
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'credit' | 'split'>('bank');

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      unit: products[0]?.unit || 'کیلوگرم',
      quantity: 50,
      unitPrice: products[0]?.purchasePrice || 280000,
      discount: 0,
      totalPrice: 50 * (products[0]?.purchasePrice || 280000),
    },
  ]);

  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const finalTotal = Math.max(0, subtotal - invoiceDiscount + shippingCost);
  const [paidAmount, setPaidAmount] = useState<number>(finalTotal);

  const handleAddItemRow = () => {
    const defaultP = products[0];
    if (!defaultP) return;
    setItems((prev) => [
      ...prev,
      {
        productId: defaultP.id,
        productName: defaultP.name,
        unit: defaultP.unit,
        quantity: 10,
        unitPrice: defaultP.purchasePrice,
        discount: 0,
        totalPrice: 10 * defaultP.purchasePrice,
      },
    ]);
  };

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
          cur.unitPrice = foundP.purchasePrice;
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

  const handleRemoveItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const supplierObj = contacts.find((c) => c.id === selectedSupplierId);
    if (!supplierObj || items.length === 0) return;

    const invoiceNum = `PUR-1405-${Math.floor(100 + Math.random() * 900)}`;
    const status: InvoiceStatus =
      paidAmount >= finalTotal
        ? 'paid'
        : paidAmount > 0
        ? 'partially_paid'
        : 'credit';

    const newInv = addPurchaseInvoice({
      number: invoiceNum,
      type: 'purchase',
      contactId: supplierObj.id,
      contactName: supplierObj.name,
      contactPhone: supplierObj.phone,
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

  const filteredInvoices = purchaseInvoices.filter(
    (inv) =>
      inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.contactName.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm">
        <div>
          <h2 className="text-xl font-black text-amber-950 dark:text-amber-400 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-600" />
            فاکتورهای خرید عسل از زنبورداران
          </h2>
          <p className="text-xs text-amber-800/60 dark:text-amber-200/60 mt-0.5">
            ثبت خریدهای عمده شهد، موم و ظروف بسته‌بندی جهت افزایش خودکار موجودی انبار
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
            لیست خریدهای قبلی ({purchaseInvoices.length})
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
            <span>ثبت خرید جدید</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'list' ? (
        <div className="space-y-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی فاکتور یا نام زنبوردار..."
              className="w-full pr-9 pl-3 py-2 rounded-xl text-xs bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
            />
          </div>

          <div className="bg-[#FFFDF8] dark:bg-[#251B13] rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF6EE] dark:bg-[#1A120C] text-amber-950 dark:text-amber-300 font-bold border-b border-[#EFE4D2] dark:border-[#3A2A1E]">
                    <th className="p-3.5">شماره فاکتور خرید</th>
                    <th className="p-3.5">تامین‌کننده / زنبوردار</th>
                    <th className="p-3.5">تاریخ خرید</th>
                    <th className="p-3.5">مبلغ کل خرید</th>
                    <th className="p-3.5">مبلغ پرداختی</th>
                    <th className="p-3.5">وضعیت تسویه</th>
                    <th className="p-3.5 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE4D2] dark:divide-[#3A2A1E]">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-900/10">
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
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60'
                          }`}
                        >
                          {inv.status === 'paid' ? 'تسویه کامل' : 'اقساط / مانده‌دار'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setActiveReceiptInvoice(inv)}
                            className="p-1.5 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('آیا از حذف این فاکتور خرید اطمینان دارید؟')) {
                                deleteInvoice(inv.id, 'purchase');
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 cursor-pointer"
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
        /* PURCHASE BUILDER */
        <form onSubmit={handleSaveInvoice} className="space-y-6 text-xs">
          <div className="bg-[#FFFDF8] dark:bg-[#251B13] p-6 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm space-y-6">
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-400 border-b border-[#EFE4D2] dark:border-[#3D2D21] pb-3">
              اطلاعات خرید بار جدید
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                  تامین‌کننده / زنبوردار *
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] font-bold"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                  تاریخ صدور فاکتور خرید
                </label>
                <input
                  type="text"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                  نحوه پرداخت به فروشنده
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as 'cash' | 'bank' | 'credit' | 'split')
                  }
                  className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] font-bold"
                >
                  <option value="bank">واریز بانکی / کارت به کارت</option>
                  <option value="cash">نقدی</option>
                  <option value="credit">چک صیادی / نسیه</option>
                  <option value="split">ترکیبی (چک + واریزی)</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3 pt-4 border-t border-[#EFE4D2] dark:border-[#3D2D21]">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-950 dark:text-amber-300 text-sm">
                  اقلام خریداری شده (با ذخیره فاکتور، انبار شارژ می‌شود)
                </h4>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن کالا</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#FAF6EE] dark:bg-[#1A120C] text-amber-900 font-bold border-b border-[#EFE4D2]">
                      <th className="p-2.5 w-10 text-center">#</th>
                      <th className="p-2.5">نام کالا / عسل</th>
                      <th className="p-2.5 text-center w-28">مقدار خرید</th>
                      <th className="p-2.5 text-left w-36">قیمت خرید واحد (تومان)</th>
                      <th className="p-2.5 text-left w-36">جمع کل (تومان)</th>
                      <th className="p-2.5 text-center w-12">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE4D2] dark:divide-[#3A2A1E]">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="p-2.5 text-center font-bold">{index + 1}</td>
                        <td className="p-2.5">
                          <select
                            value={item.productId}
                            onChange={(e) =>
                              handleUpdateItemRow(index, 'productId', e.target.value)
                            }
                            className="w-full p-2 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] font-bold"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItemRow(index, 'quantity', e.target.value)
                            }
                            className="w-full p-2 text-center rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] font-bold"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleUpdateItemRow(index, 'unitPrice', e.target.value)
                            }
                            className="w-full p-2 text-left rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] font-bold"
                          />
                        </td>
                        <td className="p-2.5 text-left font-black text-amber-900">
                          {formatNumber(item.totalPrice)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(index)}
                            disabled={items.length === 1}
                            className="p-1.5 text-red-600 disabled:opacity-30 cursor-pointer"
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

            {/* Total Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-[#EFE4D2]">
              <div>
                <span className="font-bold text-amber-900">مبلغ پرداختی فعلی: </span>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="p-2 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] font-bold text-emerald-700"
                />
              </div>

              <div className="text-left font-black text-amber-950 dark:text-amber-300 text-sm">
                مبلغ نهایی خرید: <span className="text-amber-600 text-base">{formatToman(finalTotal)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('list')}
                className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 font-bold"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ثبت فاکتور خرید و افزایش موجودی انبار</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
