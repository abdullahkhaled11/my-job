import { useState, useEffect } from 'react';
import { X, Plus, Hash, RefreshCw } from 'lucide-react';
import { useProduction, jobCurrent, jobRemaining } from '../../context/ProductionContext';
import { num, formatTime } from '../../utils/formatters';
import { toast } from 'sonner';

export function AddProductionModal({ job, show, onClose }) {
  const { state, addEntry, removeEntry, getLineName } = useProduction();
  const [amount, setAmount] = useState(0);
  const [customMode, setCustomMode] = useState(false);

  useEffect(() => {
    if (show) {
      setAmount(0);
      setCustomMode(false);
    }
  }, [show, job?.id]);

  if (!show || !job) return null;

  const isClearance = !!job.isClearance;
  const current = jobCurrent(job);
  const remaining = isClearance ? Infinity : jobRemaining(job);
  const lineName = getLineName ? getLineName(job.lineId) : `خط ${job.lineId}`;

  const handlePick = (val) => {
    const value = Math.max(0, Math.floor(Number(val) || 0));
    if (!isClearance && value > remaining) {
      setAmount(remaining);
      toast.error(`المتبقي ${num(remaining)} قطعة فقط`);
      return;
    }
    setAmount(value);
  };

  const handleConfirm = () => {
    if (amount <= 0) {
      toast.error('يرجى اختيار أو كتابة كمية الإنتاج');
      return;
    }
    const safeAmount = isClearance ? amount : Math.min(amount, remaining);
    const entryId = addEntry(job.id, safeAmount);
    onClose();

    toast.success(`تم تسجيل ${isClearance ? 'إنتاج تصفية' : 'إنتاج'} ${num(safeAmount)} قطعة بنجاح ${isClearance ? '🔄' : '✓'}`, {
      action: entryId
        ? {
            label: 'تراجع',
            onClick: () => {
              removeEntry(job.id, entryId);
              toast.info('تم التراجع عن الإضافة السابقة');
            },
          }
        : undefined,
      duration: 4000,
    });
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-content-custom">
        <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
          <div>
            <h5 className="fw-black mb-0">{isClearance ? 'إضافة إنتاج تصفية 🔄' : 'إضافة إنتاج'}</h5>
            <small className="text-muted fw-bold">
              {lineName} — {job.bagTypeNameSnapshot} {isClearance ? '(تصفية)' : ''}
            </small>
          </div>
          <button type="button" className="btn btn-light btn-sm rounded-circle p-1.5" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* ملخص الوضع الحالي */}
        <div className="row g-2 mb-3">
          <div className="col-6">
            <div className="bg-light p-3 rounded-3 text-center border">
              <small className="text-muted d-block fw-bold mb-1">الإنتاج الحالي</small>
              <div className="fw-black fs-5">
                {num(current)} {!isClearance && <span className="fs-6 text-muted">/ {num(job.requiredQuantity)}</span>}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="bg-light p-3 rounded-3 text-center border">
              <small className="text-muted d-block fw-bold mb-1">{isClearance ? 'نوع العملية' : 'المتبقي'}</small>
              <div className={`fw-black fs-5 ${isClearance ? 'text-purple' : 'text-primary'}`}>
                {isClearance ? 'تصفية 🔄' : num(remaining)}
              </div>
            </div>
          </div>
        </div>

        {/* عرض الكمية المحددة */}
        <div className="mb-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <label className="form-label fw-bold mb-0">كمية الإضافة</label>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-pill px-2.5 py-0.5 fw-bold"
              onClick={() => setCustomMode(!customMode)}
            >
              {customMode ? 'الرجوع للأزرار السريعة' : <><Hash size={14} /> إدخال رقم مخصص</>}
            </button>
          </div>

          {customMode ? (
            <input
              type="number"
              inputMode="numeric"
              autoFocus
              className="form-control form-control-lg text-center fw-black fs-1 py-3"
              placeholder="0"
              value={amount || ''}
              onChange={(e) => handlePick(e.target.value)}
            />
          ) : (
            <div className={`p-3 bg-light rounded-3 text-center border border-2 ${isClearance ? 'border-purple-subtle' : 'border-primary-subtle'}`}>
              <span className={`display-5 fw-black ${isClearance ? 'text-purple' : 'text-primary'}`}>+{num(amount)}</span>
              <span className="small text-muted ms-2 fw-bold">قطعة</span>
            </div>
          )}
        </div>

        {/* الأزرار السريعة */}
        <div className="mb-3">
          <div className="row g-2">
            {(state.quickAdds || [10, 25, 50, 100]).map((val) => (
              <div key={val} className="col-3">
                <button
                  type="button"
                  className={`quick-add-btn w-100 ${amount === val ? 'active' : ''}`}
                  onClick={() => handlePick(val)}
                >
                  +{num(val)}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* تفاصيل المعاينة الفورية */}
        {amount > 0 && (
          <div className="card bg-light border rounded-3 p-3 mb-3">
            <div className="d-flex justify-content-between mb-1 small">
              <span className="text-secondary">الإنتاج الحالي:</span>
              <span className="fw-bold">{num(current)} قطعة</span>
            </div>
            <div className="d-flex justify-content-between mb-1 small text-primary">
              <span className="fw-bold">الإضافة الجديدة:</span>
              <span className="fw-black">+{num(amount)} قطعة</span>
            </div>
            <div className="d-flex justify-content-between pt-2 border-top fw-bold">
              <span>الإجمالي بعد الإضافة:</span>
              <span className="fs-5 fw-black text-dark">{num(current + amount)} قطعة</span>
            </div>
          </div>
        )}

        {/* زر التأكيد */}
        <button
          type="button"
          disabled={amount <= 0}
          className={isClearance ? 'btn w-100 py-3 fs-5 text-white fw-black rounded-3' : 'btn-primary-custom w-100 py-3 fs-5'}
          style={isClearance ? { backgroundColor: '#7e22ce', borderColor: '#7e22ce' } : {}}
          onClick={handleConfirm}
        >
          تأكيد الإضافة الآن
        </button>
      </div>
    </div>
  );
}
