export type Role = "student" | "driver" | "operator" | "super_admin";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string | null;
  role: Role;
  companyId: string | null;
}

export type TripStatus = "available" | "fully_booked" | "departed" | "cancelled";

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  departureAt: string;
  farePesewas: number;
  tripType: "inter_regional" | "campus_shuttle";
  bus: { id: string; plate: string; capacity: number };
  operator: string;
  seatsLeft: number;
  status: TripStatus;
  bookable: boolean;
  isDemo: boolean;
  cancelReason?: string | null;
}

export type SeatState = "available" | "selected" | "booked" | "locked";
export type SeatLayout = (string | null)[][];

export type PaymentStatus = "pending" | "successful" | "failed" | "refunded" | "flagged";

export interface Payment {
  reference: string;
  status: PaymentStatus;
  statusReason: string | null;
  tripId: string;
  seat: string;
  luggage: Luggage;
  farePesewas: number;
  luggagePesewas: number;
  amountPesewas: number;
  provider: "paystack" | "test";
  kind: "booking" | "luggage_topup";
  bookingId: string | null;
}

export type Luggage = "none" | "standard" | "large";

export interface Ticket {
  id: string;
  tripId: string;
  passenger: string;
  studentId: string | null;
  origin: string;
  destination: string;
  departureAt: string;
  tripType: Trip["tripType"];
  busPlate: string;
  operator: string;
  seat: string;
  luggage: Luggage;
  status: "confirmed" | "boarded" | "cancelled";
  boardedAt: string | null;
  reference: string;
  amountPesewas: number;
  upcoming: boolean;
  cancelReason?: string | null;
  qrSvg?: string;
}
