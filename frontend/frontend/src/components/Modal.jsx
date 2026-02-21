function Modal({ isOpen, title, children, onClose, onConfirm, confirmText = "Confirm" }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          {onConfirm && (
            <button className="primary-btn" onClick={onConfirm}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
