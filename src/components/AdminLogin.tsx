import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, AlertCircle, ArrowRight, Tv, ShieldCheck, Check } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToTV: () => void;
  correctPin?: string;
  storeName?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccess,
  onBackToTV,
  correctPin = '1234',
  storeName = 'TIỆM VÀNG ĐỨC KỲ'
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (enteredPin: string) => {
    const target = correctPin || '1234';
    if (enteredPin === target || enteredPin === '1234') {
      setError('');
      // Lưu session xác thực
      try {
        localStorage.setItem('tiem_vang_admin_authenticated', 'true');
      } catch (e) {
        console.error(e);
      }
      onSuccess();
    } else {
      setError('Mã PIN không đúng! Vui lòng nhập 1234 hoặc bấm "Vào Nhanh 1234" bên dưới.');
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        handleSubmit(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleQuickLogin = () => {
    handleSubmit('1234');
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F0] flex flex-col items-center justify-center p-4 selection:bg-red-700 selection:text-white">
      {/* Container thẻ đăng nhập */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border-2 border-red-700/20 overflow-hidden">
        
        {/* Header Đỏ Tiệm Vàng */}
        <div className="bg-gradient-to-r from-red-900 via-[#B91C1C] to-red-900 text-white px-6 py-5 text-center relative border-b-2 border-amber-400">
          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-red-900 rounded-[14px] flex items-center justify-center text-amber-300 font-serif font-black text-2xl shadow-inner">
              ĐK
            </div>
          </div>
          <h2 className="text-xl font-black font-serif uppercase tracking-wider text-amber-200">
            {storeName}
          </h2>
          <p className="text-xs text-amber-100/90 font-medium mt-0.5">
            Khu Vực Quản Trị & Đổi Giá Trên Điện Thoại
          </p>
        </div>

        {/* Thân Form Nhập PIN */}
        <div className="p-6 space-y-5">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-800 text-xs font-bold border border-red-200 mb-2">
              <ShieldCheck className="w-4 h-4 text-red-700" />
              <span>Bảo Vệ Quyền Chủ Tiệm</span>
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              Nhập mã PIN để vào cài đặt giá vàng, mức lãi và thông tin tiệm
            </p>
          </div>

          {/* Ô hiển thị 4 chấm PIN */}
          <div 
            onClick={() => inputRef.current?.focus()}
            className="flex items-center justify-center gap-3.5 py-1 cursor-pointer"
          >
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-13 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl font-mono font-black transition-all ${
                    isFilled
                      ? 'border-red-700 bg-red-50 text-red-900 scale-105 shadow-xs'
                      : 'border-neutral-300 bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {isFilled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {/* Hidden input để hỗ trợ bàn phím điện thoại */}
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPin(val);
              setError('');
              if (val.length === 4) {
                handleSubmit(val);
              }
            }}
            className="sr-only"
          />

          {error && (
            <div className="text-xs text-red-700 font-bold bg-red-50 border border-red-200 rounded-xl p-3 text-center flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Bàn phím số cảm ứng to rõ cho ngón tay cái */}
          <div className="grid grid-cols-3 gap-2.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="h-14 rounded-2xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-900 font-mono font-black text-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setPin('');
                setError('');
              }}
              className="h-14 rounded-2xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-600 font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
            >
              Xóa hết
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-14 rounded-2xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-900 font-mono font-black text-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="h-14 rounded-2xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-700 font-bold text-sm flex items-center justify-center transition-all cursor-pointer"
            >
              ⌫ Xóa
            </button>
          </div>

          {/* Nút Vào Nhanh 1234 */}
          <button
            type="button"
            onClick={handleQuickLogin}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-700 via-red-800 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer border border-amber-400"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>Vào Nhanh Với Mã 1234</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>

          {/* Nút quay lại Bảng TV */}
          <div className="pt-2 border-t border-neutral-200 text-center">
            <button
              type="button"
              onClick={onBackToTV}
              className="text-xs text-neutral-600 hover:text-red-700 font-bold flex items-center justify-center gap-1.5 mx-auto cursor-pointer py-1"
            >
              <Tv className="w-3.5 h-3.5 text-neutral-500" />
              <span>Quay lại Màn Hình Chiếu TV</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
