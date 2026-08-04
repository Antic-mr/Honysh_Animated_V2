import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/common/ToastContainer';
import { InvoiceReceiptModal } from './components/invoices/InvoiceReceiptModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { ContactsView } from './components/contacts/ContactsView';
import { SalesInvoiceView } from './components/invoices/SalesInvoiceView';
import { PurchaseInvoiceView } from './components/invoices/PurchaseInvoiceView';
import { ProductsView } from './components/products/ProductsView';
import { AccountingView } from './components/accounting/AccountingView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { ReportsView } from './components/reports/ReportsView';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex bg-[#FAF6EE] dark:bg-[#1A120C] text-[#2D1F17] dark:text-[#F5EBE1] transition-colors duration-300 antialiased selection:bg-amber-500 selection:text-stone-950">
      {/* Right Sidebar for Desktop RTL Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 lg:pb-8">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'contacts' && <ContactsView />}
          {activeTab === 'sales-invoices' && <SalesInvoiceView />}
          {activeTab === 'purchase-invoices' && <PurchaseInvoiceView />}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'accounting' && <AccountingView />}
          {activeTab === 'attendance' && <AttendanceView />}
          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Bottom Nav Bar for Mobile */}
      <MobileNav />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Printable Invoice Receipt Modal */}
      <InvoiceReceiptModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
