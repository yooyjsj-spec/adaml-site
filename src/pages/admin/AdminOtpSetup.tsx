import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { confirmOtpSetup, startOtpSetup } from '../../api/admin';

interface AdminOtpSetupModalProps {
  open: boolean;
  onComplete: () => unknown;
  onClose?: () => void;
}

export const AdminOtpSetupModal: React.FC<AdminOtpSetupModalProps> = ({ open, onComplete, onClose }) => {
  const [qrCode, setQrCode] = useState('');
  const [otpauth, setOtpauth] = useState('');
  const [token, setToken] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    startOtpSetup()
      .then((setup) => {
        setQrCode(setup.qrCode);
        setOtpauth(setup.otpauth);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'OTP 설정을 시작할 수 없습니다.'));
  }, [open]);

  if (!open) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const result = await confirmOtpSetup(token);
      setRecoveryCodes(result.recoveryCodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP 확인에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/55 px-5 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl space-y-6">
        {onClose && (
          <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        )}
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary-700">Two-factor setup</p>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mt-2">TOTP 등록</h1>
          <p className="text-sm text-slate-500 mt-2">Google Authenticator, 1Password, Microsoft Authenticator 등에서 QR을 스캔하세요.</p>
        </div>

        {qrCode && <img src={qrCode} alt="TOTP QR" className="w-56 h-56 mx-auto border rounded-2xl p-3" />}
        {otpauth && <p className="break-all rounded-xl bg-slate-100 p-3 text-xs text-slate-500">{otpauth}</p>}

        {!recoveryCodes.length ? (
          <form onSubmit={submit} className="space-y-4">
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="6자리 OTP" className="w-full rounded-xl border border-slate-200 px-4 py-3 tracking-widest" />
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button className="w-full rounded-xl bg-slate-900 text-white py-3 font-bold hover:bg-primary-700">OTP 활성화</button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
              아래 복구 코드는 다시 표시되지 않습니다. 안전한 곳에 보관하세요.
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {recoveryCodes.map((code) => (
                <span key={code} className="rounded-lg bg-slate-100 px-3 py-2">{code}</span>
              ))}
            </div>
            <button onClick={() => onComplete()} className="w-full rounded-xl bg-primary-700 text-white py-3 font-bold">완료</button>
          </div>
        )}
      </div>
    </div>
  );
};
