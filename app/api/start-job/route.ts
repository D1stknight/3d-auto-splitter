import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("model");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // For now we are faking the splitter.
    // Later this is where we'll:
    // - upload the file to storage
    // - call our Python worker to do real splitting
    // - return a job ID or real download link.

    const mockDownloadUrl = "https://example.com/mock-split-parts.zip";

    return NextResponse.json(
      {
        message: "Mock job started successfully",
        downloadUrl: mockDownloadUrl,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to start job" },
      { status: 500 }
    );
  }
}