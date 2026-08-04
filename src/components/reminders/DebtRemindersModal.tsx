import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  X,
  Plus,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  Trash2,
  Edit3,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
  PhoneCall,
  Check,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DebtReminder, ReminderType, ReminderStatus, Contact } from '../../types';
import { formatNumber, formatToman, getTodayJalali } from '../../utils/persian';

interface DebtRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTypeFilter?: 'all' | 'debtor' | 'creditor';
  initialContact?: Contact;
}

export const DebtRemindersModal: React.FC<DebtRemindersModalProps> = ({
  isOpen,
  onClose,
  defaultTypeFilter = 'all',
  initialContact,
}) => {
  const {
    reminders,
    contacts,
    addReminder,
    updateReminder,
    deleteReminder,
    settleReminder,
    markAsReminded,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'debtor' | 'creditor' | 'overdue' | 'settled'>(
    defaultTypeFilter
  );
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<DebtReminder | null>(null);

  // SMS / Message Drawer State
  const [smsModalReminder, setSmsModalReminder] = useState<DebtReminder | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    contactId: '',
    type: 'debtor' as ReminderType,
    amount: 0,
    dueDate: getTodayJalali(),
    title: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen && initialContact) {
      setFormData({
        contactId: initialContact.id,
        type: initialContact.balance < 0 ? 'creditor' : 'debtor',
        amount: Math.abs(initialContact.balance),
        dueDate: getTodayJalali(),
        title: `پیگیری سررسید ${initialContact.name}`,
        notes: `کد طرف حساب: ${initialContact.code} - شماره تماس: ${initialContact.phone}`,
      });
      setShowAddModal(true);
    }
  }, [isOpen, initialContact]);

  if (!isOpen) return null;

  // Filtered Reminders
  const filteredReminders = reminders.filter((rem) => {
    const matchesSearch =
      rem.contactName.includes(search) ||
      rem.title.includes(search) ||
      (rem.notes && rem.notes.includes(search));

    if (!matchesSearch) return false;

    if (activeTab === 'debtor') return rem.type === 'debtor' && rem.status !== 'settled';
    if (activeTab === 'creditor') return rem.type === 'creditor' && rem.status !== 'settled';
    if (activeTab === 'settled') return rem.status === 'settled';
    if (activeTab === 'overdue') {
      return rem.status !== 'settled'; // All active pending/reminded
    }
    return true;
  });

  // KPI Statistics
  const pendingDebtors = reminders.filter((r) => r.type === 'debtor' && r.status !== 'settled');
  const pendingCreditors = reminders.filter((r) => r.type === 'creditor' && r.status !== 'settled');
  const totalDebtorAmount = pendingDebtors.reduce((sum, r) => sum + r.amount, 0);
  const totalCreditorAmount = pendingCreditors.reduce((sum, r) => sum + r.amount, 0);

  const handleOpenAdd = () => {
    const firstContact = contacts[0];
    setFormData({
      contactId: firstContact ? firstContact.id : '',
      type: 'debtor',
      amount: firstContact ? Math.abs(firstContact.balance) : 0,
      dueDate: getTodayJalali(),
      title: 'تسویه سررسید بدهی / طلب',
      notes: '',
    });
    setEditingReminder(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (rem: DebtReminder) => {
    setEditingReminder(rem);
    setFormData({
      contactId: rem.contactId,
      type: rem.type,
      amount: rem.amount,
      dueDate: rem.dueDate,
      title: rem.title,
      notes: rem.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contactId) {
      showToast('لطفا طرف حساب را انتخاب کنید.', 'error');
      return;
    }
    if (formData.amount <= 0) {
      showToast('لطفا مبلغ معتبر وارد کنید.', 'error');
      return;
    }

    const contact = contacts.find((c) => c.id === formData.contactId);
    const contactName = contact ? contact.name : 'طرف حساب';
    const contactPhone = contact ? contact.phone : '';

    if (editingReminder) {
      updateReminder({
        ...editingReminder,
        contactId: formData.contactId,
        contactName,
        contactPhone,
        type: formData.type,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        title: formData.title,
        notes: formData.notes,
      });
    } else {
      addReminder({
        contactId: formData.contactId,
        contactName,
        contactPhone,
        type: formData.type,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        title: formData.title,
        notes: formData.notes,
      });
    }

    setShowAddModal(false);
  };

  const handleOpenSmsModal = (rem: DebtReminder) => {
    setSmsModalReminder(rem);
    const isDebtor = rem.type === 'debtor';
    const template = isDebtor
      ? `جناب آقای/خانم ${rem.contactName} عزیز،
با سلام و احترام،
به استحضار می‌رساند موعد تسویه حساب مبلغ ${formatNumber(rem.amount)} تومان بابت «${rem.title}» در تاریخ ${rem.dueDate} سررسید شده است.
خواهشمند است جهت واریز یا هماهنگی اقدام فرمایید.
با سپاس، فروشگاه عسل هونیش`
      : `جناب آقای/خانم ${rem.contactName} عزیز،
با سلام و احترام،
پیامک جهت یادآوری موعد تسویه فاکتور خرید/مطالبات به مبلغ ${formatNumber(rem.amount)} تومان بابت «${rem.title}» در تاریخ ${rem.dueDate}.
با تشکر، فروشگاه عسل هونیش`;

    setCustomMessage(template);
    setCopiedText(false);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    setCopiedText(true);
    showToast('متن پیام یادآوری در حافظه کپی شد.');
    setTimeout(() => setCopiedText(false), 3000);
  };

  const handleSendAndMark = () => {
    if (smsModalReminder) {
      markAsReminded(smsModalReminder.id);
      setSmsModalReminder(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-[#FFFDF8] dark:bg-[#1E1610] rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col text-stone-800 dark:text-stone-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-b border-[#EFE4D2] dark:border-[#3D2D21] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-stone-950 rounded-2xl shadow-sm shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-amber-950 dark:text-amber-100">
                  مدیریت یادآورهای بدهکاران و بستانکاران
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800">
                  {formatNumber(pendingDebtors.length + pendingCreditors.length)} سررسید فعال
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                تنظیم موعدهای سررسید، پیگیری مطالبات و ارسال پیامک یادآوری هوشمند
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Top KPIs Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5 bg-[#FAF6EE] dark:bg-[#16100B] border-b border-[#EFE4D2] dark:border-[#3D2D21] shrink-0">
          <div className="p-3.5 bg-[#FFFDF8] dark:bg-[#251B13] rounded-2xl border border-emerald-300/60 dark:border-emerald-800/50 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                🔴 مطالبات ما (طلب از بدهکاران)
              </span>
              <h4 className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                {formatToman(totalDebtorAmount)}
              </h4>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {formatNumber(pendingDebtors.length)} مورد نیاز به دریافت
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 bg-[#FFFDF8] dark:bg-[#251B13] rounded-2xl border border-red-300/60 dark:border-red-800/50 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                🔵 بدهی‌های ما (پرداخت به بستانکاران)
              </span>
              <h4 className="text-base font-black text-red-600 dark:text-red-400 mt-0.5">
                {formatToman(totalCreditorAmount)}
              </h4>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {formatNumber(pendingCreditors.length)} مورد نیاز به واریز
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 bg-[#FFFDF8] dark:bg-[#251B13] rounded-2xl border border-amber-300/60 dark:border-amber-800/50 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                ⚡ اقدام سریع یادآوری
              </span>
              <p className="text-xs font-extrabold text-amber-950 dark:text-amber-200 mt-1">
                ارسال متن آماده پیامک تسویه
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-2 text-[11px] font-extrabold px-3 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                ثبت یادآوری جدید
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Controls & Search Toolbar */}
        <div className="p-4 bg-[#FFFDF8] dark:bg-[#1E1610] border-b border-[#EFE4D2] dark:border-[#3D2D21] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Tabs Filter */}
          <div className="flex items-center gap-1 bg-[#FAF6EE] dark:bg-[#16100B] p-1 rounded-2xl border border-[#EFE4D2] dark:border-[#3D2D21] overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              همه ({formatNumber(reminders.length)})
            </button>
            <button
              onClick={() => setActiveTab('debtor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                activeTab === 'debtor'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              مطالبات بدهکاران ({formatNumber(pendingDebtors.length)})
            </button>
            <button
              onClick={() => setActiveTab('creditor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                activeTab === 'creditor'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              بدهی به بستانکاران ({formatNumber(pendingCreditors.length)})
            </button>
            <button
              onClick={() => setActiveTab('settled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                activeTab === 'settled'
                  ? 'bg-stone-800 text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              تسویه‌شده
            </button>
          </div>

          {/* Search Box & Add Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="جستجوی طرف حساب، عنوان..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-48 p-2 text-xs rounded-xl bg-[#FAF6EE] dark:bg-[#16100B] border border-[#EFE4D2] dark:border-[#3D2D21] focus:ring-2 focus:ring-amber-500/50 outline-none"
            />
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>ایجاد یادآور</span>
            </button>
          </div>
        </div>

        {/* Main List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {filteredReminders.length === 0 ? (
            <div className="text-center py-12 bg-[#FAF6EE] dark:bg-[#16100B] rounded-2xl border border-dashed border-[#EFE4D2] dark:border-[#3D2D21]">
              <Bell className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <p className="font-extrabold text-stone-600 dark:text-stone-400">
                هیچ یادآور سررسیدی با این فیلتر یافت نشد.
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-3 px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                ثبت اولین یادآور بدهی / طلب
              </button>
            </div>
          ) : (
            filteredReminders.map((rem) => {
              const isDebtor = rem.type === 'debtor';
              const isSettled = rem.status === 'settled';
              const isReminded = rem.status === 'reminded';

              return (
                <div
                  key={rem.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSettled
                      ? 'bg-stone-100/70 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-75'
                      : isDebtor
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400'
                      : 'bg-red-50/40 dark:bg-red-950/10 border-red-200 dark:border-red-900/50 hover:border-red-400'
                  }`}
                >
                  {/* Info Column */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-black border ${
                          isDebtor
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800'
                        }`}
                      >
                        {isDebtor ? '🔴 طلب ما از بدهکار' : '🔵 بدهی ما به بستانکار'}
                      </span>

                      <span className="font-extrabold text-sm text-amber-950 dark:text-amber-100">
                        {rem.contactName}
                      </span>

                      {rem.contactPhone && (
                        <span className="text-xs text-stone-500 dir-ltr font-mono bg-stone-200/50 dark:bg-stone-800 px-2 py-0.5 rounded-md">
                          {rem.contactPhone}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200">
                      {rem.title}
                    </h4>

                    {rem.notes && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        توضیحات: {rem.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-600 dark:text-stone-400 pt-1">
                      <div className="flex items-center gap-1 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>تاریخ سررسید: {rem.dueDate}</span>
                      </div>

                      {rem.lastRemindedAt && (
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>پیامک یادآوری ارسال شده ({rem.lastRemindedAt})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount & Actions Column */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center md:items-end justify-between md:justify-end gap-3 border-t md:border-t-0 border-stone-200 dark:border-stone-800 pt-3 md:pt-0">
                    <div className="text-right md:text-left">
                      <span className="text-[10px] text-stone-500 block">مبلغ سررسید</span>
                      <span className="text-lg font-black text-amber-950 dark:text-amber-100">
                        {formatToman(rem.amount)}
                      </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {!isSettled && (
                        <>
                          <button
                            onClick={() => handleOpenSmsModal(rem)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>متن پیامک</span>
                          </button>

                          <button
                            onClick={() => settleReminder(rem.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تسویه شد</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleOpenEdit(rem)}
                        className="p-2 text-stone-500 hover:text-amber-600 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        title="ویرایش"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteReminder(rem.id)}
                        className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Add / Edit Reminder Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg bg-[#FFFDF8] dark:bg-[#1E1610] p-6 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-2xl space-y-4 text-stone-800 dark:text-stone-200"
            >
              <div className="flex items-center justify-between border-b border-[#EFE4D2] dark:border-[#3D2D21] pb-3">
                <h3 className="font-extrabold text-lg text-amber-950 dark:text-amber-100 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  {editingReminder ? 'ویرایش یادآور سررسید' : 'ثبت یادآور بدهکار / بستانکار جدید'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveReminder} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">انتخاب طرف حساب *</label>
                  <select
                    value={formData.contactId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const c = contacts.find((item) => item.id === selId);
                      setFormData({
                        ...formData,
                        contactId: selId,
                        type: c && c.balance < 0 ? 'creditor' : 'debtor',
                        amount: c ? Math.abs(c.balance) : formData.amount,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#16100B] border border-[#EFE4D2] dark:border-[#3D2D21] font-bold"
                  >
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type === 'supplier' ? 'تامین‌کننده' : 'مشتری'}) - مانده: {formatToman(c.balance)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">نوع سررسید</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ReminderType })}
                      className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#16100B] border border-[#EFE4D2] dark:border-[#3D2D21] font-bold"
                    >
                      <option value="debtor">🔴 طلب ما از بدهکار (مشتری)</option>
                      <option value="creditor">🔵 بدهی ما به بستانکار (تامین‌کننده)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">تاریخ سررسید (شمسی) *</label>
                    <input
                      type="text"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      placeholder="۱۴۰۵/۰۵/۲۰"
                      className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#16100B] border border-[#EFE4D2] dark:border-[#3D2D21] font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">مبلغ سررسید (تومان) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#16100B] border border-[#EFE4D2] dark:border-[#3D2D21] font-black text-amber-950 dark:text-amber-200 text-sm"
                  />
                  {formData.amount > 0 && (
                    <span className="text-[11px] text-amber-800 dark:text-amber-300 mt-1 block">
                      {formatToman(formData.amount)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-bold mb-1">عنوان / بابت *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: تسویه قسط فاکتور فروش شماره ۱۰۱"
                    className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#16100B] border border-[#EFE4D2] dark:border-[#3D2D21]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">یادداشت / پیگیری‌ها</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    placeholder="یادداشت‌های پیگیری خود را وارد کنید..."
                    className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#16100B] border border-[#EFE4D2] dark:border-[#3D2D21]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl font-bold cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl font-extrabold shadow-sm cursor-pointer"
                  >
                    ثبت یادآور
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SMS & Messaging Template Drawer/Modal */}
      <AnimatePresence>
        {smsModalReminder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full max-w-lg bg-[#FFFDF8] dark:bg-[#1E1610] p-6 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-2xl space-y-4 text-stone-800 dark:text-stone-200"
            >
              <div className="flex items-center justify-between border-b border-[#EFE4D2] dark:border-[#3D2D21] pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-base text-amber-950 dark:text-amber-100">
                    ارسال پیامک یادآوری تسویه
                  </h3>
                </div>
                <button
                  onClick={() => setSmsModalReminder(null)}
                  className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-stone-800 dark:text-stone-200 block">
                      {smsModalReminder.contactName}
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {smsModalReminder.contactPhone || 'شماره تلفن ثبت نشده'}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-900 dark:text-amber-300 font-black">
                    {formatToman(smsModalReminder.amount)}
                  </span>
                </div>

                <div>
                  <label className="block font-bold mb-1">ویرایش متن پیامک پیش‌فرض:</label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={6}
                    className="w-full p-3 rounded-2xl bg-[#FAF6EE] dark:bg-[#16100B] border border-[#EFE4D2] dark:border-[#3D2D21] font-medium leading-relaxed"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      copiedText
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300'
                    }`}
                  >
                    {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedText ? 'کپی شد!' : 'کپی متن پیام'}</span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {smsModalReminder.contactPhone && (
                      <a
                        href={`sms:${smsModalReminder.contactPhone}?body=${encodeURIComponent(
                          customMessage
                        )}`}
                        onClick={handleSendAndMark}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <Send className="w-4 h-4" />
                        <span>ارسال SMS مستقیم</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={handleSendAndMark}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>علامت به عنوان «پیامک ارسال شد»</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
