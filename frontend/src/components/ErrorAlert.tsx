import { AlertCircleIcon, CloseIcon } from "./Icons";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export function ErrorAlert({
  title = "Action Failed",
  message,
  onDismiss,
}: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="error-alert" role="alert" aria-live="assertive">
      <div className="error-icon-box">
        <AlertCircleIcon size={20} />
      </div>

      <div className="error-content">
        <div className="error-title">{title}</div>
        <div className="error-message">{message}</div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="error-dismiss-btn"
          aria-label="Dismiss error notification"
          type="button"
        >
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  );
}
