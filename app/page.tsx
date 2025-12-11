"use client";

import React, { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("Idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      alert("Please select a 3D model file first.");
      return;
    }

    setStatus("Uploading and starting job...");
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
        // For our early mock version
        setStatus("Done! Download is ready.");
        setDownloadUrl(data.downloadUrl);
      } else {
        setStatus("Job started (mock). Real splitting coming soon.");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("Error starting job.");
      alert("Something went wrong starting the job.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-xl p-6 rounded-xl border border-gray-700 bg-gray-900">
        <h1 className="text-2xl font-bold mb-2 text-center">
          3D Auto Splitter (v1)
        </h1>
        <p className="text-sm mb-6 text-center">
          Upload a 3D model (STL/OBJ/GLB). We&apos;ll send it to our splitter
          backend and return separate parts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">
              Choose a 3D model file:
            </label>
            <input
              type="file"
              accept=".stl,.obj,.glb,.gltf"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                setDownloadUrl(null);
              }}
              className="block w-full text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-md bg-lime-400 hover:bg-lime-300 text-black font-semibold"
          >
            Start Split Job
          </button>
        </form>

        <div className="mt-4 text-sm">
          <div>
            <span className="font-semibold">Status:</span> {status}
          </div>
          {downloadUrl && (
            <div className="mt-2">
              <a
                href={downloadUrl}
                className="underline"
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