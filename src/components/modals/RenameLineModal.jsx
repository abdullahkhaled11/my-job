import { useState, useEffect } from 'react';
import { X, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export function RenameLineModal({ show, lineId, currentName, onSave, onClose }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (show) {
      setName(currentName || '');
    }
  }, [show, currentName]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('يرجى إدخال اسم الخط');
      return;
    }
    onSave(lineId, trimmed);
    toast.success(`تم تغيير اسم الخط إلى «${trimmed}» بنجاح ✓`);
    onClose();
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-content-custom" style={{ maxWidth: '440px' }}>
        <div className="d-flex align-items-center justify-content-between pb-2 border-bottom mb-3">
          <div className="d-flex align-items-center gap-2">
            <Pencil size={18} className="text-primary" />
            <h5 className="modal-title fw-black mb-0">تعديل اسم خط الإنتاج</h5>
          </div>
          <button type="button" className="btn btn-light btn-sm rounded-circle p-1.5" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p className="small text-muted mb-2">
            أدخل الاسم الجديد للخط (مثل: صالح، كريم، أحمد، إلخ):
          </p>

          <input
            type="text"
            autoFocus
            className="form-control form-control-lg text-center fw-black fs-4 py-2.5 mb-3"
            placeholder="اسم الخط"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="d-flex gap-2">
            <button type="button" className="btn btn-light flex-grow-1 py-2.5 fw-bold" onClick={onClose}>
              إلغاء
            </button>
            <button type="submit" className="btn-primary-custom flex-grow-1 py-2.5 fs-6">
              حفظ الاسم الجديد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
