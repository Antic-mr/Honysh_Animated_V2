import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { formatToman, formatNumber, toPersianDigits } from '../../utils/persian';
import { Printer, Share2, Hexagon, CheckCircle, Clock } from 'lucide-react';

export const InvoiceReceiptModal: React.FC = () => {
  const { activeReceiptInvoice, setActiveReceiptInvoice, showToast } = useApp();

  if (!activeReceiptInvoice) return null;

  const inv = activeReceiptInvoice;

  const handlePrint = () => {
    window.print();
  };

  const handleShareSMS = () => {
    showToast(`پیامک مشخصات فاکتور ${inv.number} به شماره ${inv.contactPhone || 'مشتری'} ارسال شد.`);
  };

  return (
    <Modal
      isOpen={!!activeReceiptInvoice}
      onClose={() => setActiveReceiptInvoice(null)}
      title={`پیش‌نمایش فاکتور ${inv.number}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Printable Area Container */}
        <div
          id="printable-receipt-area"
          className="bg-white text-stone-900 p-6 sm:p-8 rounded-2xl border-2 border-amber-200 shadow-sm space-y-6 font-sans text-sm"
        >
          {/* Factor Top Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-amber-500/30 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 shadow-md">
                <Hexagon className="w-7 h-7 fill-amber-300 stroke-amber-950 stroke-[1.5]" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-amber-900 tracking-tight">
                  فروشگاه عسل و زنبورداری هونیش
                </h2>
                <p className="text-xs text-stone-600 font-medium">
                  عرضه تخصصی انواع عسل طبیعی، ژل رویال، گرده گل و موم
                </p>
                <p className="text-[11px] text-stone-500">
                  تلفن پشتیبانی: ۰۲۱-۸۸۹۹۷۷۶۶ | همراه: ۰۹۱۲۳۴۵۶۷۸۹
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-amber-50/80 p-3 rounded-xl border border-amber-200 space-y-1">
              <div className="text-base font-black text-amber-950">
                {inv.type === 'sale' ? 'فاکتور فروش کالا' : 'فاکتور خرید کالا'}
              </div>
              <div className="text-xs font-semibold text-stone-700">
                شماره: <span className="font-bold text-amber-900">{toPersianDigits(inv.number)}</span>
              </div>
              <div className="text-xs text-stone-600">
                تاریخ صدور: <span className="font-bold">{inv.date}</span>
              </div>
              {inv.dueDate && (
                <div className="text-xs text-stone-600">
                  تاریخ سررسید: <span className="font-bold">{inv.dueDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer / Supplier Info */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-stone-500 font-medium">طرف حساب: </span>
              <span className="font-bold text-stone-900">{inv.contactName}</span>
            </div>
            <div>
              <span className="text-stone-500 font-medium">شماره تماس: </span>
              <span className="font-bold text-stone-900">
                {inv.contactPhone ? toPersianDigits(inv.contactPhone) : 'ثبت نشده'}
              </span>
            </div>
            <div>
              <span className="text-stone-500 font-medium">نحوه تسویه: </span>
              <span className="font-bold text-amber-800">
                {inv.paymentMethod === 'cash'
                  ? 'نقدی'
                  : inv.paymentMethod === 'bank'
                  ? 'واریز بانکی / کارتخوان'
                  : inv.paymentMethod === 'credit'
                  ? 'نسیه (اعتباری)'
                  : 'ترکیبی'}
              </span>
            </div>
            <div>
              <span className="text-stone-500 font-medium">وضعیت پرداخت: </span>
              <span
                className={`font-bold inline-flex items-center gap-1 ${
                  inv.status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {inv.status === 'paid' ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" /> تسویه‌شده کامل
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" /> نسیه / مانده‌دار
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-amber-100/70 text-amber-950 font-bold border-b-2 border-amber-300">
                  <th className="p-2.5 w-10 text-center">ردیف</th>
                  <th className="p-2.5">شرح کالا / خدمات</th>
                  <th className="p-2.5 text-center">مقدار / تعداد</th>
                  <th className="p-2.5 text-center">واحد</th>
                  <th className="p-2.5 text-left">قیمت واحد (تومان)</th>
                  <th className="p-2.5 text-left">تخفیف (تومان)</th>
                  <th className="p-2.5 text-left">مبلغ کل (تومان)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {inv.items.map((item, index) => (
                  <tr key={index} className="hover:bg-amber-50/50">
                    <td className="p-2.5 text-center font-bold text-stone-500">
                      {formatNumber(index + 1)}
                    </td>
                    <td className="p-2.5 font-bold text-stone-900">{item.productName}</td>
                    <td className="p-2.5 text-center font-bold text-amber-900">
                      {formatNumber(item.quantity)}
                    </td>
                    <td className="p-2.5 text-center text-stone-600">{item.unit}</td>
                    <td className="p-2.5 text-left font-medium">{formatNumber(item.unitPrice)}</td>
                    <td className="p-2.5 text-left text-red-600 font-medium">
                      {item.discount > 0 ? formatNumber(item.discount) : '-'}
                    </td>
                    <td className="p-2.5 text-left font-extrabold text-stone-900">
                      {formatNumber(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Dual Totals */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t-2 border-stone-200">
            <div className="flex-1 space-y-2 text-xs">
              <p className="font-bold text-stone-800">توضیحات و یادداشت فاکتور:</p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 min-h-[60px] italic">
                {inv.notes || 'توضیحات خاصی ثبت نشده است.'}
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs bg-amber-50/50 p-4 rounded-xl border border-amber-200">
              <div className="flex justify-between text-stone-600">
                <span>جمع کل اقلام:</span>
                <span className="font-bold">{formatNumber(inv.subtotal)} تومان</span>
              </div>
              {inv.invoiceDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>تخفیف کلی فاکتور:</span>
                  <span className="font-bold">({formatNumber(inv.invoiceDiscount)}-) تومان</span>
                </div>
              )}
              {inv.shippingCost > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>هزینه حمل و ارسال:</span>
                  <span className="font-bold">{formatNumber(inv.shippingCost)} تومان</span>
                </div>
              )}
              <div className="border-t border-amber-300 my-1 pt-2 flex justify-between text-sm font-black text-amber-950">
                <span>مبلغ قابل پرداخت:</span>
                <span className="text-amber-800">{formatToman(inv.finalTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600 pt-1">
                <span>مبلغ پرداختی:</span>
                <span className="font-bold text-emerald-700">{formatToman(inv.paidAmount)}</span>
              </div>
              {inv.finalTotal - inv.paidAmount > 0 && (
                <div className="flex justify-between text-red-700 font-bold border-t border-red-200 pt-1">
                  <span>باقی‌مانده (بدهی):</span>
                  <span>{formatToman(inv.finalTotal - inv.paidAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stamp & Seal Footer */}
          <div className="flex justify-around items-center pt-8 text-center text-xs text-stone-500 border-t border-dashed border-stone-300">
            <div>
              <p className="font-bold text-stone-800 mb-8">امضای خریدار / تحویل‌گیرنده</p>
              <p className="text-[10px]">........................................</p>
            </div>
            <div className="relative">
              <p className="font-bold text-amber-900 mb-8">مهر و امضای فروشگاه هونیش</p>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-dashed border-amber-500/40 flex items-center justify-center text-[10px] text-amber-800 font-bold rotate-12 bg-amber-100/30">
                عسل هونیش
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ فاکتور / دانلود PDF</span>
            </button>
            <button
              onClick={handleShareSMS}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] text-amber-900 dark:text-amber-300 font-bold text-xs sm:text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>ارسال پیامک فاکتور</span>
            </button>
          </div>

          <button
            onClick={() => setActiveReceiptInvoice(null)}
            className="px-5 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs sm:text-sm hover:opacity-80 transition-all cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </Modal>
  );
};
