import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import {
  Field,
  Input,
  PrimaryButton,
  GhostButton,
  PageHeader,
  Card,
  EmptyState,
} from '../components/UI';
import { formatIQD } from '../lib/format';
import { accountTotals } from '../lib/derive';

export default function SuppliersPage() {
  const { state, tr, lang, addSupplierAccount, showToast } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const accounts = state.suppliers.accounts || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) => {
      const idStr = `sup-${String(a.id).padStart(4, '0')}`.toLowerCase();
      const rawId = String(a.id);
      return (
        a.name.toLowerCase().includes(q) ||
        idStr.includes(q) ||
        rawId.includes(q)
      );
    });
  }, [accounts, query]);

  const submit = (e) => {
    e?.preventDefault();
    if (!name.trim()) return;
    const id = addSupplierAccount(name);
    setName('');
    setOpen(false);
    showToast(`SUP-${String(id).padStart(4, '0')} ✓`, 'success');
  };

  return (
    <div data-testid="suppliers-page">
      <PageHeader
        title={tr('suppliers.title')}
        subtitle={tr('tagline')}
        right={
          <PrimaryButton onClick={() => setOpen(true)} data-testid="add-account-btn">
            <span className="inline-flex items-center gap-2">
              <Plus size={16} /> {tr('suppliers.addAccount')}
            </span>
          </PrimaryButton>
        }
      />

      {accounts.length === 0 ? (
        <Card className="py-4">
          <EmptyState
            icon={Users}
            title={tr('suppliers.noAccounts')}
            hint={tr('suppliers.addAccount')}
          />
        </Card>
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-5" data-testid="supplier-search-wrap">
            <Search
              size={18}
              className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 pointer-events-none rtl:left-auto rtl:right-4"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tr('suppliers.searchPlaceholder')}
              data-testid="supplier-search-input"
              className="w-full ps-11 pe-11 py-3 rounded-xl border border-sky-100 bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 shadow-sm"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                data-testid="supplier-search-clear"
                className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 p-1 rounded-md text-slate-400 hover:bg-slate-100"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <Card className="py-4">
              <EmptyState
                icon={Search}
                title={tr('suppliers.noMatches')}
                hint={query}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((acc) => {
                const tot = accountTotals(acc);
                return (
                  <Link
                    key={acc.id}
                    to={`/suppliers/${acc.id}`}
                    data-testid={`supplier-card-${acc.id}`}
                    className="group"
                  >
                    <Card className="p-5 hover:shadow-md hover:border-sky-300 transition cursor-pointer h-full">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                            {acc.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 truncate">
                              {acc.name}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              SUP-{String(acc.id).padStart(4, '0')}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-sky-50 rounded-lg px-3 py-2">
                          <div className="text-xs text-sky-700 font-medium">
                            {tr('suppliers.totalBills')}
                          </div>
                          <div className="font-bold text-slate-800 mt-0.5">
                            {formatIQD(tot.totalBills, lang)}
                          </div>
                        </div>
                        <div className="bg-teal-50 rounded-lg px-3 py-2">
                          <div className="text-xs text-teal-700 font-medium">
                            {tr('suppliers.totalPayments')}
                          </div>
                          <div className="font-bold text-slate-800 mt-0.5">
                            {formatIQD(tot.totalPayments, lang)}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`mt-3 px-3 py-2 rounded-lg text-sm font-semibold ${
                          tot.outstanding > 0
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {tr('suppliers.balance')}: {formatIQD(tot.outstanding, lang)}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={tr('suppliers.newAccount')}
        testId="add-account-modal"
        footer={
          <>
            <GhostButton onClick={() => setOpen(false)}>{tr('common.cancel')}</GhostButton>
            <PrimaryButton onClick={submit} data-testid="save-account-btn">
              {tr('common.save')}
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={submit}>
          <Field label={tr('suppliers.accountName')}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="account-name"
              autoFocus
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
