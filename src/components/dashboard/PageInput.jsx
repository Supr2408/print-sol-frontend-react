import React from "react";

const PageInput = ({ label, value, onChange }) => {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
      <label className="text-xs font-medium text-slate-300">{label}</label>
      <input
        type="number"
        min="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        placeholder="Enter number of pages"
      />
    </section>
  );
};

export default PageInput;
