export type UserType = "admin" | "employee" | "client";

export interface PaymentData {
  uid: string;
  amount: string;
  currency: UserType;
  status: string;
  createdAt: string;
    userId: string;
}


