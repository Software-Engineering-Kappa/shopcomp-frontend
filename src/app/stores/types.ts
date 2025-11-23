export type Chain = {
  id: number
  name: string
}

export type Store = {
    id: number
    address: {
        houseNumber: string
        street: string
        city: string
        state: string
        postCode: string
        country: string
    }
}