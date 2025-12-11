import { SearchItem } from '../searchableList'

export interface Purchase extends SearchItem {
    purchaseId: number,
    itemName: string,
    itemCategory: string,
    itemMostRecentPrice: number,
    purchaseDate: string,
    purchasePrice: number,
    purchaseQuantity: number,
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