// Pure notification computation: from state -> array of notifications.
// A notification represents a pending alert for a bill that is due within 14 days
// or already overdue, repeating every 2 days while the bill is not fully paid.

import { paymentsForBill } from './derive';

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function computeNotifications(state, now = new Date()) {
  const today = startOfDay(now);
  const out = [];
  const disabled = new Set(state.notifications.disabledBills || []);
  const dismissed = new Set(state.notifications.dismissedKeys || []);

  for (const acc of state.suppliers.accounts || []) {
    for (const bill of acc.bills || []) {
      if (!bill.dueDate) continue;
      const key = `${acc.id}:${bill.id}`;
      if (disabled.has(key)) continue;

      const paid = paymentsForBill(acc, bill.id).reduce(
        (s, p) => s + Number(p.amount || 0),
        0
      );
      const remaining = Number(bill.amount || 0) - paid;
      if (remaining <= 0) continue; // paid in full

      const due = startOfDay(bill.dueDate);
      const daysLeft = Math.round(
        (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // window: due within 14 days OR overdue
      if (daysLeft > 14) continue;

      // Repetition every 2 days from the start of the window.
      // Window start = dueDate - 14 days.
      const windowStart = new Date(due);
      windowStart.setDate(windowStart.getDate() - 14);
      const sinceWindow = Math.floor(
        (today.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Only emit if (sinceWindow % 2 === 0) -> day 0, 2, 4, ...
      // To still show overdue alerts daily-ish (every 2 days), keep the same modulo.
      const cadenceTick = Math.max(0, Math.floor(sinceWindow / 2));
      // We always include the latest tick in the list (don't filter by cadence for display);
      // The cadence is used for the unique notification key so user can dismiss one and the
      // next tick (2 days later) creates a fresh notification entry.
      const notifKey = `${acc.id}:${bill.id}:tick-${cadenceTick}`;
      if (dismissed.has(notifKey)) continue;

      out.push({
        key: notifKey,
        accountId: acc.id,
        accountName: acc.name,
        billId: bill.id,
        billNumber: bill.billNumber,
        amount: bill.amount,
        remaining,
        dueDate: bill.dueDate,
        daysLeft,
        overdue: daysLeft < 0,
      });
    }
  }

  // Sort: overdue first (most overdue), then by daysLeft ascending
  out.sort((a, b) => a.daysLeft - b.daysLeft);
  return out;
}
