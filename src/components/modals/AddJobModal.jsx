import { useState } from 'react';
import { Plus, X, User } from 'lucide-react';
import { useProduction } from '../../context/ProductionContext';
import { toast } from 'sonner';

export function AddJobModal({ lineId, show, onClose }) {
  const { state, addJob, addBagType, getLineName } = useProduction();
  const [bagTypeId, setBagTypeId] = useState('');
  const [requiredQuantity, setRequiredQuantity] = useState('');
  const [newBag, setNewBag] = useState(null);

  if (!show) return null;

  const lineName = getLineName(lineId);
  const currentSupervisorId = state.lineSupervisors?.[lineId];
  const currentSupervisor = state.supervisors.find((s) => s.id === currentSupervisorId);
  const supervisorName = currentSupervisor?.name || lineName;

  const reset = () => {
    setBagTypeId('');
    setRequiredQuantity('');
    setNewBag(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const qty = Number(requiredQuantity);
    if (!bagTypeId) {
      toast.error('يرجى اختيار نوع الشنطة');
      return;
    }
    if (!qty || qty <= 0) {
      toast.error('يرجى إدخال كمية صحيحة أكبر من صفر');
      return;
    }

    addJob({
      lineId: Number(lineId),
      bagTypeId,
      requiredQuantity: Math.floor(qty),
    });

    toast.success('تم إضافة الشنطة لبدء الإنتاج بنجاح ✓');
    handleClose();
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-content-custom">
        <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
          <div>
            <h5 className="fw-black mb-0">إضافة شنطة جديدة</h5>
            <small className="text-muted fw-bold">خط {lineName}</small>
          </div>
          <button type="button" className="btn btn-light btn-sm rounded-circle p-1.5" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* عرض مشرف الخط المسئول تلقائياً */}
        <div className="p-3 bg-light rounded-3 mb-3 border d-flex align-items-center gap-2 text-dark">
          <User size={18} className="text-primary" />
          <div className="small">
            <span className="text-muted d-block">المشرف المسئول على خط {lineName}:</span>
            <strong className="fs-6 fw-black">{supervisorName}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {/* نوع الشنطة */}
          <div>
            <label className="form-label fw-bold small">نوع الشنطة</label>
            <select
              className="form-select form-select-lg text-end fw-bold"
              value={bagTypeId}
              onChange={(e) => setBagTypeId(e.target.value)}
            >
              <option value="">-- اختر نوع الشنطة --</option>
              {state.bagTypes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {newBag === null ? (
              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none px-0 text-primary fw-bold mt-1 d-inline-flex align-items-center gap-1"
                onClick={() => setNewBag('')}
              >
                <Plus size={16} /> إضافة نوع شنطة جديد للقائمة
              </button>
            ) : (
              <div className="input-group input-group-sm mt-2">
                <input
                  type="text"
                  autoFocus
                  className="form-control"
                  placeholder="اسم نوع الشنطة"
                  value={newBag}
                  onChange={(e) => setNewBag(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const id = addBagType(newBag);
                    if (!id) {
                      toast.error('أدخل اسم الشنطة');
                      return;
                    }
                    setBagTypeId(id);
                    setNewBag(null);
                    toast.success('تمت إضافة نوع الشنطة بنجاح');
                  }}
                >
                  حفظ
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setNewBag(null)}
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>

          {/* الكمية المطلوبة */}
          <div>
            <label className="form-label fw-bold small">الكمية المطلوبة (قطعة)</label>
            <input
              type="number"
              inputMode="numeric"
              className="form-control form-control-lg text-center fw-black fs-2 py-2"
              placeholder="مثال: 800"
              value={requiredQuantity}
              onChange={(e) => setRequiredQuantity(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button type="submit" className="btn-primary-custom w-100 py-3 fs-5">
              بدء الإنتاج الآن
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
