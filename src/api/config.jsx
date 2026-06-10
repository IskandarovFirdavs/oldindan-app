/**
 * Oldindan API configuration
 *
 * Change BASE_URL to your nginx / ngrok / production backend URL.
 * Example: https://your-domain.ngrok-free.app
 */
export const BASE_URL = "https://dad5-87-192-224-196.ngrok-free.app";

export const API_PATHS = {
  accounts: "/api/accounts",
  restaurants: "/api/restaurants",
  layouts: "/api/layouts",
  tables: "/api/tables",
  bookings: "/api/bookings",
  notifications: "/api/notifications",
};

export const OTP_EXPIRY_SECONDS = 300; // 5 minutes — matches backend TelegramOTP.default_expiry

export const BOOKING_STATUS = {
  pending: { label: "Pending", color: "#F59E0B" },
  confirmed: { label: "Confirmed", color: "#10B981" },
  checked_in: { label: "Checked In", color: "#3B82F6" },
  completed: { label: "Completed", color: "#6B7280" },
  canceled: { label: "Canceled", color: "#EF4444" },
  no_show: { label: "No Show", color: "#991B1B" },
};

export const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed", "checked_in"];
