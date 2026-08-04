import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatToman, formatNumber } from '../../utils/persian';
import { Modal } from '../common/Modal';
import {
  PackageCheck,
  Plus,
  Search,
  AlertTriangle,
  Edit,
  Trash2,
  Boxes,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Quick Stock Adjust Modal
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'عسل چندگل' as Product['category'],
    unit: 'کیلوگرم' as Product['unit'],
    stock: 50,
    minStock: 20,
    purchasePrice: 200000,
    sellingPrice: 300000,
    description: '',
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      code: `HON-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'عسل چندگل',
      unit: 'کیلوگرم',
      stock: 50,
      minStock: 20,
      purchasePrice: 250000,
      sellingPrice: 350000,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      code: p.code,
      name: p.name,
      category: p.category,
      unit: p.unit,
      stock: p.stock,
      minStock: p.minStock,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      description: p.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        code: formData.code,
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        description: formData.description,
      });
    } else {
      addProduct({
        code: formData.code,
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        description: formData.description,
      });
    }
    setIsModalOpen(false);
  };

  const handleConfirmStockAdjust = (delta: number) => {
    if (!adjustProduct) return;
    const newStock = Math.max(0, adjustProduct.stock + delta);
    updateProduct({
      ...adjustProduct,
      stock: newStock,
    });
    setAdjustProduct(null);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.includes(searchTerm) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'low-stock') return p.stock <= p.minStock;
    return p.category === categoryFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm">
        <div>
          <h2 className="text-xl font-black text-amber-950 dark:text-amber-400 flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-amber-600" />
            مدیریت محصولات و موجودی انبار
          </h2>
          <p className="text-xs text-amber-800/60 dark:text-amber-200/60 mt-0.5">
            کاتالوگ انواع عسل طبیعی، موم، ژل رویال و ظروف بسته‌بندی
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>تعریف محصول جدید</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FFFDF8] dark:bg-[#251B13] p-4 rounded-2xl border border-[#EFE4D2] dark:border-[#3D2D21]">
        <div className="relative w-full md:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی نام یا کد کالا..."
            className="w-full pr-9 pl-3 py-2 rounded-xl text-xs bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] dark:border-[#3A2A1E]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'همه محصولات' },
            { id: 'عسل تک‌گل', label: 'عسل تک‌گل' },
            { id: 'عسل چندگل', label: 'عسل چندگل' },
            { id: 'موم و فراورده‌ها', label: 'موم و مشتقات' },
            { id: 'ظروف و بسته‌بندی', label: 'ظروف و بسته‌بندی' },
            { id: 'low-stock', label: '⚠️ کمبود موجودی' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-[#FAF6EE] dark:bg-[#1A120C] text-amber-900/80 dark:text-amber-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const isLowStock = p.stock <= p.minStock;
          return (
            <div
              key={p.id}
              className={`bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-2xl border shadow-sm hover-lift space-y-4 flex flex-col justify-between ${
                isLowStock
                  ? 'border-red-300 dark:border-red-900/50 bg-red-50/10'
                  : 'border-[#EFE4D2] dark:border-[#3D2D21]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-[#EFE4D2] dark:border-[#3D2D21] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200">
                        {p.code}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-500">
                        {p.category}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-amber-950 dark:text-amber-300 mt-1">
                      {p.name}
                    </h3>
                  </div>

                  {isLowStock && (
                    <span className="px-2.5 py-1 bg-yellow-400 text-stone-950 text-[10px] font-black rounded-xl flex items-center gap-1 shrink-0 border border-yellow-500 shadow-sm animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-stone-950 fill-yellow-950/20" />
                      <span>هشدار آستانه موجودی کم</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-amber-800/70 dark:text-amber-200/60 line-clamp-2">
                  {p.description || 'توضیحات خاصی ثبت نشده است.'}
                </p>

                {/* Stock & Prices */}
                <div className="p-3 bg-[#FAF6EE] dark:bg-[#1A120C] rounded-xl border border-[#EFE4D2] dark:border-[#3A2A1E] space-y-2 text-xs">
                  <div className="flex items-center justify-between font-extrabold">
                    <span className="text-stone-600 dark:text-stone-400">موجودی فعلی انبار:</span>
                    <span
                      className={`text-sm ${
                        isLowStock ? 'text-red-600 dark:text-red-400 font-black' : 'text-amber-900 dark:text-amber-300'
                      }`}
                    >
                      {formatNumber(p.stock)} {p.unit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-amber-900 dark:text-amber-300 pt-1 border-t border-stone-200 dark:border-stone-800">
                    <span className="text-stone-600 dark:text-stone-400">آستانه هشدار (Threshold):</span>
                    <span className="font-extrabold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                      {formatNumber(p.minStock)} {p.unit}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-600 pt-1 border-t border-stone-200 dark:border-stone-800">
                    <span>قیمت فروش پایه:</span>
                    <span className="font-bold text-amber-800 dark:text-amber-400">
                      {formatToman(p.sellingPrice)} / {p.unit}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-500 text-[11px]">
                    <span>قیمت خرید اولیه:</span>
                    <span>{formatToman(p.purchasePrice)}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#EFE4D2] dark:border-[#3D2D21]">
                <button
                  onClick={() => setAdjustProduct(p)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 hover:bg-amber-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>اصلاح / شارژ انبار</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="p-1.5 text-amber-800 hover:bg-amber-100 rounded-lg cursor-pointer"
                    title="ویرایش"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`آیا از حذف محصول ${p.name} اطمینان دارید؟`)) {
                        deleteProduct(p.id);
                      }
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `ویرایش ${editingProduct.name}` : 'تعریف محصول جدید'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">کد کالا</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2]"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">نام محصول / عسل *</label>
              <input
                type="text"
                required
                placeholder="مثال: عسل گون سبلان"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2]"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">دسته بندی</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as Product['category'] })
                }
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2]"
              >
                <option value="عسل تک‌گل">عسل تک‌گل</option>
                <option value="عسل چندگل">عسل چندگل</option>
                <option value="موم و فراورده‌ها">موم و فراورده‌ها</option>
                <option value="ظروف و بسته‌بندی">ظروف و بسته‌بندی</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">واحد سنجش</label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value as Product['unit'] })
                }
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2]"
              >
                <option value="کیلوگرم">کیلوگرم</option>
                <option value="عدد">عدد</option>
                <option value="بسته">بسته</option>
                <option value="گرم">گرم</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">موجودی فعلی اولیه</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2]"
              />
            </div>

            <div className="bg-yellow-500/10 dark:bg-yellow-500/15 p-3 rounded-2xl border border-yellow-400/50 space-y-1">
              <label className="block font-black text-amber-950 dark:text-amber-200">
                ⚠️ آستانه عددی «موجودی کم» (Threshold)
              </label>
              <p className="text-[10px] text-stone-600 dark:text-stone-300">
                با رسیدن موجودی به این عدد یا کمتر، نشان هشدار زرد رنگ در داشبورد فعال می‌شود.
              </p>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FFFDF8] dark:bg-[#1A120C] border border-yellow-400 font-extrabold text-amber-950 dark:text-amber-200"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">قیمت خرید (تومان)</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2]"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">قیمت فروش پایه (تومان)</label>
              <input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) =>
                  setFormData({ ...formData, sellingPrice: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">شرح و خواص محصول</label>
            <textarea
              rows={2}
              placeholder="توضیحات ساکارز، منطقه برداشت و خواص درمانی..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EFE4D2]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 font-bold"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold shadow-md"
            >
              ذخیره محصول
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjust Modal */}
      {adjustProduct && (
        <Modal
          isOpen={!!adjustProduct}
          onClose={() => setAdjustProduct(null)}
          title={`تعدیل موجودی «${adjustProduct.name}»`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 font-bold text-amber-900">
              موجودی کنونی: {formatNumber(adjustProduct.stock)} {adjustProduct.unit}
            </div>

            <div>
              <label className="block font-bold mb-1">مقدار ورود یا خروج ({adjustProduct.unit}):</label>
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A120C] border border-[#EFE4D2] font-bold text-base"
              />
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                onClick={() => handleConfirmStockAdjust(adjustAmount)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>افزایش به انبار (+{adjustAmount})</span>
              </button>

              <button
                onClick={() => handleConfirmStockAdjust(-adjustAmount)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold cursor-pointer"
              >
                <MinusCircle className="w-4 h-4" />
                <span>کاهش از انبار (-{adjustAmount})</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
