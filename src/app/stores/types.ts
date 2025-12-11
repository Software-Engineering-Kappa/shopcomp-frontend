import { SearchItem } from '../searchableList'

export interface Chain extends SearchItem {
  id: number
  name: string
}

export interface Store extends SearchItem {
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