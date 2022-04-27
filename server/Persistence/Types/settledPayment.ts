export interface settledPayment {
  id: bigint,
  paymentEntryId: bigint,
  client: string,
  status: number,
  time: bigint,
  finalizedTime: bigint // Also cancelled
}