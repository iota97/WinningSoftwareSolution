export interface settledPayment {
  id: bigint,
  item_id: bigint,
  buyer: string,
  status: number,
  created: string,
  confirmed: string // Also cancelled
}