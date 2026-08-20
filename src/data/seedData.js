import { todayId, generateUid } from '../utils/formatters';

export const LINES = [1, 2, 3, 4];

export const DEFAULT_LINE_NAMES = {
  1: 'صالح',
  2: 'ضياء',
  3: 'عائشة',
  4: 'كريم',
};

export const STATUS_LABELS = {
  not_started: 'لم تبدأ',
  in_progress: 'جاري العمل',
  completed: 'مكتملة',
};

const SPECS = [
  { line: 1, bag: "شنطة مدارس", required: 800, current: 800 },
  { line: 1, bag: "شنطة سفر", required: 1000, current: 650 },
  { line: 1, bag: "شنطة جيش", required: 800, current: 400 },
  { line: 1, bag: "شنطة تمرين", required: 500, current: 300 },
  { line: 2, bag: "شنطة مدارس", required: 1000, current: 1000 },
  { line: 2, bag: "شنطة تمرين", required: 500, current: 350 },
  { line: 3, bag: "شنطة سفر", required: 800, current: 578 },
  { line: 3, bag: "شنطة مدارس", required: 800, current: 450 },
  { line: 3, bag: "شنطة جيش", required: 1000, current: 700 },
  { line: 4, bag: "شنطة مدارس", required: 800, current: 800 },
  { line: 4, bag: "شنطة سفر", required: 800, current: 600 },
  { line: 4, bag: "شنطة تمرين", required: 500, current: 250 },
  { line: 4, bag: "شنطة جيش", required: 800, current: 400 },
];

function splitQuantity(total) {
  const chunks = [];
  let left = total;
  const options = [100, 75, 50, 25];
  while (left > 0) {
    const pick = options.find((o) => o <= left) ?? left;
    chunks.push(pick);
    left -= pick;
  }
  return chunks;
}

export function createSeedState() {
  const bagTypes = ["شنطة مدارس", "شنطة سفر", "شنطة تمرين", "شنطة جيش"].map((name) => ({
    id: generateUid(),
    name,
  }));

  const lineNames = {
    1: 'صالح',
    2: 'ضياء',
    3: 'عائشة',
    4: 'كريم',
  };

  const dayId = todayId();
  const base = new Date();
  base.setHours(8, 0, 0, 0);
  const start = base.getTime();

  const jobs = SPECS.map((spec, index) => {
    const jobId = generateUid();
    const chunks = splitQuantity(spec.current);
    const createdAt = start + index * 4 * 60 * 1000;
    const entries = chunks.map((quantity, i) => ({
      id: generateUid(),
      jobId,
      quantity,
      timestamp: createdAt + (i + 1) * 22 * 60 * 1000,
    }));

    const completed = spec.current >= spec.required;

    return {
      id: jobId,
      dayId,
      lineId: spec.line,
      supervisorId: null,
      supervisorNameSnapshot: lineNames[spec.line] || `خط ${spec.line}`,
      bagTypeId: bagTypes.find((b) => b.name === spec.bag)?.id ?? null,
      bagTypeNameSnapshot: spec.bag,
      requiredQuantity: spec.required,
      createdAt,
      completedAt: completed ? (entries[entries.length - 1]?.timestamp ?? createdAt) : null,
      entries,
    };
  });

  return {
    supervisors: [],
    bagTypes,
    lineNames,
    quickAdds: [10, 25, 50, 100],
    jobs,
  };
}
