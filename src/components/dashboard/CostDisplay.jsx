import React from "react";

const CostDisplay = ({ pages, pricePerPage, total }) => {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-400">Pages</span>
        <span className="font-medium">{pages}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Price per page</span>
        <span className="font-medium">₹{pricePerPage.toFixed(2)}</span>
      </div>
      <div className="flex justify-between border-t border-slate-800 pt-3 mt-2">
        <span className="text-slate-200 font-medium">Total cost</span>
        <span className="font-semibold text-emerald-400">
          ₹{total.toFixed(2)}
        </span>
      </div>
    </section>
  );
};

export default CostDisplay;
