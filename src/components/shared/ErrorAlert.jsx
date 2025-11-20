import React from "react";

const ErrorAlert = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200">
      <i className="fas fa-exclamation-triangle" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorAlert;
