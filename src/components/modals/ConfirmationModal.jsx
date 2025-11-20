import React from "react";

const ConfirmationModal = ({
  open,
  onClose,
  data,
  onConfirm,
  onRecharge,
  recharging,
  rechargeMessage,
}) => {
  if (!open) return null;

  const {
    currentBalance = 0,
    printingCost = 0,
    newBalance = 0,
    shortfall = 0,
  } = data || {};

  const insufficient = newBalance < 0;

  return (
    <div className="fixed inset-0 z-30 bg-black/60 flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <i className="fas fa-check-circle text-emerald-400" />
            Confirm Print Request
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Current balance</span>
            <span>₹{Number(currentBalance).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Printing cost</span>
            <span>₹{Number(printingCost).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-2 mt-1">
            <span className="text-slate-200 font-medium">New balance</span>
            <span
              className={
                insufficient ? "text-red-400 font-semibold" : "text-emerald-400"
              }
            >
              ₹{Number(newBalance).toFixed(2)}
            </span>
          </div>

          {shortfall > 0 && (
            <div className="flex justify-between text-xs mt-1">
              <span className="text-slate-400">Shortfall</span>
              <span className="text-red-300 font-semibold">
                ₹{shortfall.toFixed(2)}
              </span>
            </div>
          )}

          {insufficient && (
            <p className="text-xs text-red-300 flex items-center gap-1 mt-1">
              <i className="fas fa-exclamation-triangle" />
              Insufficient balance. You can recharge the shortfall and then
              confirm the print.
            </p>
          )}

          {rechargeMessage && (
            <p className="text-xs text-emerald-300 mt-1">
              <i className="fas fa-check-circle mr-1" />
              {rechargeMessage}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {shortfall > 0 && (
            <button
              onClick={onRecharge}
              disabled={recharging}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-amber-500 hover:bg-amber-400 inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <i className="fas fa-wallet" />
              {recharging
                ? "Processing recharge..."
                : `Recharge ₹${shortfall.toFixed(2)}`}
            </button>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              disabled={insufficient}
              onClick={onConfirm}
              className={`px-3 py-1.5 text-xs rounded-lg inline-flex items-center gap-2 ${
                insufficient
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-400"
              }`}
            >
              <i className="fas fa-qrcode" />
              Confirm &amp; Scan QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
