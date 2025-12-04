export type Purchase = {
    id: number
    itemName: string
    price: number
    chainName: string
    storeAddress: {
        houseNumber: string
        street: string
        city: string
        state: string
        postCode: string
        country: string
    }
    date: string
}
// Quantity?