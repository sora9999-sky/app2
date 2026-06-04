import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, AlertTriangle, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, EmptyState, GhostButton } from '../components/UI';
import { formatIQD, formatDate } from '../lib/format';
import { computeNotifications } from '../lib/notifications';

export default function NotificationsPage() {
  const {
    state,
    tr,
    lang,
    toggleBillNotif,
    dismissNotification,
    isBillNotifDisabled,
  } = useApp();
  const navigate = useNavigate();
  const notifs = computeNotifications(state);
  const disabled = state.notifications.disabledBills || [];

  const openBill = (accountId, billId) => {
    navigate(`/suppliers/${accountId}#bill-${billId}`);
  };

  return (
    <div data-testid="notifications-page">
      <PageHeader title={tr('notifications.title')} subtitle={tr('notifications.explain')} />

      {notifs.length === 0 ? (
        <Card className="py-4">
          <EmptyState
            icon={Bell}
            title={tr('notifications.empty')}
            hint={tr('notifications.explain')}
          />
        </Card>
      ) : (
        <div className="space-y-3 mb-6">
          {notifs.map((n) => (
            <Card
              key={n.key}
              className={`p-4 flex items-center gap-4 hover:shadow-md transition cursor-pointer ${
                n.overdue ? 'border-rose-200 bg-rose-50/50' : 'border-amber-200 bg-amber-50/50'
              }`}
              data-testid={`notif-row-${n.accountId}-${n.billId}`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  n.overdue ? 'bg-rose-500 text-white' : 'bg-amber-400 text-white'
                }`}
              >
                <AlertTriangle size={20} />
              </div>
              <div
                className="flex-1 min-w-0"
                onClick={() => openBill(n.accountId, n.billId)}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-800">{n.accountName}</span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-sky-500 text-white">
                    B-{String(n.billId).padStart(4, '0')}
                  </span>
                  <span className="text-xs text-slate-500">#{n.billNumber}</span>
                </div>
                <div className="text-sm text-slate-700 mt-1">
                  {n.overdue ? (
                    <span className="font-semibold text-rose-700">
                      {tr('notifications.overdueBy')} {Math.abs(n.daysLeft)}{' '}
                      {tr('notifications.days')}
                    </span>
                  ) : (
                    <span className="font-semibold text-amber-700">
                      {tr('notifications.dueIn')} {n.daysLeft} {tr('notifications.days')}
                    </span>
                  )}
                  <span className="text-slate-500">
                    {' '}
                    · {tr('suppliers.dueDate')}: {formatDate(n.dueDate, lang)}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {tr('suppliers.remainingOnBill')}: {formatIQD(n.remaining, lang)}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => openBill(n.accountId, n.billId)}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1"
                  data-testid={`open-bill-${n.billId}`}
                >
                  {tr('notifications.goToBill')} <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => toggleBillNotif(n.accountId, n.billId)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium"
                  data-testid={`disable-${n.billId}`}
                >
                  {tr('notifications.disableForBill')}
                </button>
                <button
                  onClick={() => dismissNotification(n.key)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-100 text-xs font-medium"
                  data-testid={`dismiss-${n.billId}`}
                >
                  {tr('notifications.dismiss')}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex items-center gap-2">
          <BellOff size={16} /> {tr('notifications.disabledBills')}
        </div>
        {disabled.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            {tr('notifications.noDisabled')}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {disabled.map((key) => {
              const [accId, bId] = key.split(':').map(Number);
              const acc = (state.suppliers.accounts || []).find((a) => a.id === accId);
              const bill = acc?.bills.find((b) => b.id === bId);
              return (
                <li
                  key={key}
                  className="px-5 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800">
                      {acc?.name || '?'} · B-{String(bId).padStart(4, '0')}
                    </div>
                    {bill && (
                      <div className="text-xs text-slate-500">
                        #{bill.billNumber} · {formatIQD(bill.amount, lang)}
                      </div>
                    )}
                  </div>
                  <GhostButton
                    onClick={() => toggleBillNotif(accId, bId)}
                    data-testid={`reenable-${bId}`}
                  >
                    {tr('notifications.enableForBill')}
                  </GhostButton>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
