/** Admin coupon detail returned by GET/PATCH (JSON dates as ISO strings). */
export interface AdminCouponDetail {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  quantity: number | null;
  active: boolean;
  expiresAt: string | null;
  allowedUserIds: string[];
}

export interface CouponFormSubmitPayload {
  code: string;
  discountType: string;
  discountValue: number;
  quantity: number | null;
  allowedUserIds: string[];
  expiresAt: string | null;
}
