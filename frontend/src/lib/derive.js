// Derived calculations.
export function totalRevenues(state) {
  return (state.safe.revenues || []).reduce((s, r) => s + Number(r.amount || 0), 0);
}

export function totalExpenses(state) {
  return (state.expenses.entries || []).reduce((s, e) => s + Number(e.amount || 0), 0);
}

export function totalSupplierPayments(state) {
  let sum = 0;
  for (const acc of state.suppliers.accounts || []) {
    for (const p of acc.payments || []) sum += Number(p.amount || 0);
  }
  return sum;
}

export function safeBalance(state) {
  return totalRevenues(state) - totalExpenses(state) - totalSupplierPayments(state);
}

export function accountTotals(account) {
  const totalBills = (account.bills || []).reduce(
    (s, b) => s + Number(b.amount || 0),
    0
  );
  const totalPayments = (account.payments || []).reduce(
    (s, p) => s + Number(p.amount || 0),
    0
  );
  return { totalBills, totalPayments, outstanding: totalBills - totalPayments };
}

export function paymentsForBill(account, billId) {
  return (account.payments || []).filter((p) => p.billId === billId);
}

export function billStatus(bill, account, today = new Date()) {
  const paid = paymentsForBill(account, bill.id).reduce(
    (s, p) => s + Number(p.amount || 0),
    0
  );
  const remaining = Number(bill.amount || 0) - paid;
  const dueDate = bill.dueDate ? new Date(bill.dueDate) : null;
  if (remaining <= 0) return { code: 'paid', paid, remaining: 0, dueDate };
  if (dueDate) {
    const daysLeft = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft < 0) return { code: 'overdue', paid, remaining, dueDate, daysLeft };
    if (daysLeft <= 14) return { code: 'due-soon', paid, remaining, dueDate, daysLeft };
  }
  return { code: 'open', paid, remaining, dueDate };
}
