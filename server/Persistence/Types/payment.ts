export interface payment {
	id: bigint,
	buyer: string,
	seller: string,
	price: bigint, // Dollar cents
	status: number,
	created: bigint,
	confirmed: bigint | null // Also cancelled
}