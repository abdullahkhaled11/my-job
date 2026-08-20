import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Layers, Pencil } from 'lucide-react';
import { Header } from '../components/common/Header';
import { JobCard } from '../components/production/JobCard';
import { AddJobModal } from '../components/modals/AddJobModal';
import { RenameLineModal } from '../components/modals/RenameLineModal';
import { useProduction, useDayJobs, lineTotal } from '../context/ProductionContext';
import { todayId, formatDayId, num } from '../utils/formatters';

export function LinePage() {
  const { lineId } = useParams();
  const line = Number(lineId);
  const { ready, getLineName, updateLineName } = useProduction();
  const dayId = todayId();
  const jobs = useDayJobs(dayId);
  const lineJobs = jobs.filter((j) => Number(j.lineId) === line);
  const totalLineQty = lineTotal(jobs, line);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);

  const lineName = getLineName(line);

  return (
    <div>
      <Header
        title={lineName}
        subtitle={formatDayId(dayId)}
        backTo="/"
        action={
          <button
            type="button"
            className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-1 rounded-pill px-2.5 py-1 fw-bold"
            title="تعديل اسم الخط"
            onClick={() => setShowRenameModal(true)}
          >
            <Pencil size={14} />
            <span>تغيير الاسم</span>
          </button>
        }
      >
        <div className="bg-white bg-opacity-15 p-3 rounded-3 text-white">
          <small className="opacity-75 d-block fw-bold mb-1">إجمالي إنتاج الخط اليوم</small>
          <div className="display-5 fw-black">
            {num(totalLineQty)} <span className="fs-6 fw-bold opacity-75">قطعة</span>
          </div>
        </div>
      </Header>

      <div className="container px-3 pb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h6 fw-black text-secondary mb-0">شنط {lineName} ({lineJobs.length})</h2>
          <button
            type="button"
            className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} /> إضافة شنطة
          </button>
        </div>

        {lineJobs.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted bg-white mb-3">
            <Layers size={40} className="mx-auto mb-2 text-secondary opacity-50" />
            <h5 className="fw-bold mb-1">لا توجد شنط على هذا الخط اليوم</h5>
            <p className="small text-muted mb-3">ابدأ بإضافة أول شنطة للإنتاج على هذا الخط</p>
            <button
              type="button"
              className="btn btn-primary px-4 py-2.5 rounded-3 fw-black mx-auto"
              onClick={() => setShowAddModal(true)}
            >
              إضافة شنطة للخط الآن
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2 mb-3">
            {lineJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        <button
          type="button"
          className="btn btn-outline-primary w-100 py-3 rounded-3 fw-black d-flex align-items-center justify-content-center gap-2 border-2 dashed-border bg-white"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} /> إضافة شنطة جديدة لـ {lineName}
        </button>
      </div>

      <AddJobModal
        lineId={line}
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <RenameLineModal
        show={showRenameModal}
        lineId={line}
        currentName={lineName}
        onSave={(lineId, newName) => updateLineName(lineId, newName)}
        onClose={() => setShowRenameModal(false)}
      />
    </div>
  );
}
