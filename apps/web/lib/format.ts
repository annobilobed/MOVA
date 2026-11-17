const TZ = "Africa/Accra";

export const cedis = (pesewas: number) =>
  `GH₵ ${(pesewas / 100).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: TZ }).format(new Date(iso));

export const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ }).format(new Date(iso));

export const formatDateTime = (iso: string) => `${formatDate(iso)} · ${formatTime(iso)}`;

export const tripTypeLabel = (t: "inter_regional" | "campus_shuttle") => (t === "campus_shuttle" ? "Campus shuttle" : "Inter-regional");

export const luggageLabel = (l: string) =>
  ({ none: "Hand luggage only", standard: "One standard bag", large: "Large or extra bag" })[l] ?? l;

/** Today's date in Accra as YYYY-MM-DD, for date inputs. */
export const todayInAccra = () => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());

export const roleHome = (role: string) =>
  ({ student: "/dashboard", driver: "/driver", operator: "/operator", super_admin: "/admin" })[role] ?? "/";
