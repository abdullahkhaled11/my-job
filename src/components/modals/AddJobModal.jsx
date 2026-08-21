import { useState, useEffect } from 'react';
import { Plus, X, Layers, RefreshCw } from 'lucide-react';
import { useProduction } from '../../context/ProductionContext';
import { toast } from 'sonner';

export function AddJobModal({ lineId, show, onClose, initialIsClearance = false }) {
  const { state, addJob, addBagType, getLineName, getBagTypesForLine } = useProduction();
  const [isClearance, setIsClearance] = useState(false);
  const [bagTypeId, setBagTypeId] = useState('');
  const [requiredQuantity, setRequiredQuantity] = useState('');
  const [newBag, setNewBag] = useState(null);

  useEffect(() => {
    if (show) {
      setIsClearance(!!initialIsClearance);
    }
  }, [show, initialIsClearance]);

  if (!show) return null;

  const lineName = getLineName(lineId);
  const lineBagTypes = getBagTypesForLine(lineId);

  const reset = () => {
    setBagTypeId('');
    setRequiredQuantity('');
    setNewBag(null);
    setIsClearance(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    if (isClearance) {
      addJob({
        lineId: Number(lineId),
        bagTypeId: null,
        requiredQuantity: 0,
        isClearance: true,
      });
      toast.success('تم إضافة تصفية جديدة لـ ' + lineName + ' بنجاح 🔄');
      handleClose();
      return;
    }

    if (!bagTypeId) {
      toast.error('يرجى اختيار نوع الشنطة');
      return;
    }

    const qty = Number(requiredQuantity);
    if (!qty || qty <= 0) {
      toast.error('يرجى إدخال كمية صحيحة أكبر من صفر');
      return;
    }

    addJob({
      lineId: Number(lineId),
      bagTypeId,
      requiredQuantity: Math.floor(qty),
      isClearance: false,
    });
    toast.success('تم إضافة الشنطة لبدء الإنتاج بنجاح ✓');
    handleClose();
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-content-custom">
        <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
          <div>
            <h5 className="fw-black mb-0">{isClearance ? 'إضافة تصفية لـ ' + lineName : 'إضافة شنطة جديدة لـ ' + lineName}</h5>
            <small className="text-muted fw-bold">اختر نوع العملية المطلوبة</small>
          </div>
          <button type="button" className="btn btn-light btn-sm rounded-circle p-1.5" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* أزرار التنقل بين طريحة جديدة وتصفية */}
        <div className="btn-group w-100 mb-3" role="group">
          <button
            type="button"
            className={`btn fw-bold py-2 ${!isClearance ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setIsClearance(false)}
          >
            <Layers size={16} className="me-1" /> طريحة جديدة (تارجت)
          </button>
          <button
            type="button"
            className={`btn fw-bold py-2 ${isClearance ? 'btn-purple bg-purple text-white' : 'btn-outline-secondary'}`}
            style={isClearance ? { backgroundColor: '#7e22ce', borderColor: '#7e22ce' } : {}}
            onClick={() => setIsClearance(true)}
          >
            <RefreshCw size={16} className="me-1" /> تصفية (بدون تارجت)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {!isClearance ? (
            <>
              {/* نوع الشنطة الخاص بـ lineId المحدد */}
              <div>
                <label className="form-label fw-bold small">نوع الشنطة (خاص بـ {lineName})</label>
                <select
                  className="form-select form-select-lg text-end fw-bold"
                  value={bagTypeId}
                  onChange={(e) => setBagTypeId(e.target.value)}
                >
                  <option value="">-- اختر نوع الشنطة لـ {lineName} --</option>
                  {lineBagTypes.map((b) => (
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
                    <Plus size={16} /> إضافة نوع شنطة جديد لـ {lineName}
                  </button>
                ) : (
                  <div className="input-group input-group-sm mt-2">
                    <input
                      type="text"
                      autoFocus
                      className="form-control"
                      placeholder={`اسم الشنطة لـ ${lineName}`}
                      value={newBag}
                      onChange={(e) => setNewBag(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const id = addBagType(newBag, lineId);
                        if (!id) {
                          toast.error('أدخل اسم الشنطة');
                          return;
                        }
                        setBagTypeId(id);
                        setNewBag(null);
                        toast.success(`تمت إضافة الشنطة لـ ${lineName} بنجاح`);
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
            </>
          ) : (
            <div className="p-3.5 bg-purple-subtle border border-purple-subtle rounded-3 text-purple text-center py-4">
              <RefreshCw size={36} className="mb-2 mx-auto text-purple opacity-75" />
              <h6 className="fw-black mb-1 fs-5">إضافة «تصفية» جديدة لـ {lineName}</h6>
              <p className="small mb-0 leading-normal opacity-90 px-2">
                التصفية ليس لها نوع شنطة محدد ولا كمية مطلوبة. سيتم إضافتها وتجميع أعداد أي قطع متبقية تخرج من وقت لآخر مباشرة إلى إجمالي إنتاج {lineName}.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className={isClearance ? 'btn w-100 py-3 fs-5 fw-black text-white' : 'btn-primary-custom w-100 py-3 fs-5'}
              style={isClearance ? { backgroundColor: '#7e22ce', borderColor: '#7e22ce' } : {}}
            >
              {isClearance ? 'تأكيد إضافة تصفية 🔄' : 'بدء الإنتاج الآن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
