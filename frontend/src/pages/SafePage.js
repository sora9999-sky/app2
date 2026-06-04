import React, { useState } from 'react';
import { Plus, Trash2, Wallet, History, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Field,
  Input,
  PrimaryButton,
  GhostButton,
  PageHeader,
  Card,
  EmptyState,
} from '../components/UI';
import { formatIQD, formatDate, todayISO } from '../lib/format';
import { safeBalance, totalRevenues } from '../lib/derive';

export default function SafePage() {
  const { state, tr, lang, addRevenue, deleteRevenue, clearRevenueHistory, showToast } =
    useApp();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const balance = safeBalance(state);
  const revenueTotal = totalRevenues(state);
  const revenues = state.safe.revenues || [];

  const submit = (e) => {
    e?.preventDefault();
    const a = Number(amount);
    if (!a || a <= 0) {
      showToast(tr('suppliers.enterValidAmount'), 'error');
      return;
    }
    addRevenue({ amount: a, date, note });
    setAmount('');
    setNote('');
    setDate(todayISO());
    setOpen(false);
    showToast(tr('common.save') + ' ✓', 'success');
  };

  return (
    <div data-testid="safe-page">
      <PageHeader
        title={tr('safe.title')}
        subtitle={tr('tagline')}
        right={
          <PrimaryButton onClick={() => setOpen(true)} data-testid="add-revenue-btn">
            <span className="inline-flex items-center gap-2">
              <Plus size={16} /> {tr('safe.addRevenue')}
            </span>
          </PrimaryButton>
        }
      />

      {/* Balance hero */}
      <Card className="p-8 mb-6 bg-gradient-to-br from-sky-500 to-sky-600 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur">
            <Wallet size={28} />
          </div>
          <div>
            <div className="text-sky-100 font-medium">{tr('safe.balance')}</div>
            <div
              className="text-4xl font-bold mt-1"
              data-testid="safe-balance"
            >
              {formatIQD(balance, lang)}
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sky-100 text-sm">{tr('safe.history')}</div>
            <div className="text-xl font-bold mt-0.5">{formatIQD(revenueTotal, lang)}</div>
          </div>
          <div className="text-end">
            <div className="text-sky-100 text-sm">—</div>
            <div className="text-xl font-bold mt-0.5 inline-flex items-center gap-2">
              <TrendingUp size={16} /> {revenues.length}
            </div>
          </div>
        </div>
      </Card>

      {/* History */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-sky-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-white">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <History size={18} className="text-sky-500" />
            {tr('safe.history')}
          </div>
          {revenues.length > 0 && (
            <GhostButton
              onClick={() => setConfirmClear(true)}
              data-testid="clear-revenue-btn"
            >
              <span className="inline-flex items-center gap-2">
                <Trash2 size={14} /> {tr('common.clear')}
              </span>
            </GhostButton>
          )}
        </div>
        {revenues.length === 0 ? (
          <EmptyState icon={History} title={tr('common.empty')} hint={tr('safe.emptyHelp')} />
        ) : (
          <ul className="divide-y divide-sky-50">
            {revenues.map((r) => (
              <li
                key={r.id}
                data-testid={`revenue-row-${r.id}`}
                className="px-6 py-4 flex items-center gap-4 hover:bg-sky-50/50"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  +
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">
                    {formatIQD(r.amount, lang)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {tr('safe.addedOn')} {formatDate(r.date, lang)}
                    {r.note ? ` · ${r.note}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => setConfirmDel(r.id)}
                  className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50"
                  data-testid={`delete-revenue-${r.id}`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Add modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={tr('safe.addRevenue')}
        testId="add-revenue-modal"
        footer={
          <>
            <GhostButton onClick={() => setOpen(false)}>{tr('common.cancel')}</GhostButton>
            <PrimaryButton onClick={submit} data-testid="save-revenue-btn">
              {tr('common.save')}
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={submit}>
          <Field label={tr('common.amount')}>
            <Input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="revenue-amount"
              autoFocus
            />
          </Field>
          <Field label={tr('common.date')}>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="revenue-date"
            />
          </Field>
          <Field label={tr('common.note')}>
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              data-testid="revenue-note"
            />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearRevenueHistory();
          showToast(tr('common.clear') + ' ✓', 'success');
        }}
        message={tr('safe.clearConfirm')}
        danger
      />
      <ConfirmDialog
        open={confirmDel !== null}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => {
          if (confirmDel != null) deleteRevenue(confirmDel);
        }}
        message={tr('common.delete') + '?'}
        danger
      />
    </div>
  );
}
