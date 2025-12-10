export interface SearchItem {
  content: string
  id: number | string
}

export interface Chain extends SearchItem {
  name: string
}

export interface Store extends SearchItem {
    address: {
        houseNumber: string
        street: string
        city: string
        state: string
        postCode: string
        country: string
    }
}