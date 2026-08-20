import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { num } from '../../utils/formatters';
import { toast } from 'sonner';

export function EditEntryModal({ show, entry, maxAllowed, onSave, onClose }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (show && entry) {
      setValue(String(entry.quantity));
    }
  }, [show, entry]);

  if (!show || !entry) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const qty = Math.floor(Number(value));
    if (!qty || qty <= 0) {
      toast.error('يرجى إدخال كمية صحيحة أكبر من صفر');
      return;
    }
    if (qty > maxAllowed) {
      toast.error(`أقصى كمية مسموحة هي ${num(maxAllowed)} قطعة`);
      return;
    }
    onSave(entry.id, qty);
    onClose();
  };

  return (
    <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div className="modal-content-custom bg-body rounded-4 shadow-lg w-100 p-4 border" style={{ maxWidth: '440px' }}>
        <div className="d-flex align-items-center justify-content-between pb-2 border-bottom mb-3">
          <h5 className="modal-title fw-black mb-0">تعديل عملية إنتاج</h5>
          <button type="button" className="btn btn-light btn-sm rounded-circle p-1.5" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p className="small text-muted mb-2">
            عدّل الكمية المسجلة لهذه العملية (الحد الأقصى المسموح: {num(maxAllowed)} قطعة)
          </p>

          <input
            type="number"
            inputMode="numeric"
            autoFocus
            className="form-control form-control-lg text-center fw-black fs-1 py-3 mb-3"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          <div className="d-flex gap-2">
            <button type="button" className="btn btn-light flex-grow-1 py-2.5 fw-bold" onClick={onClose}>
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary flex-grow-1 py-2.5 fw-black">
              حفظ التعديل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
