import React from 'react';
import { useApp } from '../../context/AppContext';
import { TabType } from '../../types';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  ShoppingBag,
  PackageCheck,
  Wallet,
  Clock,
  BarChart3,
  Hexagon,
  ChevronLeft,
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarItemProps {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon,
  badge,
  badgeColor = 'bg-amber-500 text-stone-950',
  active,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
          : 'text-amber-900/80 dark:text-amber-100/70 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:text-amber-950 dark:hover:text-amber-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`${active ? 'text-stone-950' : 'text-amber-600 dark:text-amber-400'}`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>

      {badge !== undefined && badge !== 0 && (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            active ? 'bg-stone-950 text-amber-400' : badgeColor
          }`}
        >
          {badge}
        </span>
      )}

      {active && (
        <motion.div
          layoutId="sidebarActiveIndicator"
          className="absolute right-0 top-2 bottom-2 w-1.5 bg-amber-700 dark:bg-amber-300 rounded-l-full"
        />
      )}
    </button>
  );
};

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, products, salesInvoices } = useApp();

  // Low stock count for badge
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  // Credit invoices count
  const pendingSalesCount = salesInvoices.filter((i) => i.status === 'credit').length;

  const menuItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number | string; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'داشبورد اصلی',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'contacts',
      label: 'اشخاص و مشتریان',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'sales-invoices',
      label: 'فاکتورهای فروش',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      badge: pendingSalesCount > 0 ? pendingSalesCount : undefined,
      badgeColor: 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100',
    },
    {
      id: 'purchase-invoices',
      label: 'فاکتورهای خرید',
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      id: 'products',
      label: 'محصولات و انبار',
      icon: <PackageCheck className="w-5 h-5" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    {
      id: 'accounting',
      label: 'حسابداری و بانک',
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      id: 'attendance',
      label: 'حضور و غیاب پرسنل',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: 'گزارشات مدیریتی',
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-[#FFFDF8] dark:bg-[#221812] border-l border-[#EFE4D2] dark:border-[#3A2A1E] p-4 justify-between z-30 transition-colors">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-[#EFE4D2] dark:border-[#3A2A1E] pb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20">
            <Hexagon className="w-6 h-6 fill-amber-300 stroke-amber-950 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-amber-900 dark:text-amber-400 tracking-tight">
              فروشگاه هونیش
            </h1>
            <p className="text-xs text-amber-800/70 dark:text-amber-200/60 font-medium">
              سیستم مدیریت عسل و زنبورداری
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              badge={item.badge}
              badgeColor={item.badgeColor}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="bg-[#FAF6EE] dark:bg-[#1A120C] p-3.5 rounded-2xl border border-[#EFE4D2] dark:border-[#3A2A1E] text-xs space-y-1 text-center">
        <div className="flex items-center justify-between text-amber-900/80 dark:text-amber-200/80 font-bold">
          <span>نسخه نرم‌افزار:</span>
          <span className="text-amber-600 dark:text-amber-400">v2.4 پرو</span>
        </div>
        <p className="text-amber-800/60 dark:text-amber-300/50 text-[11px]">
          پشتیبانی آنلاین: فعال
        </p>
      </div>
    </aside>
  );
};
