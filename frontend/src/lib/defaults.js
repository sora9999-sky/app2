// Initial application state.
export function createInitialState() {
  return {
    version: 1,
    safe: {
      revenues: [], // { id, amount, date, note }
      nextRevenueId: 1,
    },
    expenses: {
      types: [], // { id, name }
      entries: [], // { id, amount, typeId, date }
      nextTypeId: 1,
      nextEntryId: 1,
    },
    suppliers: {
      accounts: [], // { id, name, createdAt, bills: [...], payments: [...] }
      nextAccountId: 1,
      nextBillId: 1,
      nextPaymentId: 1,
    },
    notifications: {
      disabledBills: [], // composite ids: `${accountId}:${billId}`
      dismissedKeys: [], // notification keys dismissed by user
      lastCheckedAt: null,
    },
    settings: {
      language: 'en',
    },
  };
}

export function ensureShape(data) {
  const fresh = createInitialState();
  if (!data || typeof data !== 'object') return fresh;
  // Shallow merge with defaults to be safe with older backups.
  return {
    ...fresh,
    ...data,
    safe: { ...fresh.safe, ...(data.safe || {}) },
    expenses: { ...fresh.expenses, ...(data.expenses || {}) },
    suppliers: { ...fresh.suppliers, ...(data.suppliers || {}) },
    notifications: { ...fresh.notifications, ...(data.notifications || {}) },
    settings: { ...fresh.settings, ...(data.settings || {}) },
  };
}
