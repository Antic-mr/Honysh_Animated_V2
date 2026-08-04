import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contact, ContactType } from '../../types';
import { formatToman, toPersianDigits } from '../../utils/persian';
import { Modal } from '../common/Modal';
import { DebtRemindersModal } from '../reminders/DebtRemindersModal';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  FileText,
  Edit,
  Trash2,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Bell,
} from 'lucide-react';

export const ContactsView: React.FC = () => {
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    salesInvoices,
    purchaseInvoices,
    reminders,
    setActiveReceiptInvoice,
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [historyContact, setHistoryContact] = useState<Contact | null>(null);

  // Reminders Modal
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [selectedContactForReminder, setSelectedContactForReminder] = useState<Contact | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    nationalCode: '',
    type: 'customer' as ContactType,
    balance: 0,
    address: '',
    notes: '',
  });

  const handleOpenAddModal = () => {
    setEditingContact(null);
    setFormData({
      code: `PER-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      phone: '',
      nationalCode: '',
      type: 'customer',
      balance: 0,
      address: '',
      notes: '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (c: Contact) => {
    setEditingContact(c);
    setFormData({
      code: c.code,
      name: c.name,
      phone: c.phone,
      nationalCode: c.nationalCode || '',
      type: c.type,
      balance: c.balance,
      address: c.address || '',
      notes: c.notes || '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    if (editingContact) {
      updateContact({
        ...editingContact,
        code: formData.code,
        name: formData.name,
        phone: formData.phone,
        nationalCode: formData.nationalCode,
        type: formData.type,
        balance: Number(formData.balance),
        address: formData.address,
        notes: formData.notes,
      });
    } else {
      addContact({
        code: formData.code,
        name: formData.name,
        phone: formData.phone,
        nationalCode: formData.nationalCode,
        type: formData.type,
        balance: Number(formData.balance),
        address: formData.address,
        notes: formData.notes,
      });
    }
    setIsAddEditModalOpen(false);
  };

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.includes(searchTerm) ||
      c.phone.includes(searchTerm) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'customer') return c.type === 'customer' || c.type === 'both';
    if (filterType === 'supplier') return c.type === 'supplier' || c.type === 'both';
    if (filterType === 'debtors') return c.balance > 0;
    if (filterType === 'creditors') return c.balance < 0;

    return true;
  });

  // Calculate history for selected contact
  const contactSalesInvoices = historyContact
    ? salesInvoices.filter((i) => i.contactId === historyContact.id)
    : [];
  const contactPurchaseInvoices = historyContact
    ? purchaseInvoices.filter((i) => i.contactId === historyContact.id)
    : [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm">
        <div>
          <h2 className="text-xl font-black text-amber-950 dark:text-amber-400 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-600" />
            اشخاص، مشتریان و تامین‌کنندگان
          </h2>
          <p className="text-xs text-amber-800/60 dark:text-amber-200/60 mt-0.5">
            دفتر حساب طرف‌های تجاری فروشگاه عسل و زنبورداری
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>ثبت شخص جدید</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FFFDF8] dark:bg-[#251B13] p-4 rounded-2xl border border-[#EFE4D2] dark:border-[#3D2D21]">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی نام، تلفن یا کد..."
            className="w-full pr-9 pl-3 py-2 rounded-xl text-xs bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E] text-amber-950 dark:text-amber-100 placeholder:text-amber-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'همه اشخاص' },
            { id: 'customer', label: 'مشتریان' },
            { id: 'supplier', label: 'تامین‌کنندگان (زنبورداران)' },
            { id: 'debtors', label: 'بدهکاران به ما' },
            { id: 'creditors', label: 'بستانکاران' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-[#FAF6EE] dark:bg-[#1A120C] text-amber-900/80 dark:text-amber-200/70 hover:bg-amber-100/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-2xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm hover-lift space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-[#EFE4D2] dark:border-[#3D2D21] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200">
                      {contact.code}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-500">
                      {contact.type === 'customer'
                        ? 'مشتری'
                        : contact.type === 'supplier'
                        ? 'تامین‌کننده'
                        : 'مشتری و تامین‌کننده'}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-amber-950 dark:text-amber-300 mt-1">
                    {contact.name}
                  </h3>
                </div>

                {/* Balance Status Badge */}
                <div className="text-left">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold block text-center ${
                      contact.balance > 0
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        : contact.balance < 0
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {contact.balance > 0
                      ? 'بدهکار به ما'
                      : contact.balance < 0
                      ? 'طلبکار از ما'
                      : 'بی‌حساب'}
                  </span>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-1.5 text-xs text-amber-900/80 dark:text-amber-200/80">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{toPersianDigits(contact.phone)}</span>
                </div>
                {contact.nationalCode && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>کد ملی/اقتصادی: {toPersianDigits(contact.nationalCode)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between font-bold pt-1 border-t border-dashed border-[#EFE4D2] dark:border-[#3D2D21]">
                  <span>تراز حساب جاری:</span>
                  <span
                    className={
                      contact.balance > 0
                        ? 'text-red-600 dark:text-red-400'
                        : contact.balance < 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-stone-600'
                    }
                  >
                    {formatToman(Math.abs(contact.balance))}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#EFE4D2] dark:border-[#3D2D21]">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setHistoryContact(contact)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800 text-[11px] font-bold transition-all cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>سابقه</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedContactForReminder(contact);
                    setIsRemindersModalOpen(true);
                  }}
                  title="مدیریت یادآور و سررسید بدهی/طلب این شخص"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-950 dark:text-amber-200 hover:bg-amber-500/30 text-[11px] font-bold transition-all cursor-pointer border border-amber-300 dark:border-amber-800"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>یادآور سررسید</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(contact)}
                  className="p-1.5 rounded-lg text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                  title="ویرایش"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`آیا از حذف شخص ${contact.name} اطمینان دارید؟`)) {
                      deleteContact(contact.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Contact Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingContact ? `ویرایش اطلاعات ${editingContact.name}` : 'افزودن شخص جدید'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                کد اختصاصی شخص
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                نام و نام خانوادگی / شرکت *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: حاج محمد رضایی"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                شماره همراه *
              </label>
              <input
                type="text"
                required
                placeholder="09121112233"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                کد ملی / شناسه ملی
              </label>
              <input
                type="text"
                placeholder="0012345678"
                value={formData.nationalCode}
                onChange={(e) => setFormData({ ...formData, nationalCode: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                نوع طرف حساب
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ContactType })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
              >
                <option value="customer">مشتری خریدار</option>
                <option value="supplier">تامین‌کننده (زنبوردار/فروشنده)</option>
                <option value="both">دو جانبه (مشتری و تامین‌کننده)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                مانده اولیه حساب (تومان)
              </label>
              <input
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
                placeholder="مثبت = بدهکار به ما، منفی = طلبکار"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
              آدرس
            </label>
            <input
              type="text"
              placeholder="استان، شهر، خیابان..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
            />
          </div>

          <div>
            <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
              یادداشت و توضیحات
            </label>
            <textarea
              rows={2}
              placeholder="توضیحات تکمیلی..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EFE4D2] dark:border-[#3D2D21]">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 font-bold"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold shadow-md"
            >
              ذخیره اطلاعات
            </button>
          </div>
        </form>
      </Modal>

      {/* Transaction History Drawer Modal */}
      {historyContact && (
        <Modal
          isOpen={!!historyContact}
          onClose={() => setHistoryContact(null)}
          title={`تاریخچه معاملات «${historyContact.name}»`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Summary Header */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between font-bold">
              <span>مانده فعلی حساب:</span>
              <span
                className={
                  historyContact.balance > 0
                    ? 'text-red-600 dark:text-red-400 font-black text-sm'
                    : 'text-emerald-600 dark:text-emerald-400 font-black text-sm'
                }
              >
                {formatToman(Math.abs(historyContact.balance))}{' '}
                {historyContact.balance > 0 ? '(بدهکار به ما)' : '(طلبکار از ما)'}
              </span>
            </div>

            {/* Invoices List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              <h4 className="font-bold text-amber-900 dark:text-amber-300">
                فاکتورهای ثبت شده:
              </h4>

              {contactSalesInvoices.length === 0 && contactPurchaseInvoices.length === 0 ? (
                <p className="text-stone-500 py-4 text-center">
                  هیچ سابقه فاکتوری برای این شخص ثبت نشده است.
                </p>
              ) : (
                <>
                  {contactSalesInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => {
                        setActiveReceiptInvoice(inv);
                        setHistoryContact(null);
                      }}
                      className="p-3 bg-[#FAF6EE] dark:bg-[#1A120C] rounded-xl border border-[#EFE4D2] dark:border-[#3A2A1E] flex items-center justify-between cursor-pointer hover:bg-amber-100/50"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold text-amber-950 dark:text-amber-200">
                            فاکتور فروش {inv.number}
                          </p>
                          <p className="text-[11px] text-stone-500">تاریخ: {inv.date}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-extrabold text-amber-900 dark:text-amber-300">
                          {formatToman(inv.finalTotal)}
                        </p>
                        <span className="text-[10px] text-amber-700">کلیک برای مشاهده فاکتور</span>
                      </div>
                    </div>
                  ))}

                  {contactPurchaseInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => {
                        setActiveReceiptInvoice(inv);
                        setHistoryContact(null);
                      }}
                      className="p-3 bg-[#FAF6EE] dark:bg-[#1A120C] rounded-xl border border-[#EFE4D2] dark:border-[#3A2A1E] flex items-center justify-between cursor-pointer hover:bg-amber-100/50"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowDownLeft className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-bold text-amber-950 dark:text-amber-200">
                            فاکتور خرید {inv.number}
                          </p>
                          <p className="text-[11px] text-stone-500">تاریخ: {inv.date}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-extrabold text-amber-900 dark:text-amber-300">
                          {formatToman(inv.finalTotal)}
                        </p>
                        <span className="text-[10px] text-amber-700">کلیک برای مشاهده فاکتور</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Debt & Creditor Reminders Modal */}
      <DebtRemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => {
          setIsRemindersModalOpen(false);
          setSelectedContactForReminder(null);
        }}
        initialContact={selectedContactForReminder || undefined}
      />
    </div>
  );
};
