export interface settledPayment {
  id: bigint,
  paymentEntryId: bigint,
  client: string,
  status: number,
  created: string,
  confirmed: string // Also cancelled
}