import React from "react";

const Header = ({ user, onLogout }) => {
  const initials =
    user?.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="fixed top-0 inset-x-0 z-20 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-500 flex items-center justify-center">
            <i className="fas fa-print text-white" />
          </div>
          <span className="font-semibold text-lg">SmartPrint Portal</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700"
          >
            <i className="fas fa-sign-out-alt mr-1" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
