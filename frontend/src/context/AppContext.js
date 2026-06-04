import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { loadData, saveData, isElectron } from '../lib/storage';
import { createInitialState, ensureShape } from '../lib/defaults';
import { translations, t as translate } from '../lib/i18n';
import { todayISO, addMonths, daysBetween } from '../lib/format';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(createInitialState());
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null); // { type, msg }
  const stateRef = useRef(state);
  stateRef.current = state;

  // Initial load
  useEffect(() => {
    (async () => {
      const loaded = await loadData();
      const shaped = ensureShape(loaded);
      setState(shaped);
      setReady(true);
    })();
  }, []);

  // Persist on every change after load
  useEffect(() => {
    if (!ready) return;
    saveData(state);
  }, [state, ready]);

  // Apply language (RTL)
  useEffect(() => {
    const lang = state.settings.language || 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [state.settings.language]);

  const lang = state.settings.language || 'en';
  const tr = useCallback((path) => translate(lang, path), [lang]);

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type, ts: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  // === Actions ===
  const setLanguage = useCallback((l) => {
    setState((s) => ({ ...s, settings: { ...s.settings, language: l } }));
  }, []);

  // Safe
  const addRevenue = useCallback(({ amount, date, note }) => {
    setState((s) => {
      const id = s.safe.nextRevenueId || 1;
      const rev = {
        id,
        amount: Number(amount),
        date: date || todayISO(),
        note: note || '',
        createdAt: new Date().toISOString(),
      };
      return {
        ...s,
        safe: {
          ...s.safe,
          revenues: [rev, ...(s.safe.revenues || [])],
          nextRevenueId: id + 1,
        },
      };
    });
  }, []);

  const deleteRevenue = useCallback((id) => {
    setState((s) => ({
      ...s,
      safe: {
        ...s.safe,
        revenues: (s.safe.revenues || []).filter((r) => r.id !== id),
      },
    }));
  }, []);

  const clearRevenueHistory = useCallback(() => {
    setState((s) => ({ ...s, safe: { ...s.safe, revenues: [] } }));
  }, []);

  // Suppliers
  const addSupplierAccount = useCallback((name) => {
    let newId = null;
    setState((s) => {
      const id = s.suppliers.nextAccountId || 1;
      newId = id;
      const acc = {
        id,
        name: name.trim(),
        createdAt: new Date().toISOString(),
        bills: [],
        payments: [],
      };
      return {
        ...s,
        suppliers: {
          ...s.suppliers,
          accounts: [...(s.suppliers.accounts || []), acc],
          nextAccountId: id + 1,
        },
      };
    });
    return newId;
  }, []);

  const deleteSupplierAccount = useCallback((accountId) => {
    setState((s) => ({
      ...s,
      suppliers: {
        ...s.suppliers,
        accounts: (s.suppliers.accounts || []).filter((a) => a.id !== accountId),
      },
    }));
  }, []);

  const addBill = useCallback(
    (accountId, { billNumber, amount, date, monthsUntilDue }) => {
      let newId = null;
      setState((s) => {
        const id = s.suppliers.nextBillId || 1;
        newId = id;
        const bill = {
          id,
          billNumber: String(billNumber || '').trim(),
          amount: Number(amount),
          date: date || todayISO(),
          monthsUntilDue: Number(monthsUntilDue) || 0,
          dueDate: addMonths(date || todayISO(), Number(monthsUntilDue) || 0),
          createdAt: new Date().toISOString(),
        };
        return {
          ...s,
          suppliers: {
            ...s.suppliers,
            nextBillId: id + 1,
            accounts: (s.suppliers.accounts || []).map((a) =>
              a.id === accountId ? { ...a, bills: [bill, ...(a.bills || [])] } : a
            ),
          },
        };
      });
      return newId;
    },
    []
  );

  const deleteBill = useCallback((accountId, billId) => {
    setState((s) => ({
      ...s,
      suppliers: {
        ...s.suppliers,
        accounts: (s.suppliers.accounts || []).map((a) =>
          a.id === accountId
            ? {
                ...a,
                bills: (a.bills || []).filter((b) => b.id !== billId),
                // unlink payments
                payments: (a.payments || []).map((p) =>
                  p.billId === billId ? { ...p, billId: null } : p
                ),
              }
            : a
        ),
      },
    }));
  }, []);

  const addPayment = useCallback(
    (accountId, { paymentNumber, amount, date, billId }) => {
      let newId = null;
      setState((s) => {
        const id = s.suppliers.nextPaymentId || 1;
        newId = id;
        const payment = {
          id,
          paymentNumber: String(paymentNumber || '').trim(),
          amount: Number(amount),
          date: date || todayISO(),
          billId: billId ? Number(billId) : null,
          createdAt: new Date().toISOString(),
        };
        return {
          ...s,
          suppliers: {
            ...s.suppliers,
            nextPaymentId: id + 1,
            accounts: (s.suppliers.accounts || []).map((a) =>
              a.id === accountId
                ? { ...a, payments: [payment, ...(a.payments || [])] }
                : a
            ),
          },
        };
      });
      return newId;
    },
    []
  );

  const deletePayment = useCallback((accountId, paymentId) => {
    setState((s) => ({
      ...s,
      suppliers: {
        ...s.suppliers,
        accounts: (s.suppliers.accounts || []).map((a) =>
          a.id === accountId
            ? { ...a, payments: (a.payments || []).filter((p) => p.id !== paymentId) }
            : a
        ),
      },
    }));
  }, []);

  // Expenses
  const addExpenseType = useCallback((name) => {
    let newId = null;
    setState((s) => {
      const id = s.expenses.nextTypeId || 1;
      newId = id;
      return {
        ...s,
        expenses: {
          ...s.expenses,
          types: [...(s.expenses.types || []), { id, name: name.trim() }],
          nextTypeId: id + 1,
        },
      };
    });
    return newId;
  }, []);

  const deleteExpenseType = useCallback((typeId) => {
    setState((s) => ({
      ...s,
      expenses: {
        ...s.expenses,
        types: (s.expenses.types || []).filter((t) => t.id !== typeId),
      },
    }));
  }, []);

  const addExpense = useCallback(({ amount, typeId, date, note }) => {
    setState((s) => {
      const id = s.expenses.nextEntryId || 1;
      const entry = {
        id,
        amount: Number(amount),
        typeId: Number(typeId),
        date: date || todayISO(),
        note: note || '',
        createdAt: new Date().toISOString(),
      };
      return {
        ...s,
        expenses: {
          ...s.expenses,
          entries: [entry, ...(s.expenses.entries || [])],
          nextEntryId: id + 1,
        },
      };
    });
  }, []);

  const deleteExpense = useCallback((id) => {
    setState((s) => ({
      ...s,
      expenses: {
        ...s.expenses,
        entries: (s.expenses.entries || []).filter((e) => e.id !== id),
      },
    }));
  }, []);

  const clearExpenseHistory = useCallback(() => {
    setState((s) => ({ ...s, expenses: { ...s.expenses, entries: [] } }));
  }, []);

  // Notifications: toggle disable per bill
  const isBillNotifDisabled = useCallback(
    (accountId, billId) => {
      const key = `${accountId}:${billId}`;
      return (state.notifications.disabledBills || []).includes(key);
    },
    [state.notifications.disabledBills]
  );

  const toggleBillNotif = useCallback((accountId, billId) => {
    const key = `${accountId}:${billId}`;
    setState((s) => {
      const cur = s.notifications.disabledBills || [];
      const exists = cur.includes(key);
      return {
        ...s,
        notifications: {
          ...s.notifications,
          disabledBills: exists ? cur.filter((k) => k !== key) : [...cur, key],
        },
      };
    });
  }, []);

  const dismissNotification = useCallback((notifKey) => {
    setState((s) => {
      const cur = s.notifications.dismissedKeys || [];
      if (cur.includes(notifKey)) return s;
      return {
        ...s,
        notifications: {
          ...s.notifications,
          dismissedKeys: [...cur, notifKey],
        },
      };
    });
  }, []);

  // Data import / reset
  const replaceState = useCallback((newData) => {
    setState(ensureShape(newData));
  }, []);

  const resetAll = useCallback(() => {
    setState(createInitialState());
  }, []);

  const api = useMemo(
    () => ({
      state,
      ready,
      lang,
      tr,
      toast,
      showToast,
      setLanguage,
      // safe
      addRevenue,
      deleteRevenue,
      clearRevenueHistory,
      // suppliers
      addSupplierAccount,
      deleteSupplierAccount,
      addBill,
      deleteBill,
      addPayment,
      deletePayment,
      // expenses
      addExpenseType,
      deleteExpenseType,
      addExpense,
      deleteExpense,
      clearExpenseHistory,
      // notifications
      isBillNotifDisabled,
      toggleBillNotif,
      dismissNotification,
      // data
      replaceState,
      resetAll,
    }),
    [
      state,
      ready,
      lang,
      tr,
      toast,
      showToast,
      setLanguage,
      addRevenue,
      deleteRevenue,
      clearRevenueHistory,
      addSupplierAccount,
      deleteSupplierAccount,
      addBill,
      deleteBill,
      addPayment,
      deletePayment,
      addExpenseType,
      deleteExpenseType,
      addExpense,
      deleteExpense,
      clearExpenseHistory,
      isBillNotifDisabled,
      toggleBillNotif,
      dismissNotification,
      replaceState,
      resetAll,
    ]
  );

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
