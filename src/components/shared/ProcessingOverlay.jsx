import React from "react";

const ProcessingOverlay = ({ open }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm">
        <i className="fas fa-spinner fa-spin" />
        <span>Processing transaction...</span>
      </div>
    </div>
  );
};

export default ProcessingOverlay;
