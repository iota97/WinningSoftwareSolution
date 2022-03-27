export interface settledPayment {
  id: bigint,
  paymentEntryId: bigint,
  client: string,
  status: number,
  created: bigint,
  confirmed: bigint | null // Also cancelled
}