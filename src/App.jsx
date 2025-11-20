import React, { useEffect, useState } from "react";
import { auth, db, firebase } from "./firebase";
import { API_BASE_URL } from "./config";
import Header from "./components/layout/Header";
import LoginScreen from "./components/auth/LoginScreen";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import ServiceSelector from "./components/dashboard/ServiceSelector";
import UploadSection from "./components/dashboard/UploadSection";
import PageInput from "./components/dashboard/PageInput";
import CostDisplay from "./components/dashboard/CostDisplay";
import ErrorAlert from "./components/shared/ErrorAlert";
import ActionButtons from "./components/shared/ActionButtons";
import ConfirmationModal from "./components/modals/ConfirmationModal";
import EditChoiceModal from "./components/modals/EditChoiceModal";
import ScannerOverlay from "./components/qr/ScannerOverlay";
import ProcessingOverlay from "./components/shared/ProcessingOverlay";
import PdfEditorModal from "./components/pdf/PdfEditorModal";
import WalletRecharge from "./components/wallet/WalletRecharge";

const PRICE_PER_PAGE = 0.5;

function App() {
  // auth
  const [user, setUser] = useState(null);
  const [userDocRef, setUserDocRef] = useState(null);
  const [balance, setBalance] = useState(0);

  // main UI
  const [selectedAction, setSelectedAction] = useState(null); // "upload" | "printFile1" | "printFile2"
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editedPdfFile, setEditedPdfFile] = useState(null);

  const [pageCount1, setPageCount1] = useState("");
  const [pageCount2, setPageCount2] = useState("");
  const [pagesDisplay, setPagesDisplay] = useState(0);
  const [currentCost, setCurrentCost] = useState(0);

  // modals & overlays
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEditChoice, setShowEditChoice] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [confirmData, setConfirmData] = useState({
    currentBalance: 0,
    printingCost: 0,
    newBalance: 0,
    shortfall: 0,
  });

  // PDF editor state
  const [showPdfEditor, setShowPdfEditor] = useState(false);
  const [editorFile, setEditorFile] = useState(null);

  // recharge-in-modal state
  const [recharging, setRecharging] = useState(false);
  const [rechargeMessage, setRechargeMessage] = useState("");

  // === AUTH LISTENER ===
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        const ref = db.collection("users").doc(u.uid);
        setUserDocRef(ref);

        const doc = await ref.get();
        if (!doc.exists) {
          await ref.set({
            balance: 100,
            email: u.email,
            name: u.displayName || "User",
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }

        ref.onSnapshot((snap) => {
          const data = snap.data();
          if (data && typeof data.balance === "number") {
            setBalance(data.balance);
          }
        });
      } else {
        setUser(null);
        setUserDocRef(null);
        setBalance(0);
      }
    });

    return () => unsub();
  }, []);

  // === HELPERS ===
  const clearError = () => setError("");
  const showError = (msg) => setError(msg);

  const handleLogin = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(() => {
      showError("Failed to sign in. Please try again.");
    });
  };

  const handleLogout = () => {
    auth.signOut();
  };

  const handleServiceSelect = (action) => {
    setSelectedAction(action);
    clearError();
    setCurrentCost(0);
    setPagesDisplay(0);
  };

  const updateCost = (pages) => {
    const p = Number(pages) || 0;
    setPagesDisplay(p);
    setCurrentCost(p * PRICE_PER_PAGE);
  };

  // PDF page count via pdf.js
  const calculatePdfPages = (file) => {
    if (!file) return;
    if (!window.pdfjsLib) {
      showError("PDF library not loaded.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const typedarray = new Uint8Array(reader.result);
        const pdfDoc = await window.pdfjsLib.getDocument(typedarray).promise;
        const totalPages = pdfDoc.numPages;
        updateCost(totalPages);
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        showError("Error reading PDF file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileSelected = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      showError("Please upload a valid PDF file.");
      setSelectedFile(null);
      setFileName("");
      return;
    }
    clearError();
    setSelectedFile(file);
    setFileName(file.name);
    setShowEditChoice(true);
  };

  // open full PDF editor
  const onEditPdf = () => {
    setShowEditChoice(false);
    if (!selectedFile) return;
    setEditorFile(selectedFile);
    setShowPdfEditor(true);
  };

  const handleEditorDone = ({ file, pages }) => {
    setShowPdfEditor(false);
    setEditedPdfFile(file);
    updateCost(pages);
  };

  const handleEditorCancel = () => {
    setShowPdfEditor(false);
  };

  const onUseOriginalPdf = () => {
    setShowEditChoice(false);
    calculatePdfPages(selectedFile);
  };

  const resetStateForNewJob = () => {
    setSelectedAction(null);
    setSelectedFile(null);
    setEditedPdfFile(null);
    setFileName("");
    setPageCount1("");
    setPageCount2("");
    setPagesDisplay(0);
    setCurrentCost(0);
    clearError();
  };

  // === SEND PRINT CLICK ===
  const handleSendPrint = () => {
    clearError();
    setRechargeMessage("");

    if (!user) {
      showError("Please sign in first.");
      return;
    }
    if (!selectedAction) {
      showError("Please select a service first.");
      return;
    }

    if (selectedAction === "upload" && !selectedFile && !editedPdfFile) {
      showError("Please select a file to upload.");
      return;
    }
    if (selectedAction === "printFile1" && !pageCount1) {
      showError("Please enter page count.");
      return;
    }
    if (selectedAction === "printFile2" && !pageCount2) {
      showError("Please enter page count.");
      return;
    }

    if (!userDocRef) {
      showError("User data not loaded yet.");
      return;
    }

    userDocRef.get().then((doc) => {
      const cb = doc.data().balance;
      const pc = currentCost;
      const nb = cb - pc;
      const shortfall = Math.max(0, pc - cb);

      setConfirmData({
        currentBalance: cb,
        printingCost: pc,
        newBalance: nb,
        shortfall,
      });
      setShowConfirm(true);
    });
  };

  // === RECHARGE SHORTFALL FROM MODAL (Razorpay) ===
  const handleRechargeShortfall = async () => {
    if (!user) return;
    if (!window.Razorpay) {
      showError("Razorpay SDK not loaded.");
      return;
    }

    const shortfall = Math.max(
      0,
      confirmData.printingCost - confirmData.currentBalance
    );
    if (shortfall <= 0) {
      setRechargeMessage("No recharge needed.");
      return;
    }

    try {
      setRecharging(true);
      setRechargeMessage("");
      clearError();

      const token = await user.getIdToken(true);

      // 1. Create Razorpay order
      const res = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: shortfall }), // rupees
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create Razorpay order.");
      }

      const order = await res.json();

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "SmartPrint Wallet Recharge",
        description: "Shortfall recharge for print request",
        order_id: order.order_id,
        prefill: {
          email: user.email,
          name: user.displayName || "",
        },
        theme: {
          color: "#6366f1",
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(
              `${API_BASE_URL}/api/payments/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: order.amount, // paise
                }),
              }
            );

            const verifyData = await verifyRes.json().catch(() => ({}));
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(
                verifyData.detail ||
                  verifyData.message ||
                  "Payment verification failed"
              );
            }

            // Refresh Firestore balance and confirmation data
            if (userDocRef) {
              const doc = await userDocRef.get();
              const cb = doc.data().balance;
              const pc = confirmData.printingCost;
              const nb = cb - pc;
              const shortfallNew = Math.max(0, pc - cb);
              setConfirmData((prev) => ({
                ...prev,
                currentBalance: cb,
                newBalance: nb,
                shortfall: shortfallNew,
              }));
            }

            setRechargeMessage(
              "Payment successful! Your wallet has been recharged."
            );
          } catch (err) {
            console.error(err);
            showError(err.message || "Payment verification failed.");
          } finally {
            setRecharging(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setRecharging(false);
      showError(err.message || "Recharge failed.");
    }
  };

  // === CONFIRM & QR ===
  const startQrAndSend = (backendUrl) => {
    const sanitizedUrl = backendUrl;
    const fileToPrint = editedPdfFile || selectedFile;

    if (selectedAction === "upload") {
      user
        .getIdToken(true)
        .then((token) => {
          const formData = new FormData();
          formData.append("file", fileToPrint);
          formData.append("token", token);
          formData.append("uid", user.uid);

          return fetch(`${sanitizedUrl}/upload`, {
            method: "POST",
            body: formData,
          });
        })
        .then((res) => res.text())
        .then((text) => {
          alert(text);
          resetStateForNewJob();
        })
        .catch(() => {
          showError("Error uploading file.");
        });
    } else {
      const pageCount =
        selectedAction === "printFile1" ? pageCount1 : pageCount2;

      user
        .getIdToken(true)
        .then((token) =>
          fetch(`${sanitizedUrl}/print_${selectedAction}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              page_count: pageCount,
              token,
              uid: user.uid,
              user_email: user.email,
            }),
          })
        )
        .then((res) => res.text())
        .then((text) => {
          alert(text);
          resetStateForNewJob();
        })
        .catch(() => {
          showError("Error sending print request.");
        });
    }
  };

  const handleConfirmPrint = async () => {
    if (!userDocRef) return;
    try {
      setShowConfirm(false);
      setProcessing(true);

      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(userDocRef);
        const currentBalance = doc.data().balance;
        if (currentBalance < currentCost) {
          throw new Error("Insufficient balance");
        }
        transaction.update(userDocRef, {
          balance: currentBalance - currentCost,
        });
      });

      setProcessing(false);
      setShowScanner(true);
    } catch (e) {
      setProcessing(false);
      showError(e.message || "Transaction failed.");
    }
  };

  const handleQrScanned = (url) => {
    setShowScanner(false);
    startQrAndSend(url);
  };

  const showCost =
    (selectedAction === "upload" && currentCost > 0) ||
    ((selectedAction === "printFile1" || selectedAction === "printFile2") &&
      currentCost > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <>
          <Header user={user} onLogout={handleLogout} />
          <main className="pt-20 pb-10 flex-1">
            <div className="max-w-5xl mx-auto px-4 space-y-6">
              <DashboardHeader balance={balance} />

              {/* Optional standalone wallet recharge */}
              <WalletRecharge user={user} />

              {selectedAction === "upload" && (
                <UploadSection
                  fileName={fileName}
                  onFileSelected={handleFileSelected}
                />
              )}

              <ServiceSelector
                selectedAction={selectedAction}
                onSelect={handleServiceSelect}
              />

              {selectedAction === "printFile1" && (
                <PageInput
                  label="Number of Pages to Print (Standard Document)"
                  value={pageCount1}
                  onChange={(v) => {
                    setPageCount1(v);
                    updateCost(v);
                  }}
                />
              )}

              {selectedAction === "printFile2" && (
                <PageInput
                  label="Number of Pages to Print (Legal Document)"
                  value={pageCount2}
                  onChange={(v) => {
                    setPageCount2(v);
                    updateCost(v);
                  }}
                />
              )}

              {showCost && (
                <CostDisplay
                  pages={pagesDisplay}
                  pricePerPage={PRICE_PER_PAGE}
                  total={currentCost}
                />
              )}

              {error && <ErrorAlert message={error} />}

              <ActionButtons
                onSend={handleSendPrint}
                onCancel={resetStateForNewJob}
              />
            </div>
          </main>

          <footer className="border-t border-slate-800 py-4 text-sm text-slate-500">
            <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex flex-wrap gap-3">
                <a href="#" className="hover:text-slate-300">
                  About
                </a>
                <a href="#" className="hover:text-slate-300">
                  Privacy
                </a>
                <a href="#" className="hover:text-slate-300">
                  Terms
                </a>
                <a href="#" className="hover:text-slate-300">
                  Contact
                </a>
              </div>
              <p>© 2025 SmartPrint Technologies</p>
            </div>
          </footer>
        </>
      )}

      <ConfirmationModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        data={confirmData}
        onConfirm={handleConfirmPrint}
        onRecharge={handleRechargeShortfall}
        recharging={recharging}
        rechargeMessage={rechargeMessage}
      />
      <EditChoiceModal
        open={showEditChoice}
        onClose={() => setShowEditChoice(false)}
        onEdit={onEditPdf}
        onUseOriginal={onUseOriginalPdf}
      />
      <ScannerOverlay
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onScanned={handleQrScanned}
      />
      <PdfEditorModal
        open={showPdfEditor}
        file={editorFile}
        onDone={handleEditorDone}
        onCancel={handleEditorCancel}
      />
      <ProcessingOverlay open={processing} />
    </div>
  );
}

export default App;
