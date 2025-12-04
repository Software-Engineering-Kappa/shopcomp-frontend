export type Purchase = {
    id: number,
    itemName: string,
    itemCategory: string,
    itemMostRecentPrice: number,
    purchaseDate: string,
    purchasePrice: number,
    chainName: string,
    address: {
        houseNumber: string,
        street: string,
        city: string,
        state: string,
        postCode: string,
        country: string
    }
}
// Quantity?