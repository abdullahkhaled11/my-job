import { X, AlertTriangle } from 'lucide-react';

export function ConfirmModal({ show, title, message, confirmText = 'تأكيد الحذف', isDanger = true, onConfirm, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div className="modal-content-custom bg-body rounded-4 shadow-lg w-100 p-4 border" style={{ maxWidth: '440px' }}>
        <div className="d-flex align-items-center justify-content-between pb-2 border-bottom mb-3">
          <div className="d-flex align-items-center gap-2">
            {isDanger && <AlertTriangle className="text-danger" size={20} />}
            <h5 className="modal-title fw-black mb-0">{title}</h5>
          </div>
          <button type="button" className="btn btn-light btn-sm rounded-circle p-1.5" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="text-secondary mb-4">{message}</p>

        <div className="d-flex gap-2">
          <button type="button" className="btn btn-light flex-grow-1 py-2.5 fw-bold" onClick={onClose}>
            إلغاء
          </button>
          <button
            type="button"
            className={`btn flex-grow-1 py-2.5 fw-black ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
