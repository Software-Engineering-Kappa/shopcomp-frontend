// the type that ReceiptSearch uses
export interface ReceiptHeader {
    receiptId: number;
    storeName: string;
    date: string;
    totalAmount: number
}

// general type that all other components/functions use
export interface Receipt {
    receiptId: number;
    chainId: number;
    storeId: number;
    chainName?: string;
    date: string;
    items: Purchase[];
}

export interface StoreChain {
    ID: number;
    name: string;
}

export interface Address {
    houseNumber: string;
    street: string;
    city: string;
    state: string;
    postCode: string;
    country: string;
}

export interface Store {
    id: number;
    address: Address;
}

export interface Purchase {
    purchaseId: number;
    itemName: string;
    price: number;
    category: string;
    quantity: number;
}

