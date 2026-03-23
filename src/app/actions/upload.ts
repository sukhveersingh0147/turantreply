"use server";

/**
 * Uploads an image to a public hosting service (ImgBB) and returns the URL.
 * In production, you should use your own Cloudinary or Vercel Blob keys.
 */
export async function uploadImage(formData: FormData) {
    const file = formData.get("image") as File;
    if (!file) throw new Error("No file provided");

    // Security: Validate file type and size
    if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
        console.error("Invalid file type:", file.type);
        throw new Error(`Only images and PDFs are allowed (got: ${file.type})`);
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max 10MB)`);
    }

    // Use environment variable first, then fallback to demo key
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY || "388836511a938c983a54779603f95e55";

    try {
        const body = new FormData();
        body.append("image", file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: body,
        });

        const result = await response.json();
        
        if (result.success) {
            return { url: result.data.url };
        } else {
            console.error("ImgBB Upload failed:", result);
            const errorMsg = result.error?.message || "Internal storage error";
            throw new Error(`Cloud Storage Error: ${errorMsg}`);
        }
    } catch (error: any) {
        console.error("Primary upload error:", error);
        throw new Error(error.message || "Failed to upload image to cloud storage");
    }
}
