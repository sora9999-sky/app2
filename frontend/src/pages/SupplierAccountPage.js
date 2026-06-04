import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileDown,
  FileText,
  CreditCard,
  Bell,
  BellOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Field,
  Input,
  Select,
  PrimaryButton,
  GhostButton,
  Card,
} from '../components/UI';
import { formatIQD, formatDate, todayISO, addMonths } from '../lib/format';
import { accountTotals, billStatus, safeBalance } from '../lib/derive';
import { exportAccountPDF } from '../lib/pdf';

export default function SupplierAccountPage() {
  const { id } = useParams();
  const accountId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state,
    tr,
    lang,
    addBill,
    deleteBill,
    addPayment,
    deletePayment,
    deleteSupplierAccount,
    showToast,
    isBillNotifDisabled,
    toggleBillNotif,
  } = useApp();

  const account = useMemo(
    () => (state.suppliers.accounts || []).find((a) => a.id === accountId),
    [state.suppliers.accounts, accountId]
  );

  const [billOpen, setBillOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [confirmRowDel, setConfirmRowDel] = useState(null);

  // Bill form
  const [billNumber, setBillNumber] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDate, setBillDate] = useState(todayISO());
  const [billMonths, setBillMonths] = useState('3');
  const [billInitialPayment, setBillInitialPayment] = useState('');

  // Payment form
  const [payNumber, setPayNumber] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(todayISO());
  const [payBillId, setPayBillId] = useState('');

  // Highlight bill from notification deep-link
  const highlightBillId = useMemo(() => {
    const m = location.hash?.match(/bill-(\d+)/);
    return m ? Number(m[1]) : null;
  }, [location.hash]);

  const billRefs = useRef({});
  useEffect(() => {
    if (highlightBillId && billRefs.current[highlightBillId]) {
      billRefs.current[highlightBillId].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightBillId, account]);

  if (!account) {
    return (
      <div data-testid="supplier-account-missing">
        <button
          onClick={() => navigate('/suppliers')}
          className="inline-flex items-center gap-2 text-sky-600 hover:underline mb-4"
        >
          <ArrowLeft size={16} /> {tr('common.back')}
        </button>
        <Card className="p-8 text-center text-slate-500">{tr('common.empty')}</Card>
      </div>
    );
  }

  const tot = accountTotals(account);
  const bills = account.bills || [];
  const payments = account.payments || [];

  const submitBill = (e) => {
    e?.preventDefault();
    const a = Number(billAmount);
    if (!a || a <= 0 || !billNumber.trim()) {
      showToast(tr('suppliers.enterValidAmount'), 'error');
      return;
    }
    const initial = Number(billInitialPayment) || 0;
    if (initial < 0) {
      showToast(tr('suppliers.enterValidAmount'), 'error');
      return;
    }
    if (initial > a) {
      showToast(tr('suppliers.amountExceedsRemaining'), 'error');
      return;
    }
    if (initial > 0) {
      const currentBalance = safeBalance(state);
      if (initial > currentBalance) {
        showToast(tr('suppliers.insufficientFunds'), 'error');
        return;
      }
    }
    const newBillId = addBill(account.id, {
      billNumber,
      amount: a,
      date: billDate,
      monthsUntilDue: billMonths,
    });
    if (initial > 0 && newBillId) {
      addPayment(account.id, {
        paymentNumber: `${billNumber}-INIT`,
        amount: initial,
        date: billDate,
        billId: newBillId,
      });
    }
    setBillNumber('');
    setBillAmount('');
    setBillDate(todayISO());
    setBillMonths('3');
    setBillInitialPayment('');
    setBillOpen(false);
    showToast(tr('common.save') + ' ✓', 'success');
  };

  const submitPayment = (e) => {
    e?.preventDefault();
    const a = Number(payAmount);
    if (!a || a <= 0 || !payNumber.trim()) {
      showToast(tr('suppliers.enterValidAmount'), 'error');
      return;
    }
    // Check safe balance
    const currentBalance = safeBalance(state);
    if (a > currentBalance) {
      showToast(tr('suppliers.insufficientFunds'), 'error');
      return;
    }
    // If a bill is selected, ensure we don't overpay
    if (payBillId) {
      const bill = (account.bills || []).find((b) => b.id === Number(payBillId));
      if (bill) {
        const st = billStatus(bill, account);
        if (a > st.remaining + 0.0001) {
          showToast(tr('suppliers.amountExceedsRemaining'), 'error');
          return;
        }
      }
    }
    addPayment(account.id, {
      paymentNumber: payNumber,
      amount: a,
      date: payDate,
      billId: payBillId || null,
    });
    setPayNumber('');
    setPayAmount('');
    setPayDate(todayISO());
    setPayBillId('');
    setPayOpen(false);
    showToast(tr('common.save') + ' ✓', 'success');
  };

  return (
    <div data-testid="supplier-account-page">
      <button
        onClick={() => navigate('/suppliers')}
        className="inline-flex items-center gap-2 text-sky-600 hover:underline mb-4"
        data-testid="back-to-suppliers"
      >
        <ArrowLeft size={16} /> {tr('common.back')}
      </button>

      {/* Header */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-white to-sky-50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {account.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{account.name}</h1>
              <div className="text-sm text-slate-500 font-mono mt-0.5">
                {tr('suppliers.accountId')}: SUP-{String(account.id).padStart(4, '0')}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton
              onClick={() => exportAccountPDF(account, lang)}
              data-testid="export-pdf-btn"
            >
              <span className="inline-flex items-center gap-2">
                <FileDown size={16} /> {tr('suppliers.exportPdf')}
              </span>
            </GhostButton>
            <button
              onClick={() => setConfirmDel(true)}
              data-testid="delete-account-btn"
              className="px-4 py-2 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 font-medium transition"
            >
              <span className="inline-flex items-center gap-2">
                <Trash2 size={16} /> {tr('common.delete')}
              </span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
            <div className="text-xs text-sky-700 font-medium">
              {tr('suppliers.totalBills')}
            </div>
            <div className="text-xl font-bold text-slate-800 mt-1" data-testid="total-bills">
              {formatIQD(tot.totalBills, lang)}
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
            <div className="text-xs text-teal-700 font-medium">
              {tr('suppliers.totalPayments')}
            </div>
            <div
              className="text-xl font-bold text-slate-800 mt-1"
              data-testid="total-payments"
            >
              {formatIQD(tot.totalPayments, lang)}
            </div>
          </div>
          <div
            className={`rounded-xl px-4 py-3 border ${
              tot.outstanding > 0
                ? 'bg-amber-50 border-amber-100'
                : 'bg-emerald-50 border-emerald-100'
            }`}
          >
            <div
              className={`text-xs font-medium ${
                tot.outstanding > 0 ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {tr('suppliers.balance')}
            </div>
            <div
              className="text-xl font-bold text-slate-800 mt-1"
              data-testid="outstanding-balance"
            >
              {formatIQD(tot.outstanding, lang)}
            </div>
          </div>
        </div>
      </Card>

      {/* Two columns: bills | payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bills */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-sky-100 flex items-center justify-between bg-sky-50">
            <div className="flex items-center gap-2 font-bold text-sky-700">
              <FileText size={18} /> {tr('suppliers.bills')}
            </div>
            <PrimaryButton
              onClick={() => setBillOpen(true)}
              data-testid="add-bill-btn"
              className="!py-2 !px-3 !text-sm"
            >
              <span className="inline-flex items-center gap-1.5">
                <Plus size={14} /> {tr('suppliers.addBill')}
              </span>
            </PrimaryButton>
          </div>
          {bills.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              {tr('suppliers.noBills')}
            </div>
          ) : (
            <ul className="divide-y divide-sky-50">
              {bills.map((b) => {
                const st = billStatus(b, account);
                const disabled = isBillNotifDisabled(account.id, b.id);
                const isHighlight = highlightBillId === b.id;
                return (
                  <li
                    key={b.id}
                    ref={(el) => (billRefs.current[b.id] = el)}
                    data-testid={`bill-row-${b.id}`}
                    id={`bill-${b.id}`}
                    className={`px-5 py-4 transition ${
                      isHighlight ? 'bg-amber-50 ring-2 ring-amber-300' : 'hover:bg-sky-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-sky-500 text-white">
                            B-{String(b.id).padStart(4, '0')}
                          </span>
                          <span className="text-sm text-slate-500">
                            #{b.billNumber}
                          </span>
                          <StatusChip status={st.code} tr={tr} />
                        </div>
                        <div className="font-bold text-lg text-slate-800 mt-1">
                          {formatIQD(b.amount, lang)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                          <div>
                            {tr('common.date')}: {formatDate(b.date, lang)} ·{' '}
                            {b.monthsUntilDue} mo
                          </div>
                          <div>
                            {tr('suppliers.dueDate')}: {formatDate(b.dueDate, lang)}
                          </div>
                          <div>
                            {tr('suppliers.paidOnBill')}: {formatIQD(st.paid, lang)} ·{' '}
                            {tr('suppliers.remainingOnBill')}:{' '}
                            {formatIQD(st.remaining, lang)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => toggleBillNotif(account.id, b.id)}
                          title={
                            disabled
                              ? tr('notifications.enableForBill')
                              : tr('notifications.disableForBill')
                          }
                          data-testid={`toggle-notif-${b.id}`}
                          className={`p-1.5 rounded-lg ${
                            disabled
                              ? 'text-slate-400 hover:bg-slate-100'
                              : 'text-sky-500 hover:bg-sky-100'
                          }`}
                        >
                          {disabled ? <BellOff size={16} /> : <Bell size={16} />}
                        </button>
                        <button
                          onClick={() =>
                            setConfirmRowDel({ type: 'bill', id: b.id })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                          data-testid={`delete-bill-${b.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Payments */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-teal-100 flex items-center justify-between bg-teal-50">
            <div className="flex items-center gap-2 font-bold text-teal-700">
              <CreditCard size={18} /> {tr('suppliers.payments')}
            </div>
            <button
              onClick={() => setPayOpen(true)}
              data-testid="add-payment-btn"
              className="px-3 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm shadow-sm shadow-teal-200 transition"
            >
              <span className="inline-flex items-center gap-1.5">
                <Plus size={14} /> {tr('suppliers.addPayment')}
              </span>
            </button>
          </div>
          {payments.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              {tr('suppliers.noPayments')}
            </div>
          ) : (
            <ul className="divide-y divide-teal-50">
              {payments.map((p) => (
                <li
                  key={p.id}
                  data-testid={`payment-row-${p.id}`}
                  className="px-5 py-4 hover:bg-teal-50/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-teal-500 text-white">
                          P-{String(p.id).padStart(4, '0')}
                        </span>
                        <span className="text-sm text-slate-500">
                          #{p.paymentNumber}
                        </span>
                        {p.billId && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-sky-100 text-sky-700">
                            → B-{String(p.billId).padStart(4, '0')}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-lg text-slate-800 mt-1">
                        {formatIQD(p.amount, lang)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {tr('common.date')}: {formatDate(p.date, lang)}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setConfirmRowDel({ type: 'payment', id: p.id })
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 self-start"
                      data-testid={`delete-payment-${p.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Add Bill Modal */}
      <Modal
        open={billOpen}
        onClose={() => setBillOpen(false)}
        title={tr('suppliers.addBill')}
        testId="add-bill-modal"
        footer={
          <>
            <GhostButton onClick={() => setBillOpen(false)}>
              {tr('common.cancel')}
            </GhostButton>
            <PrimaryButton onClick={submitBill} data-testid="save-bill-btn">
              {tr('common.save')}
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={submitBill}>
          <Field label={tr('suppliers.billNumber')}>
            <Input
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              data-testid="bill-number"
              autoFocus
            />
          </Field>
          <Field label={tr('common.amount')}>
            <Input
              type="number"
              min="0"
              step="any"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              data-testid="bill-amount"
            />
          </Field>
          <Field label={tr('common.date')}>
            <Input
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              data-testid="bill-date"
            />
          </Field>
          <Field label={tr('suppliers.months')}>
            <Input
              type="number"
              min="0"
              step="1"
              value={billMonths}
              onChange={(e) => setBillMonths(e.target.value)}
              data-testid="bill-months"
            />
          </Field>
          {billDate && billMonths !== '' && (
            <div className="text-xs text-slate-500 mb-3">
              {tr('suppliers.dueDate')}:{' '}
              <span className="font-semibold text-sky-700">
                {formatDate(addMonths(billDate, Number(billMonths)), lang)}
              </span>
            </div>
          )}
          <Field label={tr('suppliers.initialPayment')}>
            <Input
              type="number"
              min="0"
              step="any"
              value={billInitialPayment}
              onChange={(e) => setBillInitialPayment(e.target.value)}
              data-testid="bill-initial-payment"
              placeholder="0"
            />
          </Field>
          <div className="text-xs text-slate-500 -mt-2 mb-2 leading-relaxed">
            {tr('suppliers.initialPaymentHelp')}
          </div>
          {Number(billInitialPayment) > 0 && billAmount && (
            <div className="text-xs bg-sky-50 border border-sky-100 rounded-lg px-3 py-2 mt-1">
              <div className="flex justify-between">
                <span className="text-slate-600">
                  {tr('suppliers.remainingOnBill')}:
                </span>
                <span className="font-semibold text-sky-700">
                  {formatIQD(
                    Math.max(0, Number(billAmount) - Number(billInitialPayment)),
                    lang
                  )}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-600">{tr('safe.balance')}:</span>
                <span
                  className={`font-semibold ${
                    Number(billInitialPayment) > safeBalance(state)
                      ? 'text-rose-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {formatIQD(safeBalance(state), lang)}
                </span>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Add Payment Modal */}
      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title={tr('suppliers.addPayment')}
        testId="add-payment-modal"
        footer={
          <>
            <GhostButton onClick={() => setPayOpen(false)}>
              {tr('common.cancel')}
            </GhostButton>
            <button
              onClick={submitPayment}
              data-testid="save-payment-btn"
              className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold shadow-sm shadow-teal-200 transition"
            >
              {tr('common.save')}
            </button>
          </>
        }
      >
        <form onSubmit={submitPayment}>
          <Field label={tr('suppliers.paymentNumber')}>
            <Input
              value={payNumber}
              onChange={(e) => setPayNumber(e.target.value)}
              data-testid="payment-number"
              autoFocus
            />
          </Field>
          <Field label={tr('common.amount')}>
            <Input
              type="number"
              min="0"
              step="any"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              data-testid="payment-amount"
            />
          </Field>
          <Field label={tr('common.date')}>
            <Input
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              data-testid="payment-date"
            />
          </Field>
          <Field label={tr('suppliers.forBill')}>
            <Select
              value={payBillId}
              onChange={(e) => setPayBillId(e.target.value)}
              data-testid="payment-bill"
            >
              <option value="">{tr('suppliers.pickBill')}</option>
              {bills.map((b) => {
                const st = billStatus(b, account);
                return (
                  <option key={b.id} value={b.id}>
                    B-{String(b.id).padStart(4, '0')} · #{b.billNumber} ·{' '}
                    {tr('suppliers.remainingOnBill')}: {formatIQD(st.remaining, lang)}
                  </option>
                );
              })}
            </Select>
          </Field>
          {payBillId &&
            (() => {
              const bill = bills.find((b) => b.id === Number(payBillId));
              if (!bill) return null;
              const st = billStatus(bill, account);
              return (
                <div
                  className="text-xs bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 mb-3"
                  data-testid="payment-remaining-info"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">
                      {tr('suppliers.remainingOnBill')}:
                    </span>
                    <span className="font-bold text-teal-700">
                      {formatIQD(st.remaining, lang)}
                    </span>
                  </div>
                  {st.remaining > 0 && (
                    <button
                      type="button"
                      onClick={() => setPayAmount(String(st.remaining))}
                      data-testid="pay-remaining-btn"
                      className="mt-2 w-full px-3 py-1.5 rounded-md bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold"
                    >
                      {tr('suppliers.payRemaining')} ({formatIQD(st.remaining, lang)})
                    </button>
                  )}
                </div>
              );
            })()}
          <div className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            ⚠️ {tr('safe.balance')}: {formatIQD(safeBalance(state), lang)}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={() => {
          deleteSupplierAccount(account.id);
          navigate('/suppliers');
        }}
        message={tr('suppliers.deleteAccountConfirm')}
        danger
      />
      <ConfirmDialog
        open={confirmRowDel !== null}
        onClose={() => setConfirmRowDel(null)}
        onConfirm={() => {
          if (!confirmRowDel) return;
          if (confirmRowDel.type === 'bill') deleteBill(account.id, confirmRowDel.id);
          else deletePayment(account.id, confirmRowDel.id);
        }}
        message={tr('common.delete') + '?'}
        danger
      />
    </div>
  );
}

function StatusChip({ status, tr }) {
  const map = {
    paid: { label: tr('suppliers.paid'), cls: 'bg-emerald-100 text-emerald-700' },
    'due-soon': { label: tr('suppliers.due'), cls: 'bg-amber-100 text-amber-700' },
    overdue: { label: tr('suppliers.overdue'), cls: 'bg-rose-100 text-rose-700' },
    open: { label: '—', cls: 'bg-slate-100 text-slate-600' },
  };
  const m = map[status] || map.open;
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${m.cls}`}>
      {m.label}
    </span>
  );
}
