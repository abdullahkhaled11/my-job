import { useState, useMemo } from 'react';
import { Filter, ListOrdered } from 'lucide-react';
import { Header } from '../components/common/Header';
import { useProduction, useDayJobs } from '../context/ProductionContext';
import { todayId, formatTime, num } from '../utils/formatters';

const ALL = 'all';

export function LogPage() {
  const { LINES, getLineName } = useProduction();
  const jobs = useDayJobs(todayId());
  const [selectedLine, setSelectedLine] = useState(ALL);
  const [selectedBag, setSelectedBag] = useState(ALL);
  const [selectedSupervisor, setSelectedSupervisor] = useState(ALL);

  const bagNames = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.bagTypeNameSnapshot).filter(Boolean))),
    [jobs]
  );

  const supervisorNames = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.supervisorNameSnapshot).filter(Boolean))),
    [jobs]
  );

  const entriesList = useMemo(() => {
    return jobs
      .filter((j) => selectedLine === ALL || Number(j.lineId) === Number(selectedLine))
      .filter((j) => selectedBag === ALL || j.bagTypeNameSnapshot === selectedBag)
      .filter((j) => selectedSupervisor === ALL || j.supervisorNameSnapshot === selectedSupervisor)
      .flatMap((j) => (j.entries || []).map((e) => ({ entry: e, job: j })))
      .sort((a, b) => b.entry.timestamp - a.entry.timestamp);
  }, [jobs, selectedLine, selectedBag, selectedSupervisor]);

  return (
    <div>
      <Header
        title="سجل الإنتاج اليومي"
        subtitle="جميع العمليات المسجلة لحظيًا اليوم"
      />

      <div className="container px-3 pb-5">
        {/* فلاتر التصفية */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-white">
          <div className="d-flex align-items-center gap-1 mb-2 text-secondary small fw-bold">
            <Filter size={16} /> تصفية العمليات:
          </div>
          <div className="row g-2">
            <div className="col-6">
              <select
                className="form-select form-select-sm fw-bold rounded-3"
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
              >
                <option value={ALL}>كل الخطوط</option>
                {LINES.map((l) => (
                  <option key={l} value={String(l)}>
                    {getLineName(l)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6">
              <select
                className="form-select form-select-sm fw-bold rounded-3"
                value={selectedBag}
                onChange={(e) => setSelectedBag(e.target.value)}
              >
                <option value={ALL}>كل الشنط</option>
                {bagNames.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* قائمة السجلات */}
        <div className="d-flex flex-column gap-2">
          {entriesList.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted bg-white">
              <ListOrdered size={40} className="mx-auto mb-2 text-secondary opacity-50" />
              <h6 className="fw-bold mb-1">لا توجد عمليات تطابق البحث</h6>
              <p className="small text-muted mb-0">جرّب تغيير فلاتر التصفية بالأعلى</p>
            </div>
          ) : (
            entriesList.map(({ entry, job }) => (
              <div
                key={entry.id}
                className="card border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-row align-items-center justify-content-between"
              >
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-0.5 fw-bold small">
                      {getLineName(job.lineId)}
                    </span>
                    <span className="fw-black text-dark">{job.bagTypeNameSnapshot}</span>
                  </div>
                  <div className="small text-muted fw-bold">
                    {formatTime(entry.timestamp)}
                  </div>
                </div>

                <div className="text-end">
                  <span className="fs-4 fw-black text-primary">+{num(entry.quantity)}</span>
                  <small className="d-block text-muted fw-bold">قطعة</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
