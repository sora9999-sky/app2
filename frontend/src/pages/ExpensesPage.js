import React, { useState } from 'react';
import { Plus, Trash2, Receipt, Tag, History } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Field,
  Input,
  Select,
  PrimaryButton,
  GhostButton,
  PageHeader,
  Card,
  EmptyState,
} from '../components/UI';
import { formatIQD, formatDate, todayISO } from '../lib/format';
import { totalExpenses } from '../lib/derive';

export default function ExpensesPage() {
  const {
    state,
    tr,
    lang,
    addExpense,
    addExpenseType,
    deleteExpense,
    deleteExpenseType,
    clearExpenseHistory,
    showToast,
  } = useApp();

  const types = state.expenses.types || [];
  const entries = state.expenses.entries || [];
  const total = totalExpenses(state);

  const [typeOpen, setTypeOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [typeName, setTypeName] = useState('');
  const [amount, setAmount] = useState('');
  const [typeId, setTypeId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');

  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [confirmDelType, setConfirmDelType] = useState(null);

  const submitType = (e) => {
    e?.preventDefault();
    if (!typeName.trim()) return;
    addExpenseType(typeName);
    setTypeName('');
    setTypeOpen(false);
    showToast(tr('common.save') + ' ✓', 'success');
  };

  const submitExpense = (e) => {
    e?.preventDefault();
    const a = Number(amount);
    if (!a || a <= 0 || !typeId) {
      showToast(tr('suppliers.enterValidAmount'), 'error');
      return;
    }
    addExpense({ amount: a, typeId, date, note });
    setAmount('');
    setTypeId('');
    setDate(todayISO());
    setNote('');
    setExpOpen(false);
    showToast(tr('common.save') + ' ✓', 'success');
  };

  const typeName_ = (id) => types.find((t) => t.id === Number(id))?.name || '—';

  return (
    <div data-testid="expenses-page">
      <PageHeader
        title={tr('expenses.title')}
        subtitle={tr('tagline')}
        right={
          <>
            <GhostButton onClick={() => setTypeOpen(true)} data-testid="add-type-btn">
              <span className="inline-flex items-center gap-2">
                <Tag size={16} /> {tr('expenses.addType')}
              </span>
            </GhostButton>
            <PrimaryButton
              onClick={() => setExpOpen(true)}
              data-testid="add-expense-btn"
              disabled={types.length === 0}
            >
              <span className="inline-flex items-center gap-2">
                <Plus size={16} /> {tr('expenses.addExpense')}
              </span>
            </PrimaryButton>
          </>
        }
      />

      {/* Total */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <Receipt size={28} />
          </div>
          <div>
            <div className="text-rose-100 font-medium">{tr('expenses.total')}</div>
            <div className="text-3xl font-bold mt-1" data-testid="expense-total">
              {formatIQD(total, lang)}
            </div>
          </div>
        </div>
      </Card>

      {/* Types */}
      <Card className="overflow-hidden mb-6">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex items-center gap-2">
          <Tag size={16} /> {tr('expenses.types')}
        </div>
        {types.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-sm">
            {tr('expenses.noTypes')}
          </div>
        ) : (
          <div className="px-5 py-3 flex flex-wrap gap-2">
            {types.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg text-sm font-medium"
                data-testid={`type-chip-${t.id}`}
              >
                {t.name}
                <button
                  onClick={() => setConfirmDelType(t.id)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* History */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-sky-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-white">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <History size={18} className="text-sky-500" />
            {tr('expenses.history')}
          </div>
          {entries.length > 0 && (
            <GhostButton
              onClick={() => setConfirmClear(true)}
              data-testid="clear-expenses-btn"
            >
              <span className="inline-flex items-center gap-2">
                <Trash2 size={14} /> {tr('common.clear')}
              </span>
            </GhostButton>
          )}
        </div>
        {entries.length === 0 ? (
          <EmptyState icon={Receipt} title={tr('common.empty')} />
        ) : (
          <ul className="divide-y divide-sky-50">
            {entries.map((e) => (
              <li
                key={e.id}
                data-testid={`expense-row-${e.id}`}
                className="px-6 py-4 flex items-center gap-4 hover:bg-sky-50/50"
              >
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  −
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">
                      {formatIQD(e.amount, lang)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs bg-sky-100 text-sky-700 font-medium">
                      {typeName_(e.typeId)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {formatDate(e.date, lang)}
                    {e.note ? ` · ${e.note}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => setConfirmDel(e.id)}
                  className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50"
                  data-testid={`delete-expense-${e.id}`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Modals */}
      <Modal
        open={typeOpen}
        onClose={() => setTypeOpen(false)}
        title={tr('expenses.newType')}
        testId="add-type-modal"
        footer={
          <>
            <GhostButton onClick={() => setTypeOpen(false)}>
              {tr('common.cancel')}
            </GhostButton>
            <PrimaryButton onClick={submitType} data-testid="save-type-btn">
              {tr('common.save')}
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={submitType}>
          <Field label={tr('expenses.typeName')}>
            <Input
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              data-testid="type-name"
              autoFocus
            />
          </Field>
        </form>
      </Modal>

      <Modal
        open={expOpen}
        onClose={() => setExpOpen(false)}
        title={tr('expenses.addExpense')}
        testId="add-expense-modal"
        footer={
          <>
            <GhostButton onClick={() => setExpOpen(false)}>
              {tr('common.cancel')}
            </GhostButton>
            <PrimaryButton onClick={submitExpense} data-testid="save-expense-btn">
              {tr('common.save')}
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={submitExpense}>
          <Field label={tr('common.amount')}>
            <Input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="expense-amount"
              autoFocus
            />
          </Field>
          <Field label={tr('expenses.pickType')}>
            <Select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              data-testid="expense-type"
            >
              <option value="">{tr('expenses.pickType')}</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={tr('common.date')}>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="expense-date"
            />
          </Field>
          <Field label={tr('common.note')}>
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              data-testid="expense-note"
            />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearExpenseHistory();
          showToast(tr('common.clear') + ' ✓', 'success');
        }}
        message={tr('expenses.clearConfirm')}
        danger
      />
      <ConfirmDialog
        open={confirmDel !== null}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => confirmDel != null && deleteExpense(confirmDel)}
        message={tr('common.delete') + '?'}
        danger
      />
      <ConfirmDialog
        open={confirmDelType !== null}
        onClose={() => setConfirmDelType(null)}
        onConfirm={() => confirmDelType != null && deleteExpenseType(confirmDelType)}
        message={tr('expenses.deleteTypeConfirm')}
        danger
      />
    </div>
  );
}
