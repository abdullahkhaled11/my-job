import { useState } from 'react';
import { Plus, Pencil, Trash2, RotateCcw, AlertTriangle, Check, X } from 'lucide-react';
import { Header } from '../components/common/Header';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { useProduction } from '../context/ProductionContext';
import { num } from '../utils/formatters';
import { toast } from 'sonner';

function EntitySection({ title, items, addLabel, placeholder, onAdd, onUpdate, onRemove }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [deletingItem, setDeletingItem] = useState(null);

  const handleAdd = (e) => {
    e?.preventDefault();
    if (!newName.trim()) {
      toast.error('أدخل الاسم أولاً');
      return;
    }
    onAdd(newName);
    setNewName('');
    setIsAdding(false);
    toast.success('تمت الإضافة بنجاح ✓');
  };

  const handleSaveEdit = (e) => {
    e?.preventDefault();
    if (!editName.trim()) {
      toast.error('أدخل الاسم أولاً');
      return;
    }
    if (editingItem) {
      onUpdate(editingItem.id, editName);
      setEditingItem(null);
      toast.success('تم التعديل بنجاح ✓');
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-3">
      <div className="d-flex align-items-center justify-content-between pb-2 border-bottom mb-3">
        <h3 className="h6 fw-black mb-0 text-dark">{title}</h3>
        <span className="badge bg-secondary-subtle text-secondary rounded-pill fw-bold">
          {items.length}
        </span>
      </div>

      <div className="d-flex flex-column gap-2 mb-3">
        {items.length === 0 ? (
          <p className="small text-muted text-center py-2 mb-0">لا توجد شنط خاصة بهذا الخط بعد</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-2.5 bg-light rounded-3 d-flex align-items-center justify-content-between border"
            >
              {editingItem?.id === item.id ? (
                <form onSubmit={handleSaveEdit} className="d-flex gap-1 w-100">
                  <input
                    type="text"
                    autoFocus
                    className="form-control form-control-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <button type="submit" className="btn btn-sm btn-primary p-1 px-2">
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary p-1 px-2"
                    onClick={() => setEditingItem(null)}
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <>
                  <span className="fw-bold text-dark">{item.name}</span>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-light btn-sm p-1.5 text-secondary rounded-2"
                      title="تعديل"
                      onClick={() => {
                        setEditingItem(item);
                        setEditName(item.name);
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-light btn-sm p-1.5 text-danger rounded-2"
                      title="حذف"
                      onClick={() => setDeletingItem(item)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleAdd} className="d-flex gap-2">
          <input
            type="text"
            autoFocus
            className="form-control"
            placeholder={placeholder}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="btn btn-primary px-3 fw-bold">
            حفظ
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary px-3"
            onClick={() => setIsAdding(false)}
          >
            إلغاء
          </button>
        </form>
      ) : (
        <button
          type="button"
          className="btn btn-outline-primary w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-1 border-dashed"
          onClick={() => setIsAdding(true)}
        >
          <Plus size={18} /> {addLabel}
        </button>
      )}

      <ConfirmModal
        show={!!deletingItem}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف «${deletingItem?.name}»؟ ستظل السجلات القديمة محتفظة بالاسم.`}
        onConfirm={() => {
          if (deletingItem) onRemove(deletingItem.id);
          setDeletingItem(null);
          toast.success('تم الحذف بنجاح ✓');
        }}
        onClose={() => setDeletingItem(null)}
      />
    </div>
  );
}

export function SettingsPage() {
  const {
    state,
    LINES,
    getLineName,
    addBagType,
    updateBagType,
    removeBagType,
    setQuickAdds,
    clearAll,
    resetToSeed,
  } = useProduction();

  const [quickInputs, setQuickInputs] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentQuick = quickInputs ?? (state.quickAdds || [10, 25, 50, 100]).map(String);

  const handleSaveQuickAdds = (e) => {
    e?.preventDefault();
    const numbers = currentQuick.map((v) => Math.floor(Number(v)));
    if (numbers.some((v) => !v || v <= 0)) {
      toast.error('يرجى إدخال أرقام صحيحة أكبر من صفر لجميع الأزرار');
      return;
    }
    setQuickAdds(numbers);
    setQuickInputs(null);
    toast.success('تم حفظ الأزرار السريعة بنجاح ✓');
  };

  return (
    <div>
      <Header
        title="الإعدادات والبيانات الأساسية"
        subtitle="إدارة أنواع الشنط لكل خط وتخصيص التطبيق"
      />

      <div className="container px-3 pb-5">
        {/* أنواع الشنط مقسمة حسب كل خط */}
        <h2 className="h6 fw-black text-secondary mb-2">أنواع الشنط المخصصة لكل خط:</h2>
        {LINES.map((lineId) => {
          const lineName = getLineName(lineId);
          const lineBagTypes = getBagTypesForLine(lineId);

          return (
            <EntitySection
              key={lineId}
              title={`أنواع شنط ${lineName}`}
              items={lineBagTypes}
              addLabel={`إضافة نوع شنطة جديد لـ ${lineName}`}
              placeholder={`اسم الشنطة لـ ${lineName}`}
              onAdd={(name) => addBagType(name, lineId)}
              onUpdate={updateBagType}
              onRemove={removeBagType}
            />
          );
        })}

        {/* تخصيص أزرار الزيادة السريعة */}
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-3">
          <h3 className="h6 fw-black mb-1 text-dark">أزرار الإضافة السريعة</h3>
          <p className="small text-muted mb-3">
            القيم الحالية: {(state.quickAdds || []).map((v) => `+${num(v)}`).join(' · ')}
          </p>

          <form onSubmit={handleSaveQuickAdds}>
            <div className="row g-2 mb-3">
              {currentQuick.map((val, idx) => (
                <div key={idx} className="col-3">
                  <input
                    type="number"
                    inputMode="numeric"
                    className="form-control text-center fw-black fs-5 py-2.5"
                    value={val}
                    onChange={(e) => {
                      const next = [...currentQuick];
                      next[idx] = e.target.value;
                      setQuickInputs(next);
                    }}
                  />
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2.5 fw-black rounded-3">
              حفظ أزرار الإضافة السريعة
            </button>
          </form>
        </div>

        {/* خيارات مسح وإعادة تعيين البيانات */}
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-3 border-start border-4 border-danger">
          <h3 className="h6 fw-black mb-1 text-danger d-flex align-items-center gap-1">
            <AlertTriangle size={18} /> إدارة البيانات المحلية
          </h3>
          <p className="small text-muted mb-3">
            البيانات مخزنة على هذا المتصفح محليًا. يمكنك مسحها أو استعادة البيانات التوضيحية الافتراضية.
          </p>

          <div className="d-flex flex-column gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
              onClick={() => setShowResetConfirm(true)}
            >
              <RotateCcw size={16} /> استعادة البيانات التجريبية الافتراضية
            </button>

            <button
              type="button"
              className="btn btn-outline-danger py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 size={16} /> مسح جميع البيانات نهائيًا
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={showResetConfirm}
        title="استعادة البيانات التجريبية"
        message="هل تريد إعادة ضبط التطبيق للبيانات التجريبية الافتراضية لجميع الخطوط؟"
        confirmText="استعادة الآن"
        isDanger={false}
        onConfirm={() => {
          resetToSeed();
          toast.success('تمت استعادة البيانات التجريبية بنجاح ✓');
        }}
        onClose={() => setShowResetConfirm(false)}
      />

      <ConfirmModal
        show={showClearConfirm}
        title="مسح جميع البيانات نهائيًا"
        message="تحذير: سيتم حذف جميع سجلات الإنتاج والشنط نهائيًا ولا يمكن التراجع عن هذه الخطوة."
        confirmText="مسح نهائي"
        isDanger={true}
        onConfirm={() => {
          clearAll();
          toast.success('تم مسح جميع البيانات بنجاح');
        }}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
