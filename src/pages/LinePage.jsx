import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Layers, Pencil, RefreshCw } from 'lucide-react';
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
  const [addClearanceMode, setAddClearanceMode] = useState(false);
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
          <div className="d-flex gap-1.5">
            <button
              type="button"
              className="btn btn-sm btn-primary rounded-pill px-2.5 py-1.5 fw-bold d-inline-flex align-items-center gap-1"
              onClick={() => {
                setAddClearanceMode(false);
                setShowAddModal(true);
              }}
            >
              <Plus size={15} /> إضافة شنطة
            </button>
            <button
              type="button"
              className="btn btn-sm btn-purple bg-purple text-white rounded-pill px-2.5 py-1.5 fw-bold d-inline-flex align-items-center gap-1"
              style={{ backgroundColor: '#7e22ce', borderColor: '#7e22ce' }}
              onClick={() => {
                setAddClearanceMode(true);
                setShowAddModal(true);
              }}
            >
              <RefreshCw size={14} /> تصفية
            </button>
          </div>
        </div>

        {lineJobs.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted bg-white mb-3">
            <Layers size={40} className="mx-auto mb-2 text-secondary opacity-50" />
            <h5 className="fw-bold mb-1">لا توجد شنط على هذا الخط اليوم</h5>
            <p className="small text-muted mb-3">ابدأ بإضافة أول شنطة للإنتاج على هذا الخط</p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-primary px-3 py-2 rounded-3 fw-black"
                onClick={() => {
                  setAddClearanceMode(false);
                  setShowAddModal(true);
                }}
              >
                إضافة شنطة طريحة
              </button>
              <button
                type="button"
                className="btn text-white px-3 py-2 rounded-3 fw-black"
                style={{ backgroundColor: '#7e22ce' }}
                onClick={() => {
                  setAddClearanceMode(true);
                  setShowAddModal(true);
                }}
              >
                إضافة تصفية 🔄
              </button>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2 mb-3">
            {lineJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        <div className="row g-2 mt-2">
          <div className="col-7">
            <button
              type="button"
              className="btn btn-outline-dashed w-100 py-3 rounded-3 fw-black d-flex align-items-center justify-content-center gap-2 border-2 bg-white"
              onClick={() => {
                setAddClearanceMode(false);
                setShowAddModal(true);
              }}
            >
              <Plus size={20} /> إضافة شنطة جديدة
            </button>
          </div>
          <div className="col-5">
            <button
              type="button"
              className="btn btn-outline-purple w-100 py-3 rounded-3 fw-black d-flex align-items-center justify-content-center gap-1.5 border-2 bg-white"
              onClick={() => {
                setAddClearanceMode(true);
                setShowAddModal(true);
              }}
            >
              <RefreshCw size={18} /> إضافة تصفية
            </button>
          </div>
        </div>
      </div>

      <AddJobModal
        lineId={line}
        show={showAddModal}
        initialIsClearance={addClearanceMode}
        onClose={() => {
          setShowAddModal(false);
          setAddClearanceMode(false);
        }}
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
