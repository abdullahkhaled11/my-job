import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createSeedState, LINES, DEFAULT_LINE_NAMES } from '../data/seedData';
import { todayId, generateUid } from '../utils/formatters';

const STORAGE_KEY = 'bag-factory-production-v2';

const ProductionContext = createContext(null);

export function jobCurrent(job) {
  if (!job || !job.entries) return 0;
  return job.entries.reduce((sum, e) => sum + (Number(e.quantity) || 0), 0);
}

export function jobStatus(job) {
  const current = jobCurrent(job);
  if (job.requiredQuantity > 0 && current >= job.requiredQuantity) return 'completed';
  if (current > 0) return 'in_progress';
  return 'not_started';
}

export function jobRemaining(job) {
  return Math.max(0, job.requiredQuantity - jobCurrent(job));
}

export function jobProgress(job) {
  if (!job.requiredQuantity || job.requiredQuantity <= 0) return 0;
  return Math.min(100, Math.round((jobCurrent(job) / job.requiredQuantity) * 100));
}

export function sortedEntries(job) {
  if (!job || !job.entries) return [];
  return [...job.entries].sort((a, b) => b.timestamp - a.timestamp);
}

export function entryRunningTotal(job, entryId) {
  if (!job || !job.entries) return 0;
  const asc = [...job.entries].sort((a, b) => a.timestamp - b.timestamp);
  let total = 0;
  for (const e of asc) {
    total += e.quantity;
    if (e.id === entryId) break;
  }
  return total;
}

export function lineTotal(jobs, lineId) {
  return jobs
    .filter((j) => Number(j.lineId) === Number(lineId))
    .reduce((sum, j) => sum + jobCurrent(j), 0);
}

function withRecalc(job) {
  const current = jobCurrent(job);
  const completed = job.requiredQuantity > 0 && current >= job.requiredQuantity;
  const last = [...(job.entries || [])].sort((a, b) => a.timestamp - b.timestamp).at(-1);
  return {
    ...job,
    completedAt: completed ? (job.completedAt ?? last?.timestamp ?? Date.now()) : null,
  };
}

export function ProductionProvider({ children }) {
  const [state, setState] = useState({
    supervisors: [],
    bagTypes: [],
    lineNames: { 1: 'صالح', 2: 'ضياء', 3: 'عائشة', 4: 'كريم' },
    quickAdds: [10, 25, 50, 100],
    jobs: [],
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let next;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      next = raw ? JSON.parse(raw) : createSeedState();
    } catch {
      next = createSeedState();
    }
    // Ensure lineNames is initialized
    if (!next.lineNames) {
      next.lineNames = DEFAULT_LINE_NAMES;
    }
    setState(next);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }, [state, ready]);

  const getLineName = useCallback(
    (lineId) => {
      const id = Number(lineId);
      return state.lineNames?.[id] || DEFAULT_LINE_NAMES[id] || `خط ${id}`;
    },
    [state.lineNames]
  );

  const mutateJob = useCallback((jobId, fn) => {
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) => (j.id === jobId ? withRecalc(fn(j)) : j)),
    }));
  }, []);

  const updateLineName = useCallback((lineId, newName) => {
    const trimmed = newName?.trim();
    if (!trimmed) return;
    const id = Number(lineId);
    setState((prev) => ({
      ...prev,
      lineNames: {
        ...(prev.lineNames || {}),
        [id]: trimmed,
      },
      jobs: prev.jobs.map((j) =>
        Number(j.lineId) === id
          ? { ...j, supervisorNameSnapshot: trimmed }
          : j
      ),
    }));
  }, []);

  const addBagType = useCallback((name) => {
    const trimmed = name?.trim();
    if (!trimmed) return null;
    const id = generateUid();
    setState((prev) => ({
      ...prev,
      bagTypes: [...prev.bagTypes, { id, name: trimmed }],
    }));
    return id;
  }, []);

  const updateBagType = useCallback((id, name) => {
    setState((prev) => ({
      ...prev,
      bagTypes: prev.bagTypes.map((b) =>
        b.id === id ? { ...b, name: name.trim() } : b
      ),
    }));
  }, []);

  const removeBagType = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      bagTypes: prev.bagTypes.filter((b) => b.id !== id),
    }));
  }, []);

  const setQuickAdds = useCallback((values) => {
    setState((prev) => ({ ...prev, quickAdds: values }));
  }, []);

  const addJob = useCallback(
    ({ lineId, bagTypeId, requiredQuantity }) => {
      const id = generateUid();
      const idNum = Number(lineId);
      const name = state.lineNames?.[idNum] || DEFAULT_LINE_NAMES[idNum] || `خط ${idNum}`;

      setState((prev) => {
        const bag = prev.bagTypes.find((b) => b.id === bagTypeId);
        const job = {
          id,
          dayId: todayId(),
          lineId: idNum,
          supervisorId: null,
          supervisorNameSnapshot: name,
          bagTypeId,
          bagTypeNameSnapshot: bag?.name ?? 'غير محدد',
          requiredQuantity: Number(requiredQuantity) || 0,
          createdAt: Date.now(),
          completedAt: null,
          entries: [],
        };
        return {
          ...prev,
          jobs: [...prev.jobs, job],
        };
      });
      return id;
    },
    [state.lineNames]
  );

  const addEntry = useCallback(
    (jobId, quantity) => {
      const qty = Math.floor(Number(quantity));
      if (!qty || qty <= 0) return null;
      const entryId = generateUid();
      mutateJob(jobId, (job) => ({
        ...job,
        entries: [
          ...(job.entries || []),
          { id: entryId, jobId, quantity: qty, timestamp: Date.now() },
        ],
      }));
      return entryId;
    },
    [mutateJob]
  );

  const updateEntry = useCallback(
    (jobId, entryId, quantity) => {
      const qty = Math.floor(Number(quantity));
      mutateJob(jobId, (job) => ({
        ...job,
        completedAt: null,
        entries: (job.entries || []).map((e) =>
          e.id === entryId ? { ...e, quantity: qty } : e
        ),
      }));
    },
    [mutateJob]
  );

  const removeEntry = useCallback(
    (jobId, entryId) => {
      mutateJob(jobId, (job) => ({
        ...job,
        completedAt: null,
        entries: (job.entries || []).filter((e) => e.id !== entryId),
      }));
    },
    [mutateJob]
  );

  const removeJob = useCallback((jobId) => {
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.filter((j) => j.id !== jobId),
    }));
  }, []);

  const clearAll = useCallback(() => {
    const resetState = {
      supervisors: [],
      bagTypes: [],
      lineNames: DEFAULT_LINE_NAMES,
      quickAdds: [10, 25, 50, 100],
      jobs: [],
    };
    setState(resetState);
  }, []);

  const resetToSeed = useCallback(() => {
    const seeded = createSeedState();
    setState(seeded);
  }, []);

  const value = useMemo(
    () => ({
      state,
      ready,
      LINES,
      DEFAULT_LINE_NAMES,
      getLineName,
      updateLineName,
      addBagType,
      updateBagType,
      removeBagType,
      setQuickAdds,
      addJob,
      removeJob,
      addEntry,
      updateEntry,
      removeEntry,
      clearAll,
      resetToSeed,
    }),
    [
      state,
      ready,
      getLineName,
      updateLineName,
      addBagType,
      updateBagType,
      removeBagType,
      setQuickAdds,
      addJob,
      removeJob,
      addEntry,
      updateEntry,
      removeEntry,
      clearAll,
      resetToSeed,
    ]
  );

  return (
    <ProductionContext.Provider value={value}>
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  const context = useContext(ProductionContext);
  if (!context) {
    throw new Error('useProduction must be used within a ProductionProvider');
  }
  return context;
}

export function useDayJobs(dayId) {
  const { state } = useProduction();
  return useMemo(
    () => (state.jobs || []).filter((j) => j.dayId === dayId),
    [state.jobs, dayId]
  );
}
