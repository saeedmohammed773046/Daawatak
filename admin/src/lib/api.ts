export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://daawatak.onrender.com/api/v1";

function getHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }
    throw new Error("غير مصرح بالدخول. يرجى تسجيل الدخول مجدداً.");
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || "حدث خطأ ما في السيرفر");
    }
    return json;
  } else {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "حدث خطأ غير معروف");
    }
    return response.text();
  }
}
