export interface payment {
	buyer: string,
	seller: string,
	price: bigint, // Dollar cents
	status: number
}