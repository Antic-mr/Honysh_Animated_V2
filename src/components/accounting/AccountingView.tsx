import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TransactionType } from '../../types';
import { formatToman, toPersianDigits } from '../../utils/persian';
import { Modal } from '../common/Modal';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  PlusCircle,
  Building2,
  CreditCard,
  Plus,
  Search,
} from 'lucide-react';

export const AccountingView: React.FC = () => {
  const { bankAccounts, transactions, addTransaction, addBankAccount, contacts } = useApp();

  const [activeTab, setActiveTab] = useState<'transactions' | 'accounts'>('transactions');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // New Transaction Modal
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    type: 'expense' as TransactionType,
    amount: 500000,
    category: 'هزینه‌های جاری و اجاره',
    sourceAccount: bankAccounts[0]?.id || 'acc-1',
    destinationAccount: bankAccounts[1]?.id || '',
    contactId: '',
    description: '',
  });

  // New Account Modal
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [accForm, setAccForm] = useState({
    name: '',
    bankName: 'بانک ملت',
    accountNumber: '',
    cardPickerNumber: '',
    balance: 10000000,
  });

  const totalBankBalance = bankAccounts.reduce((acc, a) => acc + a.balance, 0);

  const handleSubmitTx = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedContact = contacts.find((c) => c.id === txForm.contactId);
    addTransaction({
      type: txForm.type,
      amount: Number(txForm.amount),
      category: txForm.category,
      sourceAccount: txForm.sourceAccount,
      destinationAccount: txForm.type === 'transfer' ? txForm.destinationAccount : undefined,
      contactId: txForm.contactId || undefined,
      contactName: selectedContact ? selectedContact.name : undefined,
      description: txForm.description || 'ثبت دستی در سیستم',
    });
    setIsTxModalOpen(false);
  };

  const handleSubmitAcc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accForm.name) return;
    addBankAccount({
      name: accForm.name,
      bankName: accForm.bankName,
      accountNumber: accForm.accountNumber || '123456789',
      cardPickerNumber: accForm.cardPickerNumber,
      balance: Number(accForm.balance),
    });
    setIsAccModalOpen(false);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.category.includes(searchTerm) ||
      tx.description.includes(searchTerm) ||
      (tx.contactName && tx.contactName.includes(searchTerm));

    if (!matchesSearch) return false;

    if (typeFilter === 'all') return true;
    return tx.type === typeFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm">
        <div>
          <h2 className="text-xl font-black text-amber-950 dark:text-amber-400 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-amber-600" />
            حسابداری، صندوق و بانک‌ها
          </h2>
          <p className="text-xs text-amber-800/60 dark:text-amber-200/60 mt-0.5">
            مدیریت گردش وجوه نقدی، کارتخوان مغازه، واریزهای بانکی و ثبت هزینه‌ها
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTxModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ثبت دریافت / پرداخت / هزینه</span>
          </button>
        </div>
      </div>

      {/* Bank & Cash Accounts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bankAccounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-gradient-to-br from-[#FFFDF8] to-[#FAF6EE] dark:from-[#251B13] dark:to-[#1A120C] p-5 rounded-2xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[#EFE4D2] dark:border-[#3A2A1E] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-amber-950 dark:text-amber-200 text-sm">
                    {acc.name}
                  </h3>
                  <p className="text-[11px] text-stone-500">{acc.bankName}</p>
                </div>
              </div>
              {acc.isMain && (
                <span className="px-2 py-0.5 bg-amber-500 text-stone-950 text-[10px] font-bold rounded-md">
                  صندوق اصلی
                </span>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-stone-500">موجود بستانکار فعلی:</span>
              <div className="text-xl font-black text-amber-900 dark:text-amber-300">
                {formatToman(acc.balance)}
              </div>
            </div>

            {acc.cardPickerNumber && (
              <div className="flex items-center gap-1.5 text-[11px] text-stone-600 dark:text-stone-400 font-mono dir-ltr justify-end pt-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span>{toPersianDigits(acc.cardPickerNumber)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Transactions Section */}
      <div className="bg-[#FFFDF8] dark:bg-[#251B13] p-6 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE4D2] dark:border-[#3D2D21] pb-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی بابت یا سرفصل تراکنش..."
              className="w-full pr-9 pl-3 py-2 rounded-xl text-xs bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'همه تراکنش‌ها' },
              { id: 'income', label: 'درآمدها / ورودی' },
              { id: 'expense', label: 'هزینه‌ها / خروجی' },
              { id: 'transfer', label: 'انتقالی' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === f.id
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-[#FAF6EE] dark:bg-[#1A120C] text-amber-900/80 dark:text-amber-200/70'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF6EE] dark:bg-[#1A120C] text-amber-950 dark:text-amber-300 font-bold border-b border-[#EFE4D2]">
                <th className="p-3">نوع</th>
                <th className="p-3">تاریخ (جلالی)</th>
                <th className="p-3">سرفصل / بابت</th>
                <th className="p-3">طرف حساب</th>
                <th className="p-3">مبلغ (تومان)</th>
                <th className="p-3">شرح / توضیحات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4D2] dark:divide-[#3A2A1E]">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-amber-50/40 dark:hover:bg-amber-900/10">
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                        tx.type === 'income'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60'
                          : tx.type === 'expense'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/60'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5" /> ورودی
                        </>
                      ) : tx.type === 'expense' ? (
                        <>
                          <ArrowDownLeft className="w-3.5 h-3.5" /> هزینه
                        </>
                      ) : (
                        <>
                          <ArrowRightLeft className="w-3.5 h-3.5" /> جابه‌جایی
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-stone-600 dark:text-stone-400">{tx.date}</td>
                  <td className="p-3 font-bold text-amber-950 dark:text-amber-200">{tx.category}</td>
                  <td className="p-3 text-stone-800 dark:text-stone-200">
                    {tx.contactName || '-'}
                  </td>
                  <td
                    className={`p-3 font-black text-sm ${
                      tx.type === 'income'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-red-700 dark:text-red-400'
                    }`}
                  >
                    {formatToman(tx.amount)}
                  </td>
                  <td className="p-3 text-stone-500">{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transaction Modal */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title="ثبت دریافت، پرداخت یا هزینه جدید"
      >
        <form onSubmit={handleSubmitTx} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">نوع تراکنش</label>
              <select
                value={txForm.type}
                onChange={(e) =>
                  setTxForm({ ...txForm, type: e.target.value as TransactionType })
                }
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] font-bold"
              >
                <option value="expense">هزینه / خروجی از حساب</option>
                <option value="income">درآمد / ورودی به حساب</option>
                <option value="transfer">انتقال بین حساب‌های بانکی</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">مبلغ تراکنش (تومان) *</label>
              <input
                type="number"
                required
                value={txForm.amount}
                onChange={(e) => setTxForm({ ...txForm, amount: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">سرفصل و دسته</label>
              <input
                type="text"
                placeholder="مثال: اجاره، حقوق، حمل و نقل، قبوض..."
                value={txForm.category}
                onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2]"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">حساب مبدا / پرداخت‌کننده</label>
              <select
                value={txForm.sourceAccount}
                onChange={(e) => setTxForm({ ...txForm, sourceAccount: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2]"
              >
                {bankAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (موجودی: {formatToman(a.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">طرف حساب مرتبط (اختیاری)</label>
              <select
                value={txForm.contactId}
                onChange={(e) => setTxForm({ ...txForm, contactId: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2]"
              >
                <option value="">-- بدون انتخاب طرف حساب --</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">توضیحات و بابت</label>
            <textarea
              rows={2}
              value={txForm.description}
              onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EFE4D2]">
            <button
              type="button"
              onClick={() => setIsTxModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 font-bold"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold shadow-md"
            >
              ثبت مالی
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
