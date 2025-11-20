import React from "react";

const DashboardHeader = ({ balance }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold">Printing Dashboard</h2>
        <p className="text-sm text-slate-400">
          Choose a service, review cost and send your print job.
        </p>
      </div>
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <i className="fas fa-wallet text-emerald-400" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Wallet Balance</p>
          <p className="font-semibold">
            ₹{Number(balance || 0).toFixed(2)}
          </p>
        </div>
      </div>

    </div>

    
  );
};

export default DashboardHeader;
