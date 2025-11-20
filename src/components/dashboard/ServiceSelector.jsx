import React from "react";

const cards = [
  {
    id: "upload",
    title: "Custom File Upload",
    desc: "Upload your own PDF document for printing.",
    icon: "fa-file-import",
  },
  {
    id: "printFile1",
    title: "Standard Document",
    desc: "Print our pre-approved standard document.",
    icon: "fa-file-pdf",
  },
  {
    id: "printFile2",
    title: "Legal Document",
    desc: "Print our pre-approved legal document.",
    icon: "fa-file-contract",
  },
];

const ServiceSelector = ({ selectedAction, onSelect }) => {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h3 className="font-semibold flex items-center gap-2 text-sm">
        <i className="fas fa-tasks text-indigo-400" />
        Select Printing Service
      </h3>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            className={`text-left p-4 rounded-xl border text-sm transition flex flex-col gap-2 ${
              selectedAction === card.id
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-slate-800 bg-slate-900 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <i className={`fas ${card.icon}`} />
              </div>
              <span className="font-medium text-sm">{card.title}</span>
            </div>
            <p className="text-xs text-slate-400">{card.desc}</p>
            <span className="mt-1 text-xs font-semibold text-slate-300">
              ₹0.50 / page
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ServiceSelector;
