import { AxiosError } from "axios";

// ─── Extract a user-friendly error message from Axios errors ──────────────────

export function getApiError(error: unknown): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data;

        // Backend returns { message: "..." }
        if (data?.message && typeof data.message === "string") {
            return data.message;
        }

        // Backend returns validation errors as { field: ["msg"] } or { field: "msg" }
        if (data && typeof data === "object") {
            const values = Object.values(data);
            for (const val of values) {
                if (typeof val === "string") return val;
                if (Array.isArray(val) && typeof val[0] === "string") return val[0];
                if (Array.isArray(val) && typeof val[0] === "object") {
                    // nested: { non_field_errors: ["msg"] }
                    const inner = Object.values(val[0]);
                    if (typeof inner[0] === "string") return inner[0] as string;
                }
            }
        }

        // Fallback to status text
        if (error.response?.statusText) return error.response.statusText;
        if (error.message) return error.message;
    }

    if (error instanceof Error) return error.message;
    return "Something went wrong. Please try again.";
}
