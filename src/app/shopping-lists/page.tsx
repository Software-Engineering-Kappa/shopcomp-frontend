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
        {
          !createShoppingList &&
          <div>
            <ShoppingListSearch createShoppingList={createShoppingList} />
            <button className="create-shopping-list" onClick={() => setCreateShoppingList(true)}>Create Shopping List</button>
          </div>
        }
        {
          createShoppingList &&
          <CreateShoppingListForm setDisplayed={setCreateShoppingList} />
        }
      </main>
    </div>
  )
}