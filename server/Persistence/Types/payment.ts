export interface payment {
	id: bigint,
	buyer: string,
	seller: string,
	price: bigint, // Dollar cents
	status: number,
	created: string,
	confirmed: string // Also cancelled
}