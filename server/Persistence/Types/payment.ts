export interface payment {
	id: bigint,
	buyer: string,
	seller: string,
	price: bigint, // Dollar cents
	status: number
}