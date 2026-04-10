const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const fetcher = (url: string) => apiFetch(url);

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
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "An error occurred" }));
        throw new Error(error.message || response.statusText);
    }

    return response.json();
}
