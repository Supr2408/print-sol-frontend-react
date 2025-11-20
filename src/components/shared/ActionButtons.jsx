import React from "react";

const ActionButtons = ({ onSend, onCancel }) => (
  <div className="flex flex-wrap gap-3">
    <button
      onClick={onSend}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-sm font-medium"
    >
      <i className="fas fa-paper-plane" />
      Send Print Request
    </button>
    <button
      onClick={onCancel}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs"
    >
      <i className="fas fa-times" />
      Cancel
    </button>
  </div>
);

export default ActionButtons;
