import React from "react";

const EditChoiceModal = ({ open, onClose, onEdit, onUseOriginal }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30 bg-black/60 flex items-center justify-center">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <i className="fas fa-edit text-indigo-400" />
            PDF Processing Option
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Choose whether to edit your PDF (e.g., pages per sheet) or use it as
          is. Currently only page-count calculation is implemented.
        </p>

        <div className="space-y-2">
          <button
            onClick={onEdit}
            className="w-full px-3 py-2 text-xs rounded-lg bg-indigo-500 hover:bg-indigo-400 inline-flex items-center justify-center gap-2"
          >
            <i className="fas fa-pencil-alt" />
            Edit PDF
          </button>
          <button
            onClick={onUseOriginal}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 inline-flex items-center justify-center gap-2"
          >
            <i className="fas fa-file" />
            Use Original
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditChoiceModal;
