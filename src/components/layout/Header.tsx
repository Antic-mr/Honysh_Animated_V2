import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sun,
  Moon,
  Search,
  PlusCircle,
  Bell,
  RotateCcw,
  Hexagon,
  Calendar,
  AlertTriangle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { getTodayJalali } from '../../utils/persian';
import { motion, AnimatePresence } from 'motion/react';
import { DebtRemindersModal } from '../reminders/DebtRemindersModal';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    products,
    salesInvoices,
    reminders,
    resetAllData,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);

  // Calculate notifications
  const lowStock = products.filter((p) => p.stock <= p.minStock);
  const creditInvoices = salesInvoices.filter((i) => i.status === 'credit');
  const activeReminders = reminders.filter((r) => r.status !== 'settled');

  const totalNotifs = lowStock.length + creditInvoices.length + activeReminders.length;

  return (
    <header className="sticky top-0 z-20 bg-[#FFFDF8]/90 dark:bg-[#221812]/90 backdrop-blur-md border-b border-[#EFE4D2] dark:border-[#3A2A1E] px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Mobile Logo Brand */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 shadow-md">
            <Hexagon className="w-5 h-5 fill-amber-300 stroke-amber-950 stroke-[1.5]" />
          </div>
          <span className="font-extrabold text-amber-900 dark:text-amber-400 text-lg">
            هونیش
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60 dark:text-amber-300/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی سریع فاکتور، شخص، کالا یا کد..."
            className="w-full pr-10 pl-4 py-2 rounded-xl text-sm bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] text-amber-950 dark:text-amber-100 placeholder:text-amber-800/40 dark:placeholder:text-amber-200/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
          />
        </div>

        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] text-amber-900 dark:text-amber-300">
          <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>امروز: {getTodayJalali()}</span>
        </div>

        {/* Actions Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Invoice Action */}
          <button
            onClick={() => setActiveTab('sales-invoices')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">ثبت فاکتور فروش</span>
            <span className="sm:hidden">فاکتور</span>
          </button>

          {/* Debt & Creditor Reminders Button */}
          <button
            onClick={() => setIsRemindersModalOpen(true)}
            title="مدیریت یادآورهای بدهکاران و بستانکاران"
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/15 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 hover:bg-amber-500/25 transition-all cursor-pointer relative font-extrabold text-xs"
          >
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden md:inline">یادآور بدهی/طلب</span>
            {activeReminders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                {activeReminders.length}
              </span>
            )}
          </button>

          {/* Theme Switcher Toggle (Light Cream ↔ Dark Chocolate) */}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'تغییر به تم شبانه (قهوه‌ای تاریک)' : 'تغییر به تم روزانه (کرم گرم)'}
            className="p-2 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] text-amber-800 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors cursor-pointer relative"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-amber-900" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
          </button>

          {/* Notifications Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] text-amber-800 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors cursor-pointer relative"
            >
              <Bell className="w-5 h-5" />
              {totalNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {totalNotifs}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-2 w-72 sm:w-80 bg-[#FFFDF8] dark:bg-[#251B13] border border-[#EFE4D2] dark:border-[#3D2D21] rounded-2xl shadow-xl p-4 z-50 text-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#EFE4D2] dark:border-[#3D2D21] pb-2 font-bold text-amber-900 dark:text-amber-400">
                    <span>اعلان‌ها و هشدارها</span>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
                      {totalNotifs} مورد
                    </span>
                  </div>

                  {totalNotifs === 0 ? (
                    <p className="text-stone-500 text-center py-4">
                      هیچ اعلان جدیدی وجود ندارد.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {lowStock.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setActiveTab('products');
                            setShowNotifications(false);
                          }}
                          className="flex items-start gap-2 p-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-900/50 cursor-pointer hover:opacity-90"
                        >
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">{p.name}</p>
                            <p className="text-[11px] opacity-80">
                              موجودی رو به اتمام: {p.stock} {p.unit} (حداقل: {p.minStock})
                            </p>
                          </div>
                        </div>
                      ))}

                      {creditInvoices.map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => {
                            setActiveTab('sales-invoices');
                            setShowNotifications(false);
                          }}
                          className="flex items-start gap-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/50 cursor-pointer hover:opacity-90"
                        >
                          <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">فاکتور نسیه {inv.number}</p>
                            <p className="text-[11px] opacity-80">
                              مشتری: {inv.contactName} - سررسید: {inv.dueDate || 'مشخص نشده'}
                            </p>
                          </div>
                        </div>
                      ))}
                      {activeReminders.map((rem) => (
                        <div
                          key={rem.id}
                          onClick={() => {
                            setShowNotifications(false);
                            setIsRemindersModalOpen(true);
                          }}
                          className="flex items-start gap-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-900/50 cursor-pointer hover:opacity-90"
                        >
                          <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">{rem.type === 'debtor' ? '🔴 طلب ما' : '🔵 بدهی ما'}: {rem.contactName}</p>
                            <p className="text-[11px] opacity-80">
                              سررسید: {rem.dueDate} ({rem.title})
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm('آیا مایلید تمام داده‌ها به حالت پیش‌فرض اولیه بازگردند؟')) {
                resetAllData();
              }
            }}
            title="بازنشانی داده‌های دمو"
            className="p-2 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] text-amber-800 dark:text-amber-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Debt & Creditor Reminders Modal */}
      <DebtRemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
      />
    </header>
  );
};
