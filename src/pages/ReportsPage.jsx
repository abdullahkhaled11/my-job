import { useState, useMemo } from 'react';
import { Calendar, FileBarChart, CheckCircle2 } from 'lucide-react';
import { Header } from '../components/common/Header';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  useProduction,
  jobCurrent,
  jobRemaining,
  jobProgress,
  jobStatus,
  lineTotal,
} from '../context/ProductionContext';
import { todayId, formatDayId, formatTime, num } from '../utils/formatters';

export function ReportsPage() {
  const { state, LINES, getLineName } = useProduction();
  const [selectedDayId, setSelectedDayId] = useState(todayId());

  const availableDays = useMemo(() => {
    const set = new Set([todayId(), ...(state.jobs || []).map((j) => j.dayId)]);
    return Array.from(set).sort().reverse();
  }, [state.jobs]);

  const currentDayJobs = useMemo(() => {
    return (state.jobs || []).filter((j) => j.dayId === selectedDayId);
  }, [state.jobs, selectedDayId]);

  const grandTotal = useMemo(() => {
    return currentDayJobs.reduce((sum, j) => sum + jobCurrent(j), 0);
  }, [currentDayJobs]);

  return (
    <div>
      <Header
        title="تقارير الإنتاج"
        subtitle={formatDayId(selectedDayId)}
      >
        <div className="bg-white bg-opacity-15 p-3 rounded-3 text-white">
          <small className="opacity-75 d-block fw-bold mb-1">إجمالي إنتاج المصنع لليوم المحدد</small>
          <div className="display-5 fw-black">
            {num(grandTotal)} <span className="fs-6 fw-bold opacity-75">قطعة إجمالية</span>
          </div>
        </div>
      </Header>

      <div className="container px-3 pb-5">
        {/* اختيار اليوم */}
        <div className="mb-3">
          <div className="d-flex align-items-center gap-1 mb-2 text-secondary small fw-bold">
            <Calendar size={16} /> اختر يوم التقرير:
          </div>
          <div className="tabs-scroll-bar">
            {availableDays.map((d) => (
              <button
                key={d}
                type="button"
                className={`btn btn-sm px-3 py-2 rounded-pill fw-bold text-nowrap flex-shrink-0 ${
                  d === selectedDayId ? 'btn-primary-custom shadow-sm' : 'btn-light border text-dark'
                }`}
                onClick={() => setSelectedDayId(d)}
              >
                {d === todayId() ? 'اليوم' : formatDayId(d)}
              </button>
            ))}
          </div>
        </div>

        {/* تفاصيل الخطوط لليوم المختار */}
        <div className="d-flex flex-column gap-3">
          {LINES.map((lineId) => {
            const lineJobs = currentDayJobs.filter((j) => Number(j.lineId) === Number(lineId));
            const totalForLine = lineTotal(currentDayJobs, lineId);
            const lineName = getLineName(lineId);

            return (
              <div key={lineId} className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="d-flex align-items-center justify-content-between pb-2 border-bottom mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 fw-bold">
                      خط {lineId}
                    </span>
                    <h3 className="h6 fw-black mb-0">{lineName}</h3>
                  </div>
                  <span className="small text-muted fw-bold">
                    {lineJobs.length} {lineJobs.length === 1 ? 'شنطة' : 'شنط'}
                  </span>
                </div>

                {lineJobs.length === 0 ? (
                  <p className="small text-muted text-center py-3 mb-0">لا يوجد إنتاج مسجل على هذا الخط في هذا اليوم</p>
                ) : (
                  <div className="d-flex flex-column gap-2.5">
                    {lineJobs.map((job) => {
                      const current = jobCurrent(job);
                      const status = jobStatus(job);
                      const progress = jobProgress(job);
                      const remaining = jobRemaining(job);

                      return (
                        <div key={job.id} className="p-3 bg-light rounded-3 border">
                          <div className="d-flex align-items-start justify-content-between mb-2">
                            <div>
                              <h4 className="fw-black fs-6 mb-1 text-dark">{job.bagTypeNameSnapshot}</h4>
                            </div>
                            <StatusBadge status={status} />
                          </div>

                          <div className="d-flex justify-content-between align-items-baseline mb-1">
                            <span className="fw-black fs-5 text-dark">
                              {num(current)} <span className="fs-6 text-muted fw-bold">/ {num(job.requiredQuantity)} قطعة</span>
                            </span>
                            <span className="small fw-bold text-secondary">
                              {status === 'completed' ? 'مكتملة ✓' : `المتبقي: ${num(remaining)}`}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="custom-progress-track my-1.5">
                            <div
                              className={`custom-progress-fill ${status === 'completed' ? 'completed' : ''}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-2 small text-muted">
                            <span>عدد العمليات: {num((job.entries || []).length)}</span>
                            {job.completedAt && (
                              <span className="text-success fw-bold">
                                انتهت {formatTime(job.completedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* إجمالي إنتاج الخط */}
                <div className="d-flex justify-content-between align-items-center pt-3 mt-3 border-top">
                  <span className="fw-bold text-secondary">إجمالي إنتاج {lineName}:</span>
                  <span className="fs-4 fw-black text-primary">
                    {num(totalForLine)} <span className="fs-6 fw-bold text-muted">قطعة</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
