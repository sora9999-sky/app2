import React from 'react';

export function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="text-sm font-medium text-slate-700 block mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 ${
        props.className || ''
      }`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 ${
        props.className || ''
      }`}
    >
      {props.children}
    </select>
  );
}

export function PrimaryButton({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={`px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-sm shadow-sky-200 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={`px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition ${className}`}
    >
      {children}
    </button>
  );
}

export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {right && <div className="flex gap-2">{right}</div>}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-sky-100 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="text-center py-12 px-6">
      {Icon && (
        <div className="mx-auto w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center text-sky-400 mb-4">
          <Icon size={28} />
        </div>
      )}
      <div className="font-semibold text-slate-700">{title}</div>
      {hint && <div className="text-sm text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}
