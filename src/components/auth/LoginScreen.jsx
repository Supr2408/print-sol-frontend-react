import React from "react";

const LoginScreen = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center">
            <i className="fas fa-print text-white text-xl" />
          </div>
          <h1 className="text-2xl font-semibold">SmartPrint</h1>
          <p className="text-sm text-slate-400 text-center">
            Secure, fast, and convenient digital printing solutions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-400 justify-center">
          <span className="px-2 py-1 rounded-full bg-slate-800">
            <i className="fas fa-bolt mr-1" />
            Instant printing
          </span>
          <span className="px-2 py-1 rounded-full bg-slate-800">
            <i className="fas fa-lock mr-1" />
            Secure uploads
          </span>
          <span className="px-2 py-1 rounded-full bg-slate-800">
            <i className="fas fa-wallet mr-1" />
            Wallet payments
          </span>
        </div>

        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 font-medium py-2.5 rounded-xl hover:bg-slate-100 transition"
        >
          <i className="fab fa-google" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
