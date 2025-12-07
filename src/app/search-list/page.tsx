"use client"

import React from "react"
import { SearchableList, SearchItem } from "../searchableList"

// Extend the `SearchItem` interface with a custom one representing the item to be searched.
// You do not need to add an `id` field since `SearchItem` already has that.
interface Chain extends SearchItem {
  name: string
}

// This list is for demonstration purposes. In reality, you would use the list that is returned
// by a backend API endpoint.
//
// Importantly, the list items have to be objects that extend the `SearchItem` interface, which
// requires them to have the `content` property. The `content` property is what the search query
// is matched against, and is the text that appears in the item elements
const chains: Chain[] = [
  { id: 1, name: "Market Basket" },   // <-- These are objects returned by `GET /chains`
  { id: 2, name: "BJs" },
  { id: 3, name: "Stop & Shop" },
  { id: 4, name: "Price Chopper" },
  { id: 5, name: "Dunkin Donuts" },
].map((obj) => {
  // Here, I make the `content` a concatenation of the chain name and chain ID
  return {
    ...obj,
    content: `${obj.name}: ID ${obj.id}`
  }
})


export default function Page() {
  const [items, setItems] = React.useState(chains)

  // Define a callback function to handle when a user selects an element.
  // This could be the function that triggers the edit menu to show for receipts and shopping lists.
  function handleSelect(selection: Chain) {
    console.log("Selected item: ", selection.name)
  }

  // Optionally, you can define a callback function to handle when a user deletes an element.
  // For example, this could be for the delete chain and delete store use cases.
  function handleDelete(selection: Chain) {
    console.log("Deleting item: ", selection.name)

    // In reality, this would call `DELETE /chains/{chainId}` where {chainId} is selection.id

    // For demonstration, remove `selection` from the list
    setItems(prevItems => prevItems.filter(item => item.id !== selection.id))
  }

  return (
    <div style={{display: "flex", justifyContent: "center"}}>
      <SearchableList
        placeholderText="Enter chain name"
        items={items}                   // <-- This is the list of items that can be searched through
        onSelect={handleSelect}
        // onDelete={handleDelete}      // <-- Uncomment this line to make items deletable
      />
    </div>
  )
}


