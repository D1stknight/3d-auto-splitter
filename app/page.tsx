"use client";

import React, { useState, useMemo } from "react";

type StatusKind = "idle" | "working" | "done" | "error";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<StatusKind>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("Idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const statusPillClass = useMemo(() => {
    if (status === "idle") return "ra-status-pill ra-status-pill--idle";
    if (status === "working") return "ra-status-pill ra-status-pill--working";
    if (status === "done") return "ra-status-pill ra-status-pill--done";
    return "ra-status-pill ra-status-pill--error";
  }, [status]);

  function resetStatus() {
    setStatus("idle");
    setStatusMessage("Idle");
    setDownloadUrl(null);
  }

  function handleFileSelected(selected: File | null) {
    setFile(selected);
    resetStatus();
  }

  // Drag & drop handlers
  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    // Only reset when leaving the dropzone area
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    const f = droppedFiles[0];

    // Optional: basic extension check
    const allowed = [".stl", ".obj", ".glb", ".gltf"];
    const lowerName = f.name.toLowerCase();
    const isAllowed = allowed.some((ext) => lowerName.endsWith(ext));

    if (!isAllowed) {
      alert("Please drop a .stl, .obj, .glb, or .gltf file.");
      return;
    }

    handleFileSelected(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      alert("Please select a 3D model file first.");
      return;
    }

    setIsSubmitting(true);
    setStatus("working");
    setStatusMessage("Uploading and starting split job…");
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append("model", file);

      const res = await fetch("/api/start-job", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to start job");
      }

      const data = await res.json();

      if (data.downloadUrl) {
        setStatus("done");
        setStatusMessage("Done! Download is ready.");
        setDownloadUrl(data.downloadUrl);
      } else {
        setStatus("working");
        setStatusMessage(
          "Job started (mock). Real splitting engine coming soon."
        );
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setStatusMessage("Something went wrong starting the job.");
      alert("Something went wrong starting the job.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const dropzoneClassName = isDragging
    ? "ra-dropzone ra-dropzone--active"
    : "ra-dropzone";

  return (
    <main className="app-root">
      <div className="ra-card">
        <div className="ra-card-inner">
          <header className="ra-card-header">
            <div className="ra-title-block">
              <div className="ra-title">
                <span>3D Auto Splitter</span>
                <span className="ra-pill">v1 · prototype</span>
              </div>
              <div className="ra-subtitle">
                Upload a 3D model. We&apos;ll send it to the splitter backend and
                return separated, print-ready parts.
              </div>
            </div>
            <div className="ra-logo-dot" aria-hidden="true" />
          </header>

          <form onSubmit={handleSubmit}>
            <div className="ra-upload-section">
              {/* DROPZONE SIDE */}
              <div
                className={dropzoneClassName}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="ra-dropzone-label">Choose or drop a 3D model</div>
                <div className="ra-dropzone-helper">
                  Supported: <strong>.stl</strong>, <strong>.obj</strong>,{" "}
                  <strong>.glb</strong>, <strong>.gltf</strong> · For best
                  results, use watertight meshes under ~100&nbsp;MB.
                  <br />
                  <br />
                  <span>
                    Tip: You can <strong>drag &amp; drop</strong> a file directly
                    onto this panel.
                  </span>
                </div>

                <div className="ra-file-input-row">
                  <input
                    type="file"
                    accept=".stl,.obj,.glb,.gltf"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      if (f) {
                        handleFileSelected(f);
                      } else {
                        handleFileSelected(null);
                      }
                    }}
                  />
                </div>

                {file && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: "0.78rem",
                      color: "#e5e7eb",
                    }}
                  >
                    Selected: <strong>{file.name}</strong>
                  </div>
                )}
              </div>

              {/* INFO SIDE */}
              <aside className="ra-info">
                <div className="ra-info-title">What this prototype does</div>
                <ul className="ra-info-list">
                  <li>Handles file upload through a secure API route.</li>
                  <li>Mocks a splitter engine and returns a fake ZIP link.</li>
                  <li>
                    Real engine will segment the mesh into logical printable parts
                    with auto connectors.
                  </li>
                  <li>
                    Designed for multi-color, multi-part toys and figurines (Rebel
                    Ants and beyond).
                  </li>
                </ul>
              </aside>
            </div>

            <button
              type="submit"
              className="ra-primary-btn"
              disabled={isSubmitting || !file}
            >
              {isSubmitting ? "Starting Split Job…" : "Start Split Job"}
            </button>
          </form>

          <div className="ra-status-bar">
            <div>
              <span className="ra-status-label">Status:</span>{" "}
              <span>{statusMessage}</span>
            </div>
            <div className={statusPillClass}>
              {status === "idle" && "IDLE"}
              {status === "working" && "RUNNING"}
              {status === "done" && "READY"}
              {status === "error" && "ERROR"}
            </div>
          </div>

          {downloadUrl && (
            <div style={{ marginTop: 8 }}>
              <a
                href={downloadUrl}
                className="ra-download-link"
                target="_blank"
                rel="noreferrer"
              >
                Download split parts (ZIP)
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}