'use client';

import Modal from './Modal';

interface ConfirmResetModalProps {
  onClose: () => void;
  onConfirm: () => void;
  batchCount: number;
}

export default function ConfirmResetModal({ onClose, onConfirm, batchCount }: ConfirmResetModalProps) {
  return (
    <Modal onClose={onClose} labelledBy="reset-title" widthClass="w-[26rem]">
      <h2 id="reset-title" className="mb-2 font-cond text-2xl font-bold leading-tight">
        Kosongkan semua riwayat?
      </h2>
      <p className="mb-5 text-muted">
        {batchCount} batch di riwayat dan semua krat yang sedang ditimbang akan dihapus permanen dari database.
        Salin atau unduh rekapnya dulu kalau masih perlu.
      </p>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn" onClick={onClose}>
          Batal
        </button>
        <button
          type="button"
          className="btn btn-danger-solid"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Hapus semuanya
        </button>
      </div>
    </Modal>
  );
}
