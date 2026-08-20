import { useState } from 'react';
import { Plus, History, ChevronDown, ChevronUp, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import {
  useProduction,
  jobCurrent,
  jobStatus,
  jobRemaining,
  jobProgress,
  sortedEntries,
  entryRunningTotal,
} from '../../context/ProductionContext';
import { formatTime, num } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { AddProductionModal } from '../modals/AddProductionModal';
import { EditEntryModal } from '../modals/EditEntryModal';
import { ConfirmModal } from '../modals/ConfirmModal';
import { toast } from 'sonner';

export function JobCard({ job }) {
  const { updateEntry, removeEntry, removeJob, getLineName } = useProduction();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [showDeleteJobModal, setShowDeleteJobModal] = useState(false);

  const current = jobCurrent(job);
  const status = jobStatus(job);
  const progress = jobProgress(job);
  const remaining = jobRemaining(job);
  const entries = sortedEntries(job);
  const lastEntry = entries[0];
  const lineName = getLineName(job.lineId);

  const handleSaveEdit = (entryId, newQty) => {
    updateEntry(job.id, entryId, newQty);
    toast.success('تم تعديل العملية بنجاح ✓');
  };

  const handleConfirmDeleteEntry = () => {
    if (deletingEntry) {
      removeEntry(job.id, deletingEntry.id);
      toast.success('تم حذف العملية بنجاح ✓');
    }
  };

  const handleConfirmDeleteJob = () => {
    removeJob(job.id);
    toast.success('تم حذف الشنطة بالكامل وكأنها لم تضف ✓');
  };

  return (
    <div className="job-card">
      {/* رأس البطاقة */}
      <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
        <div>
          <h3 className="h6 fw-black mb-0 text-dark">{job.bagTypeNameSnapshot}</h3>
        </div>

        <div className="d-flex align-items-center gap-2">
          <StatusBadge status={status} />
          <button
            type="button"
            className="btn btn-outline-danger btn-sm p-1.5 rounded-2 d-flex align-items-center justify-content-center ms-1"
            title="حذف الشنطة بالكامل"
            onClick={() => setShowDeleteJobModal(true)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* الأرقام والكميات */}
      <div className="d-flex align-items-baseline justify-content-between mt-3 mb-1">
        <div>
          <span className="fs-2 fw-black text-dark">{num(current)}</span>
          <span className="text-muted fw-bold fs-6"> / {num(job.requiredQuantity)}</span>
          <span className="small text-muted ms-1">قطعة</span>
        </div>
        <div className="text-end">
          <span className={`fw-bold small ${status === 'completed' ? 'text-success' : 'text-primary'}`}>
            {status === 'completed' ? 'تم الإنتاج بالكامل ✓' : `المتبقي: ${num(remaining)} قطعة`}
          </span>
        </div>
      </div>

      {/* شريط التقدم العصري */}
      <div className="my-2">
        <div className="custom-progress-track">
          <div
            className={`custom-progress-fill ${status === 'completed' ? 'completed' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center mt-1">
          <span className="small text-muted fw-semibold">نسبة الإنجاز</span>
          <span className="small fw-black text-dark">{num(progress)}%</span>
        </div>
      </div>

      {/* آخر عملية إنتاج */}
      <div className="bg-light p-2.5 rounded-3 mb-3 small text-secondary border">
        {lastEntry ? (
          <div className="d-flex justify-content-between align-items-center">
            <span>آخر إضافة: <strong className="text-dark">+{num(lastEntry.quantity)} قطعة</strong></span>
            <span className="text-muted">{formatTime(lastEntry.timestamp)}</span>
          </div>
        ) : (
          <span>لا توجد عمليات إنتاج مسجلة اليوم</span>
        )}
        {job.completedAt && (
          <div className="mt-1 text-success fw-bold d-flex align-items-center gap-1">
            <CheckCircle2 size={14} /> اكتملت الساعة {formatTime(job.completedAt)}
          </div>
        )}
      </div>

      {/* أزرار الإجراءات */}
      <div className="d-flex gap-2">
        {status === 'completed' ? (
          <div className="status-badge completed flex-grow-1 py-3 justify-content-center fs-6 rounded-3">
            <CheckCircle2 size={18} /> تم اكتمال الإنتاج بنجاح
          </div>
        ) : (
          <button
            type="button"
            className="btn-primary-custom flex-grow-1 py-3"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} /> إضافة إنتاج
          </button>
        )}

        <button
          type="button"
          className="btn btn-outline-secondary px-3 py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-1"
          title="سجل العمليات"
          onClick={() => setShowHistory(!showHistory)}
        >
          <History size={18} />
          {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* سجل العمليات التفصيلي للشنطة */}
      {showHistory && (
        <div className="mt-3 pt-3 border-top">
          <h6 className="fw-black mb-2 fs-6">سجل العمليات لهذه الشنطة ({entries.length})</h6>
          {entries.length === 0 ? (
            <p className="small text-muted mb-0">لا توجد عمليات مضافة بعد</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-2.5 bg-light rounded-3 d-flex align-items-center justify-content-between border"
                >
                  <div>
                    <div className="fw-black text-dark">
                      +{num(entry.quantity)} <span className="small text-muted fw-normal">قطعة</span>
                      <span className="small text-muted ms-2">({formatTime(entry.timestamp)})</span>
                    </div>
                    <small className="text-secondary">
                      الإجمالي التراكمي: {num(entryRunningTotal(job, entry.id))} قطعة
                    </small>
                  </div>

                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-light btn-sm p-1.5 text-secondary rounded-2"
                      title="تعديل"
                      onClick={() => setEditingEntry(entry)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-light btn-sm p-1.5 text-danger rounded-2"
                      title="حذف"
                      onClick={() => setDeletingEntry(entry)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddProductionModal
        job={job}
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <EditEntryModal
        show={!!editingEntry}
        entry={editingEntry}
        maxAllowed={editingEntry ? job.requiredQuantity - (current - editingEntry.quantity) : 0}
        onSave={handleSaveEdit}
        onClose={() => setEditingEntry(null)}
      />

      <ConfirmModal
        show={!!deletingEntry}
        title="تأكيد حذف العملية"
        message="هل أنت متأكد من رغبتك في حذف عملية الإنتاج هذه؟ سيتم تحديث الإجمالي ونسبة الإنجاز تلقائيًا."
        onConfirm={handleConfirmDeleteEntry}
        onClose={() => setDeletingEntry(null)}
      />

      <ConfirmModal
        show={showDeleteJobModal}
        title="حذف الشنطة بالكامل"
        message={`هل أنت متأكد من رغبتك في حذف شنطة «${job.bagTypeNameSnapshot}» بالكامل من خط ${lineName}؟ لن تظهر الشنطة أو عملياتها وكأنها لم تضف من الأساس.`}
        confirmText="حذف الشنطة"
        isDanger={true}
        onConfirm={handleConfirmDeleteJob}
        onClose={() => setShowDeleteJobModal(false)}
      />
    </div>
  );
}
