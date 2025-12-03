"use client"
import styles from "./page.module.css"
import React from "react"
import { ShoppingListSearch, CreateShoppingListForm } from "./boundary"
import Header from "../header"


export default function ShoppingListsPage() {
  const [createShoppingList, setCreateShoppingList] = React.useState(false);
  return (
    <div>
      <Header />
      <main>
        <h1>Shopping Lists</h1>
        <ShoppingListSearch createShoppingList={createShoppingList} />
        <button className="create-shopping-list" onClick={() => setCreateShoppingList(true)}>Create Shopping List</button>
      </main>
      <CreateShoppingListForm displayed={createShoppingList} setDisplayed={setCreateShoppingList} />
    </div>
  )
}