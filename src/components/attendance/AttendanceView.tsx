import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatToman, formatNumber, toPersianDigits } from '../../utils/persian';
import { Clock, UserCheck, Phone, CheckCircle2, LogOut, Calendar } from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { employees, toggleEmployeeClock } = useApp();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm">
        <div>
          <h2 className="text-xl font-black text-amber-950 dark:text-amber-400 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-600" />
            سیستم مدیریت پرسنل و حضور و غیاب
          </h2>
          <p className="text-xs text-amber-800/60 dark:text-amber-200/60 mt-0.5">
            ثبت ورود و خروج شیفت‌های کاری فروشندگان، انباردار و حسابدار فروشگاه هونیش
          </p>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {employees.map((emp) => {
          const isWorkingNow = emp.status === 'حاضر';

          return (
            <div
              key={emp.id}
              className="bg-[#FFFDF8] dark:bg-[#251B13] p-5 rounded-3xl border border-[#EFE4D2] dark:border-[#3D2D21] shadow-sm space-y-4 hover-lift"
            >
              <div className="flex items-start justify-between border-b border-[#EFE4D2] dark:border-[#3A2A1E] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-lg">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-amber-950 dark:text-amber-200 text-base">
                      {emp.name}
                    </h3>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      سمت: {emp.role}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    isWorkingNow
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  {emp.status}
                </span>
              </div>

              {/* Shift Details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF6EE] dark:bg-[#1A120C] p-3 rounded-2xl border border-[#EFE4D2] dark:border-[#3A2A1E]">
                <div>
                  <span className="text-stone-500">شیفت کاری:</span>
                  <p className="font-bold text-amber-900 dark:text-amber-300 mt-0.5">{emp.shift}</p>
                </div>
                <div>
                  <span className="text-stone-500">ساعت ورود ثبت‌شده:</span>
                  <p className="font-bold text-amber-900 dark:text-amber-300 mt-0.5">
                    {emp.checkInTime ? toPersianDigits(emp.checkInTime) : 'ثبت نشده'}
                  </p>
                </div>
                <div>
                  <span className="text-stone-500">کارکرد این ماه:</span>
                  <p className="font-bold text-amber-900 dark:text-amber-300 mt-0.5">
                    {formatNumber(emp.workingDaysThisMonth)} روز
                  </p>
                </div>
                <div>
                  <span className="text-stone-500">حقوق پایه ماهیانه:</span>
                  <p className="font-bold text-amber-900 dark:text-amber-300 mt-0.5">
                    {formatToman(emp.baseSalary)}
                  </p>
                </div>
              </div>

              {/* Action Button: Clock In / Clock Out */}
              <div className="pt-2">
                <button
                  onClick={() => toggleEmployeeClock(emp.id)}
                  className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    isWorkingNow
                      ? 'bg-stone-800 hover:bg-stone-900 text-stone-100'
                      : 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                  }`}
                >
                  {isWorkingNow ? (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>ثبت خروج و پایان شیفت امروز</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ثبت ورود و شروع شیفت کاری</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
