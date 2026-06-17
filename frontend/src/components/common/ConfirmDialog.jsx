import { useEffect, useRef } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './ConfirmDialog.css';

const ConfirmDialog = ({
  open,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const dialogRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && open) onCancel?.();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className={`confirm-dialog confirm-dialog--${variant}`}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <button className="confirm-dialog__close" onClick={onCancel} aria-label="Close">
          <FiX />
        </button>

        <div className={`confirm-dialog__icon confirm-dialog__icon--${variant}`}>
          <FiAlertTriangle />
        </div>

        <h3 id="confirm-title" className="confirm-dialog__title">{title}</h3>
        <p id="confirm-message" className="confirm-dialog__message">{message}</p>

        <div className="confirm-dialog__actions">
          <button
            className="btn btn-ghost confirm-dialog__cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`btn confirm-dialog__confirm confirm-dialog__confirm--${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
