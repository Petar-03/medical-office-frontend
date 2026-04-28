const API_BASE_URL = "http://localhost:3001/api";

type ApiResponse<T> = {
  message: string;
  data: T;
};

export function getDoctorId(): string {
  const doctorId = localStorage.getItem("doctorId");

  if (!doctorId) {
    throw new Error("Липсва doctorId. Моля, влезте отново.");
  }

  return doctorId;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem("authToken");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const result = (await response.json()) as Partial<ApiResponse<T>>;

  if (!response.ok) {
    throw new Error(result.message || "Заявката беше неуспешна.");
  }

  return result.data as T;
}
