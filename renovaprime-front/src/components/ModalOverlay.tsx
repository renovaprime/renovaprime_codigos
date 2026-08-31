import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalOverlayProps {
  children: ReactNode;
  onBackdropClick?: () => void;
}

export function ModalOverlay({ children, onBackdropClick }: ModalOverlayProps) {
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onBackdropClick} />
      <div className="relative z-10 max-h-full w-full flex items-center justify-center">
        {children}
      </div>
    </div>,
    document.body
  );
}
