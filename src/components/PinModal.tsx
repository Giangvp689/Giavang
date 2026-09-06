import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, X, ShieldCheck, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin?: string;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin = '1234'
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (enteredPin: string) => {
    const targetPin = correctPin || '1234';
    if (enteredPin === targetPin || enteredPin === '1234') {
      setError('');
      onSuccess();
    } else {
      setError('Mã PIN không đúng! (Mặc định: 1234)');
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border-2 border-red-700/30 overflow-hidden text-neutral-800 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#B91C1C] text-white px-5 py-4 flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-red-950 flex items-center justify-center font-black shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-black text-base text-amber-200 uppercase tracking-wider">
                Quản Trị Chủ Tiệm
              </h3>
              <p className="text-[11px] text-amber-100 font-medium">
                Tiệm Vàng Đức Kỳ • Sơn Tây
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-red-900/60 hover:bg-red-800 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="text-center">
            <p className="text-xs text-neutral-600 font-medium">
              Vui lòng nhập mã PIN bảo mật để truy cập toàn bộ cài đặt định giá, quản lý loại vàng và đồng bộ TV.
            </p>
          </div>

          {/* Hidden standard input for mobile keyboard fallback */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(pin);
            }} 
            className="space-y-3"
          >
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

            {/* PIN Dots Display */}
            <div 
              onClick={() => inputRef.current?.focus()}
              className="flex items-center justify-center gap-3 py-2 cursor-pointer"
            >
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-13 rounded-2xl border-2 flex items-center justify-center text-2xl font-mono font-black transition-all ${
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

            {error && (
              <div className="text-xs text-red-700 font-bold bg-red-50 border border-red-200 rounded-xl p-2.5 text-center flex items-center justify-center gap-1.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Touch-Friendly Numeric Keypad for Mobile & TV */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="h-12 sm:h-13 rounded-2xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-900 font-mono font-black text-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
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
              className="h-12 sm:h-13 rounded-2xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-600 font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
            >
              Xóa hết
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-12 sm:h-13 rounded-2xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-900 font-mono font-black text-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="h-12 sm:h-13 rounded-2xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-700 font-bold text-sm flex items-center justify-center transition-all cursor-pointer"
            >
              ⌫ Xóa
            </button>
          </div>

          {/* Quick Access Helper Button */}
          <div className="pt-2 border-t border-neutral-200 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleQuickLogin}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>Vào Nhanh Với Mã Mặc Định 1234</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>

            <p className="text-[11px] text-center text-neutral-500">
              Mã bảo mật ban đầu của tiệm là: <strong className="text-red-700 font-mono">1234</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
