import React, { useRef } from "react";

const UploadSection = ({ fileName, onFileSelected }) => {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h3 className="font-semibold flex items-center gap-2 text-sm">
        <i className="fas fa-cloud-upload-alt text-indigo-400" />
        Upload Your Document
      </h3>

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center cursor-pointer bg-slate-950/40 hover:border-slate-500 transition"
      >
        <i className="fas fa-file-upload text-2xl text-slate-300 mb-2" />
        <p className="text-sm font-medium">Drag & drop your PDF here</p>
        <p className="text-xs text-slate-400">
          or click to browse files (PDF only, max 25MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {fileName && (
        <div className="text-xs text-slate-300">
          Selected file:{" "}
          <span className="font-medium text-indigo-300">{fileName}</span>
        </div>
      )}
    </section>
  );
};

export default UploadSection;
