import { Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  eventName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  eventName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
        onClick={handleModalClick}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-700">&quot;{eventName}&quot;</span>?
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
