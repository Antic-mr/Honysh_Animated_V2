import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatToman, formatNumber } from '../../utils/persian';
import {
  TrendingUp,
  FileSpreadsheet,
  PackageCheck,
  Users,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  Eye,
  ShoppingBag,
  Bell,
  Clock,
  MessageSquare,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { motion } from 'motion/react';
import { DebtRemindersModal } from '../reminders/DebtRemindersModal';

export const DashboardView: React.FC = () => {
  const {
    products,
    contacts,
    salesInvoices,
    reminders,
    settleReminder,
    setActiveTab,
    setActiveReceiptInvoice,
  } = useApp();

  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const activeReminders = reminders.filter((r) => r.status !== 'settled');

  // Metrics calculation
  const totalSalesToday = salesInvoices.reduce((acc, inv) => acc + inv.finalTotal, 0);
  const totalInvoicesToday = salesInvoices.length;

  // Honey total weight in kg (products in 'عسل تک‌گل' and 'عسل چندگل')
  const totalHoneyKg = products
    .filter((p) => p.unit === 'کیلوگرم')
    .reduce((acc, p) => acc + p.stock, 0);

  // Total Receivables from customers (positive balance)
  const totalReceivables = contacts
    .filter((c) => c.balance > 0)
    .reduce((acc, c) => acc + c.balance, 0);

  // Low stock products
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  // Sample weekly sales chart data
  const chartData = [
    { day: 'شنبه', sales: 8500000 },
    { day: 'یکشنبه', sales: 12200000 },
    { day: 'دوشنبه', sales: 9800000 },
    { day: 'سه‌شنبه', sales: 14500000 },
    { day: 'چهارشنبه', sales: 18000000 },
    { day: 'پنجشنبه', sales: 22400000 },
    { day: 'جمعه', sales: 16200000 },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Banner & Quick Shortcuts */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-xl text-center md:text-right">
          <span className="px-3 py-1 bg-stone-950/20 rounded-full text-xs font-black tracking-wide inline-block">
            سامانه آنلاین مدیریت فروشگاه هونیش
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            خوش‌آمدید به نرم‌افزار کسب‌وکار عسل هونیش
          </h2>
          <p className="text-xs sm:text-sm font-medium text-stone-900/80 leading-relaxed">
            مدیریت کامل انبار عسل، حسابداری صندوق و بانک، فاکتورهای فروش و ارتباط با زنبورداران در یک نگاه.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setActiveTab('sales-invoices')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-stone-950 hover:bg-stone-900 text-amber-400 font-bold text-xs sm:text-sm shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ثبت فاکتور جدید</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-stone-900/10 hover:bg-stone-900/20 text-stone-950 font-bold text-xs sm:text-sm border border-stone-950/20 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>انبار کالا</span>
          </button>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Yellow Alert Badge Banner when products hit threshold */}
      {lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-400 dark:bg-yellow-500 text-stone-950 p-4 rounded-2xl shadow-md border border-yellow-500/80 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-950 text-yellow-400 rounded-xl font-black shrink-0">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-stone-950 text-yellow-300 text-[11px] font-black">
                  ⚠️ نشان هشدار زرد - آستانه موجودی کم
                </span>
                <span className="text-xs font-bold text-stone-900 hidden sm:inline">
                  موجودی به آستانه بحرانی رسید
                </span>
              </div>
              <h4 className="font-extrabold text-xs sm:text-sm text-stone-950 mt-1">
                تعداد {formatNumber(lowStockProducts.length)} کالا به آستانه (Threshold) «موجودی کم» تعیین‌شده رسیده‌اند!
              </h4>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('products')}
            className="px-4 py-2 bg-stone-950 text-yellow-300 hover:bg-stone-900 rounded-xl text-xs font-bold shadow-sm shrink-0 cursor-pointer transition-all"
          >
            مشاهده و تنظیم آستانه کالاها »
          </button>
        </motion.div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Card */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-2xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm hover-lift space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800/70 dark:text-amber-200/70">
              مجموع فروش امروز
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-300">
              {formatToman(totalSalesToday)}
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>۱۲٪ افزایش نسبت به دیروز</span>
            </div>
          </div>
        </motion.div>

        {/* Invoices Count Card */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-2xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm hover-lift space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800/70 dark:text-amber-200/70">
              تعداد فاکتور امروز
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-300">
              {formatNumber(totalInvoicesToday)} فاکتور
            </div>
            <p className="text-xs text-amber-800/60 dark:text-amber-200/60">
              ثبت موفق در سیستم
            </p>
          </div>
        </motion.div>

        {/* Honey Inventory Total Weight */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-2xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm hover-lift space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800/70 dark:text-amber-200/70">
              موجودی کل عسل در انبار
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-300">
              {formatNumber(totalHoneyKg)} کیلوگرم
            </div>
            <p className="text-xs text-amber-800/60 dark:text-amber-200/60">
              انواع عسل تک‌گل و چندگل
            </p>
          </div>
        </motion.div>

        {/* Receivables Card */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-2xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm hover-lift space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800/70 dark:text-amber-200/70">
              کل طلب از مشتریان (مطالبات)
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400">
              {formatToman(totalReceivables)}
            </div>
            <p className="text-xs text-amber-800/60 dark:text-amber-200/60">
              مانده بدهی مشتریان نسیه
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Chart + Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column (2 cols) */}
        <div className="lg:col-span-2 bg-[#FFFDF8] dark:bg-[#251B13] p-6 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFE4D2] dark:border-[#3D2D21] pb-4">
            <div>
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-400">
                نمودار روند فروش هفته اخیر
              </h3>
              <p className="text-xs text-amber-800/60 dark:text-amber-200/60">
                میزان فروش روزانه به تومان
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
              ۷ روز گذشته
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE4D2" opacity={0.4} />
                <XAxis dataKey="day" stroke="#B45309" fontSize={11} />
                <YAxis
                  stroke="#B45309"
                  fontSize={10}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip
                  formatter={(value: any) => [formatToman(Number(value)), 'مبلغ فروش']}
                  contentStyle={{
                    backgroundColor: '#1A120C',
                    borderColor: '#3D2D21',
                    borderRadius: '12px',
                    color: '#F5EBE1',
                    direction: 'rtl',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#D97706"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#amberGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Warning Box */}
        <div className="bg-[#FFFDF8] dark:bg-[#251B13] p-6 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#EFE4D2] dark:border-[#3D2D21] pb-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 animate-bounce" />
                <h3>هشدار رسیدن به آستانه موجودی</h3>
              </div>
              {lowStockProducts.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-stone-950 text-[11px] font-black border border-yellow-500">
                  {formatNumber(lowStockProducts.length)} کالا
                </span>
              )}
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">
                تمام کالاهای انبار در وضعیت بالاتر از آستانه موجودی کم قرار دارند.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 rounded-2xl bg-yellow-500/15 dark:bg-yellow-500/10 border border-yellow-400/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-extrabold text-amber-950 dark:text-amber-100">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-stone-700 dark:text-stone-300 mt-0.5">
                        موجودی: <span className="font-bold text-red-600 dark:text-red-400">{formatNumber(product.stock)} {product.unit}</span> (آستانه: <span className="font-bold">{formatNumber(product.minStock)} {product.unit}</span>)
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-yellow-400 text-stone-950 rounded-lg text-[10px] font-black shrink-0 border border-yellow-500 shadow-xs">
                      ⚠️ نشان هشدار
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('purchase-invoices')}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer text-center"
          >
            ثبت فاکتور خرید جدید جهت شارژ انبار
          </button>
        </div>
      </div>

      {/* Debtors & Creditors Reminders Section */}
      <div className="bg-[#FFFDF8] dark:bg-[#251B13] p-6 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#EFE4D2] dark:border-[#3D2D21] pb-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 text-stone-950 rounded-xl font-bold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-amber-950 dark:text-amber-100 flex items-center gap-2">
                یادآور سررسید بدهکاران و بستانکاران
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800">
                  {formatNumber(activeReminders.length)} سررسید فعال
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                پیگیری هوشمند مطالبات مشتریان بدهکار و سررسید پرداختی تامین‌کنندگان
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRemindersModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>مدیریت کامل و ارسال پیامک »</span>
          </button>
        </div>

        {activeReminders.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-6">
            هیچ یادآور بدهکاری یا بستانکاری در حال حاضر فعال نیست.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeReminders.slice(0, 4).map((rem) => {
              const isDebtor = rem.type === 'debtor';
              return (
                <div
                  key={rem.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all ${
                    isDebtor
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50'
                      : 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                        isDebtor
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}
                    >
                      {isDebtor ? '🔴 طلب ما (مشتری)' : '🔵 بدهی ما (تامین‌کننده)'}
                    </span>
                    <span className="text-[11px] font-bold text-stone-500">
                      {rem.dueDate}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-amber-950 dark:text-amber-100 line-clamp-1">
                      {rem.contactName}
                    </h4>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5 line-clamp-1">
                      {rem.title}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <span className="font-black text-sm text-amber-950 dark:text-amber-100">
                      {formatToman(rem.amount)}
                    </span>
                    <button
                      onClick={() => setIsRemindersModalOpen(true)}
                      className="px-2.5 py-1 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-lg text-[10px] font-bold cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      پیگیری / پیامک
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-[#FFFDF8] dark:bg-[#251B13] p-6 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFE4D2] dark:border-[#3D2D21] pb-4">
          <div>
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-400">
              آخرین فاکتورهای فروش
            </h3>
            <p className="text-xs text-amber-800/60 dark:text-amber-200/60">
              لیست تراکنش‌های اخیر مشتریان
            </p>
          </div>
          <button
            onClick={() => setActiveTab('sales-invoices')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            مشاهده همه فاکتورها »
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF6EE] dark:bg-[#1A120C] text-amber-900 dark:text-amber-300 font-bold border-b border-[#EFE4D2] dark:border-[#3A2A1E]">
                <th className="p-3">شماره فاکتور</th>
                <th className="p-3">نام مشتری</th>
                <th className="p-3">تاریخ</th>
                <th className="p-3">مبلغ کل</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4D2] dark:divide-[#3A2A1E]">
              {salesInvoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-amber-50/40 dark:hover:bg-amber-900/10">
                  <td className="p-3 font-bold text-amber-950 dark:text-amber-200">
                    {inv.number}
                  </td>
                  <td className="p-3 font-semibold text-stone-900 dark:text-stone-100">
                    {inv.contactName}
                  </td>
                  <td className="p-3 text-stone-600 dark:text-stone-400">{inv.date}</td>
                  <td className="p-3 font-extrabold text-amber-900 dark:text-amber-300">
                    {formatToman(inv.finalTotal)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {inv.status === 'paid' ? 'پرداخت شده' : 'نسیه (سررسیددار)'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setActiveReceiptInvoice(inv)}
                      className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors cursor-pointer"
                      title="مشاهده و چاپ فاکتور"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DebtRemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
      />
    </div>
  );
};
