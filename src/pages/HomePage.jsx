import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Plus, Layers, Pencil, RefreshCw } from 'lucide-react';
import { Header } from '../components/common/Header';
import { JobCard } from '../components/production/JobCard';
import { AddJobModal } from '../components/modals/AddJobModal';
import { RenameLineModal } from '../components/modals/RenameLineModal';
import { useProduction, useDayJobs, lineTotal } from '../context/ProductionContext';
import { todayId, formatDayId, num } from '../utils/formatters';

export function HomePage() {
  const { ready, LINES, getLineName, updateLineName } = useProduction();
  const dayId = todayId();
  const jobs = useDayJobs(dayId);
  const [activeAddLine, setActiveAddLine] = useState(null);
  const [addClearanceMode, setAddClearanceMode] = useState(false);
  const [renamingLine, setRenamingLine] = useState(null);

  return (
    <div>
      <Header
        title="متابعة خطوط الإنتاج"
        subtitle={`اليوم — ${formatDayId(dayId)}`}
      />

      <div className="container px-3 pb-4">
        {!ready ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2" role="status" />
            <p className="text-muted fw-bold">جارٍ تحميل بيانات الإنتاج…</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {LINES.map((lineId) => {
              const lineJobs = jobs.filter((j) => Number(j.lineId) === Number(lineId));
              const totalLineQty = lineTotal(jobs, lineId);
              const lineName = getLineName(lineId);

              return (
                <section key={lineId} className="production-line-section">
                  {/* رأس الخط ورابط التفاصيل - الكارد الموحد */}
                  <Link to={`/line/${lineId}`} className="line-summary-card mb-3">
                    <div className="w-100">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 fw-black">
                            خط {lineId}
                          </span>
                          <h2 className="h5 fw-black mb-0 text-dark">
                            {lineName}
                          </h2>
                          <button
                            type="button"
                            className="btn btn-sm btn-light text-secondary p-1.5 rounded-circle border-0 d-inline-flex align-items-center justify-content-center ms-1"
                            title="تعديل اسم الخط"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setRenamingLine(lineId);
                            }}
                          >
                            <Pencil size={15} />
                          </button>
                        </div>

                        <div className="p-2 rounded-circle bg-light text-secondary d-flex align-items-center justify-content-center">
                          <ChevronLeft size={20} />
                        </div>
                      </div>

                      <div className="mt-2">
                        <small className="text-muted fw-semibold d-block">إجمالي إنتاج الخط اليوم</small>
                        <div className="fs-2 fw-black text-primary lh-1 mt-1">
                          {num(totalLineQty)}{' '}
                          <span className="fs-6 fw-bold text-muted">قطعة</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* قائمة شنط الخط */}
                  <div className="jobs-list">
                    {lineJobs.length === 0 ? (
                      <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-muted bg-white mb-2">
                        <Layers size={32} className="mx-auto mb-2 text-secondary opacity-50" />
                        <p className="small fw-bold mb-0">لا توجد شنط على هذا الخط اليوم</p>
                      </div>
                    ) : (
                      lineJobs.map((job) => <JobCard key={job.id} job={job} />)
                    )}
                  </div>

                  {/* أزرار إضافة طريحة جديدة أو تصفية */}
                  <div className="row g-2 mt-2">
                    <div className="col-7">
                      <button
                        type="button"
                        className="btn btn-outline-dashed w-100 py-2.5 d-flex align-items-center justify-content-center gap-1.5 small"
                        onClick={() => {
                          setAddClearanceMode(false);
                          setActiveAddLine(lineId);
                        }}
                      >
                        <Plus size={18} /> إضافة شنطة
                      </button>
                    </div>
                    <div className="col-5">
                      <button
                        type="button"
                        className="btn btn-outline-purple w-100 py-2.5 d-flex align-items-center justify-content-center gap-1.5 small"
                        onClick={() => {
                          setAddClearanceMode(true);
                          setActiveAddLine(lineId);
                        }}
                      >
                        <RefreshCw size={15} /> إضافة تصفية
                      </button>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <AddJobModal
        lineId={activeAddLine || 1}
        show={activeAddLine !== null}
        initialIsClearance={addClearanceMode}
        onClose={() => {
          setActiveAddLine(null);
          setAddClearanceMode(false);
        }}
      />

      <RenameLineModal
        show={renamingLine !== null}
        lineId={renamingLine}
        currentName={renamingLine ? getLineName(renamingLine) : ''}
        onSave={(lineId, newName) => updateLineName(lineId, newName)}
        onClose={() => setRenamingLine(null)}
      />
    </div>
  );
}
