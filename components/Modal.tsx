'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  onClose: () => void;
  labelledBy: string;
  widthClass?: string;
  children: React.ReactNode;
}

/**
 * Native <dialog>: focus trap, Esc to close, and inert background come from the browser.
 * Mount it only while open so its inner form state always starts from current props.
 */
export default function Modal({ onClose, labelledBy, widthClass = 'w-[32rem]', children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`modal ${widthClass}`}
    >
      <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border border-ink bg-paper p-5 sm:p-6">
        {children}
      </div>
    </dialog>
  );
}
