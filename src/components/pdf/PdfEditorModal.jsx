import React, { useEffect, useState, useRef } from "react";

const PdfEditorModal = ({ open, file, onDone, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]); // 1-based page numbers
  const [error, setError] = useState("");
  const [copies, setCopies] = useState(1); // number of copies
  const containerRef = useRef(null);

  // Load PDF and render thumbnails
  useEffect(() => {
    if (!open || !file) return;
    if (!window.pdfjsLib) {
      setError("PDF.js not loaded");
      return;
    }

    setLoading(true);
    setError("");
    setSelectedPages([]);
    setPageCount(0);
    setCopies(1); // reset copies when opening

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const typedarray = new Uint8Array(reader.result);
        const pdfDoc = await window.pdfjsLib
          .getDocument(typedarray)
          .promise;
        const totalPages = pdfDoc.numPages;
        setPageCount(totalPages);
        // Select all pages by default
        setSelectedPages(
          Array.from({ length: totalPages }, (_, i) => i + 1)
        );

        // Clear previous canvases
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;

          // clickable wrapper
          const wrapper = document.createElement("div");
          wrapper.className =
            "pdf-thumb border border-slate-700 rounded overflow-hidden cursor-pointer mb-2 bg-slate-900 transition-all";
          wrapper.style.position = "relative";
          wrapper.dataset.page = pageNum.toString(); // for highlighting

          wrapper.appendChild(canvas);

          // page number label
          const label = document.createElement("div");
          label.textContent = `Page ${pageNum}`;
          label.style.position = "absolute";
          label.style.bottom = "4px";
          label.style.right = "6px";
          label.style.fontSize = "10px";
          label.style.padding = "2px 4px";
          label.style.borderRadius = "999px";
          label.style.background = "rgba(15,23,42,0.8)";
          label.style.color = "#e5e7eb";
          wrapper.appendChild(label);

          // toggle selection on click
          wrapper.onclick = () => {
            setSelectedPages((prev) => {
              if (prev.includes(pageNum)) {
                return prev.filter((p) => p !== pageNum);
              } else {
                return [...prev, pageNum].sort((a, b) => a - b);
              }
            });
          };

          containerRef.current?.appendChild(wrapper);
        }

        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Failed to load PDF.");
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [open, file]);

  // Highlight selected pages
  useEffect(() => {
    if (!containerRef.current) return;

    const children = Array.from(containerRef.current.children);
    children.forEach((child) => {
      const pageNum = Number(child.dataset.page);
      if (!pageNum) return;

      if (selectedPages.includes(pageNum)) {
        child.classList.add(
          "ring-2",
          "ring-indigo-400",
          "ring-offset-2",
          "ring-offset-slate-900",
          "opacity-100"
        );
        child.classList.remove("opacity-50");
      } else {
        child.classList.remove(
          "ring-2",
          "ring-indigo-400",
          "ring-offset-2",
          "ring-offset-slate-900"
        );
        child.classList.add("opacity-50");
      }
    });
  }, [selectedPages]);

  // Select all / clear selection
  const handleSelectAll = () => {
    if (!pageCount) return;
    setSelectedPages(
      Array.from({ length: pageCount }, (_, i) => i + 1)
    );
  };

  const handleClearSelection = () => {
    setSelectedPages([]);
  };

  // Apply selection and build new PDF with jsPDF
  const handleApply = async () => {
    if (!file || !window.pdfjsLib || !window.jspdf) return;

    if (!selectedPages.length) {
      setError("Please select at least one page.");
      return;
    }

    const copiesInt = Number(copies) || 0;
    if (copiesInt < 1) {
      setError("Number of copies must be at least 1.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { jsPDF } = window.jspdf;
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const typedarray = new Uint8Array(reader.result);
          const pdfDoc = await window.pdfjsLib
            .getDocument(typedarray)
            .promise;

          const pdfOut = new jsPDF({
            unit: "pt",
            format: "a4",
          });

          // Build a flat list: [p1, p2, ..., pN, p1, p2, ...] for each copy
          const orderedPages = [];
          for (let c = 0; c < copiesInt; c++) {
            for (const p of selectedPages) {
              orderedPages.push(p);
            }
          }

          for (let i = 0; i < orderedPages.length; i++) {
            const pageNum = orderedPages[i];
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: ctx, viewport }).promise;

            const imgData = canvas.toDataURL("image/jpeg", 1.0);

            const pageWidth = pdfOut.internal.pageSize.getWidth();
            const pageHeight = pdfOut.internal.pageSize.getHeight();

            const ratio = Math.min(
              pageWidth / canvas.width,
              pageHeight / canvas.height
            );
            const imgWidth = canvas.width * ratio;
            const imgHeight = canvas.height * ratio;
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;

            pdfOut.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);

            if (i !== orderedPages.length - 1) {
              pdfOut.addPage();
            }
          }

          const blob = pdfOut.output("blob");
          const newFile = new File([blob], `edited-${file.name}`, {
            type: "application/pdf",
          });

          const totalPagesPrinted = orderedPages.length;
          onDone({ file: newFile, pages: totalPagesPrinted });
          setLoading(false);
        } catch (err) {
          console.error(err);
          setError("Failed to generate edited PDF.");
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (e) {
      console.error(e);
      setError("Unexpected error while editing PDF.");
      setLoading(false);
    }
  };

  if (!open || !file) return null;

  const copiesInt = Number(copies) || 0;
  const totalPagesPrinted =
    selectedPages.length > 0 && copiesInt > 0
      ? selectedPages.length * copiesInt
      : 0;

  return (
    <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col gap-4 max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <i className="fas fa-edit text-indigo-400" />
              PDF Editor
            </h3>
            <p className="text-xs text-slate-400">
              Click pages to select/deselect. Selected pages are highlighted.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-100"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/50 rounded px-3 py-2">
            <i className="fas fa-exclamation-triangle mr-1" />
            {error}
          </div>
        )}

        {/* Thumbnails area */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden border border-slate-800 rounded-xl bg-slate-950/40">
          {/* Select all / clear buttons */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs">
            <div className="text-slate-400">
              Pages:{" "}
              <span className="text-slate-100 font-semibold">
                {pageCount}
              </span>{" "}
              | Selected:{" "}
              <span className="text-emerald-400 font-semibold">
                {selectedPages.length}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700"
              >
                Clear selection
              </button>
            </div>
          </div>

          {/* Thumbs grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading && (
              <div className="flex items-center justify-center h-40 text-xs text-slate-400 gap-2">
                <i className="fas fa-spinner fa-spin" />
                Loading PDF...
              </div>
            )}
            <div
              ref={containerRef}
              className="grid gap-3 sm:grid-cols-2 md:grid-cols-3"
            />
          </div>
        </div>

        {/* Copies + summary */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Copies:</span>
              <input
                type="number"
                min="1"
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
                className="w-16 rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-xs outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="text-slate-400">
            Total pages to print:{" "}
            <span className="text-indigo-300 font-semibold">
              {totalPagesPrinted}
            </span>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-2 text-xs">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleApply}
            className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 inline-flex items-center gap-2 disabled:opacity-60"
          >
            <i className="fas fa-check" />
            Apply Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfEditorModal;
