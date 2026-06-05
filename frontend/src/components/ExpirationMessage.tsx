import React from "react";
import { AlertCircle, Clock } from "lucide-react";

interface ExpirationMessageProps {
  message?: string;
  onDismiss?: () => void;
}

export const ExpirationMessage: React.FC<ExpirationMessageProps> = ({
  message = "Your reservation has expired. The stock has been released.",
  onDismiss,
}) => {
  const [show, setShow] = React.useState(true);

  const handleDismiss = () => {
    setShow(false);
    onDismiss?.();
  };

  if (!show) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-4 animate-pulse">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="text-yellow-500 hover:text-yellow-700"
          >
            <span className="sr-only">Dismiss</span>
            <Clock className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
