export const RECORDS_STORAGE_KEY = "living-seal-records:v1";

export class RecordStoreError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = "RecordStoreError";
  }
}

function isRecord(value) {
  return (
    value &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    (typeof value.title === "string" || typeof value.title === "undefined") &&
    typeof value.body === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    Number.isFinite(Date.parse(value.createdAt)) &&
    Number.isFinite(Date.parse(value.updatedAt))
  );
}

function newestFirst(records) {
  return [...records].sort(
    (left, right) => new Date(right.updatedAt) - new Date(left.updatedAt),
  );
}

function normalizeFields(input) {
  if (typeof input === "string") {
    return { title: "", body: input };
  }

  return {
    title: typeof input?.title === "string" ? input.title : "",
    body: typeof input?.body === "string" ? input.body : "",
  };
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createLocalRecordStore(storage = window.localStorage) {
  const read = () => {
    try {
      const raw = storage.getItem(RECORDS_STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.every(isRecord)) {
        throw new TypeError("Unexpected record data");
      }

      return newestFirst(
        parsed.map((record) => ({
          ...record,
          title: typeof record.title === "string" ? record.title : "",
        })),
      );
    } catch (error) {
      throw new RecordStoreError("저장된 기록을 읽지 못했어요.", error);
    }
  };

  const write = (records) => {
    try {
      storage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      throw new RecordStoreError("이 브라우저에 기록을 저장하지 못했어요.", error);
    }
  };

  return {
    async list() {
      return read();
    },

    async create(input) {
      const now = new Date().toISOString();
      const fields = normalizeFields(input);
      const record = {
        id: makeId(),
        ...fields,
        createdAt: now,
        updatedAt: now,
      };
      const records = [record, ...read()];
      write(records);
      return record;
    },

    async update(id, input) {
      const records = read();
      const index = records.findIndex((record) => record.id === id);
      if (index === -1) {
        throw new RecordStoreError("수정할 기록을 찾지 못했어요.");
      }

      const fields = normalizeFields(input);
      const updated = {
        ...records[index],
        ...fields,
        updatedAt: new Date().toISOString(),
      };
      records[index] = updated;
      write(records);
      return updated;
    },

    async remove(id) {
      const records = read();
      const nextRecords = records.filter((record) => record.id !== id);
      if (nextRecords.length === records.length) {
        throw new RecordStoreError("삭제할 기록을 찾지 못했어요.");
      }

      write(nextRecords);
    },
  };
}

export const recordStore = createLocalRecordStore();
