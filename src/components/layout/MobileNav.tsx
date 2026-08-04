import React from 'react';
import { useApp } from '../../context/AppContext';
import { TabType } from '../../types';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  PackageCheck,
  Wallet,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'sales-invoices', label: 'فاکتورها', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { id: 'contacts', label: 'اشخاص', icon: <Users className="w-5 h-5" /> },
    { id: 'products', label: 'انبار', icon: <PackageCheck className="w-5 h-5" /> },
    { id: 'accounting', label: 'مالی', icon: <Wallet className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FFFDF8]/95 dark:bg-[#221812]/95 backdrop-blur-lg border-t border-[#EFE4D2] dark:border-[#3A2A1E] px-2 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-amber-600 dark:text-amber-400 font-bold scale-105'
                : 'text-amber-900/60 dark:text-amber-200/50'
            }`}
          >
            {item.icon}
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
