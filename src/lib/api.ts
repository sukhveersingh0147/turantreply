const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const fetcher = (url: string) => apiFetch(url).then(res => {
    if (!res.ok) throw new Error("API fetch failed");
    return res.json();
});

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
    
    // Ensure credentials are sent to the same-root domain
    options.credentials = options.credentials || "include";
    
    // Default headers
    options.headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const response = await fetch(url, options);
    return response;
}
