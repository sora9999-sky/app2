import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
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
  const accounts = state.suppliers.accounts || [];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
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
