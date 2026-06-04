import React from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, danger }) {
  const { tr } = useApp();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || tr('common.confirm')}
      testId="confirm-dialog"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium"
          >
            {tr('common.cancel')}
          </button>
          <button
            data-testid="confirm-yes"
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
            className={`px-4 py-2 rounded-lg font-medium text-white ${
              danger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-sky-500 hover:bg-sky-600'
            }`}
          >
            {tr('common.yes')}
          </button>
        </>
      }
    >
      <p className="text-slate-600">{message}</p>
    </Modal>
  );
}
