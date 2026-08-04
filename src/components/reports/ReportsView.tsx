import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatToman, formatNumber } from '../../utils/persian';
import {
  BarChart3,
  Calendar,
  Award,
  Users,
  Printer,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { salesInvoices, products, contacts } = useApp();
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'season'>('month');

  // Total sales revenue
  const totalSalesRevenue = salesInvoices.reduce((acc, inv) => acc + inv.finalTotal, 0);

  // Top products sales calculation
  const productSalesMap: { [pName: string]: number } = {};
  salesInvoices.forEach((inv) => {
    inv.items.forEach((item) => {
      productSalesMap[item.productName] =
        (productSalesMap[item.productName] || 0) + item.quantity;
    });
  });

  const topProductsChartData = Object.keys(productSalesMap).map((pName) => ({
    name: pName.length > 18 ? pName.substring(0, 18) + '...' : pName,
    qty: productSalesMap[pName],
  }));

  // Debtors & Creditors
  const debtors = contacts.filter((c) => c.balance > 0);
  const creditors = contacts.filter((c) => c.balance < 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm">
        <div>
          <h2 className="text-xl font-black text-amber-950 dark:text-amber-400 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-600" />
            گزارشات تحلیلی و مدیریتی فروشگاه
          </h2>
          <p className="text-xs text-amber-800/60 dark:text-amber-200/60 mt-0.5">
            تحلیل پرفروش‌ترین عسل‌ها، وضعیت مطالبات مشتریان و سود عملکردی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#FAF6EE] dark:bg-[#1A120C] p-1.5 rounded-2xl border border-[#EFE4D2] text-xs font-bold">
            <button
              onClick={() => setDateRange('week')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                dateRange === 'week' ? 'bg-amber-500 text-stone-950' : 'text-stone-600'
              }`}
            >
              هفتگی
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                dateRange === 'month' ? 'bg-amber-500 text-stone-950' : 'text-stone-600'
              }`}
            >
              ماهانه
            </button>
            <button
              onClick={() => setDateRange('season')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                dateRange === 'season' ? 'bg-amber-500 text-stone-950' : 'text-stone-600'
              }`}
            >
              فصلی
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ گزارش جامع</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-2xl border border-[#EFE4D2] dark:border-[#3D2D21] space-y-2">
          <span className="text-xs font-bold text-amber-800/70">کل فروش ثبت شده</span>
          <div className="text-2xl font-black text-amber-950 dark:text-amber-300">
            {formatToman(totalSalesRevenue)}
          </div>
          <p className="text-[11px] text-stone-500">حاصل مجموع فاکتورهای صادره</p>
        </div>

        <div className="bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-2xl border border-[#EFE4D2] dark:border-[#3D2D21] space-y-2">
          <span className="text-xs font-bold text-amber-800/70">تعداد مشتریان بدهکار</span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400">
            {formatNumber(debtors.length)} نفر
          </div>
          <p className="text-[11px] text-stone-500">
            مجموع مطالبات: {formatToman(debtors.reduce((a, b) => a + b.balance, 0))}
          </p>
        </div>

        <div className="bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-2xl border border-[#EFE4D2] dark:border-[#3D2D21] space-y-2">
          <span className="text-xs font-bold text-amber-800/70">تولیدات و تنوع انبار</span>
          <div className="text-2xl font-black text-amber-950 dark:text-amber-300">
            {formatNumber(products.length)} عنوان محصول
          </div>
          <p className="text-[11px] text-stone-500">آماده عرضه و توزیع</p>
        </div>
      </div>

      {/* Top Selling Products Recharts Bar Chart */}
      <div className="bg-[#FFFDF8] dark:bg-[#251B13] p-6 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFE4D2] pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-950 dark:text-amber-300 text-base">
              رتبه‌بندی پرفروش‌ترین عسل‌ها (بر اساس کیلوگرم)
            </h3>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProductsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFE4D2" opacity={0.4} />
              <XAxis dataKey="name" stroke="#B45309" fontSize={10} />
              <YAxis stroke="#B45309" fontSize={10} />
              <Tooltip
                formatter={(val: any) => [`${formatNumber(val)} کیلوگرم`, 'مقدار فروش']}
                contentStyle={{
                  backgroundColor: '#1A120C',
                  borderColor: '#3D2D21',
                  borderRadius: '12px',
                  color: '#F5EBE1',
                  direction: 'rtl',
                }}
              />
              <Bar dataKey="qty" fill="#D97706" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Receivables & Debts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Debtors to us */}
        <div className="bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm space-y-3">
          <h4 className="font-bold text-red-600 dark:text-red-400 text-sm border-b border-[#EFE4D2] pb-2">
            لیست مطالبات از مشتریان (بدهکاران به ما):
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
            {debtors.map((d) => (
              <div
                key={d.id}
                className="p-3 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-stone-900 dark:text-stone-100">{d.name}</p>
                  <p className="text-[11px] text-stone-500">تلفن: {d.phone}</p>
                </div>
                <span className="font-black text-red-600 dark:text-red-400">
                  {formatToman(d.balance)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Creditors */}
        <div className="bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm space-y-3">
          <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm border-b border-[#EFE4D2] pb-2">
            لیست بدهی‌های ما به تامین‌کنندگان (زنبورداران):
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
            {creditors.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/40 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-stone-900 dark:text-stone-100">{c.name}</p>
                  <p className="text-[11px] text-stone-500">تلفن: {c.phone}</p>
                </div>
                <span className="font-black text-emerald-700 dark:text-emerald-400">
                  {formatToman(Math.abs(c.balance))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
