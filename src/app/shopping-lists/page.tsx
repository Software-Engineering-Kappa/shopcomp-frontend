"use client"
import styles from "./page.module.css"
import React from "react"
import { ShoppingListSearch, CreateShoppingListForm, EditShoppingList, ShoppingList } from "./boundary"
import Header from "../header"


export default function ShoppingListsPage() {
  const [createShoppingList, setCreateShoppingList] = React.useState(false);
  const [editShoppingList, setEditShoppingList] = React.useState(false);
  const [selectedShoppingList, setSelectedShoppingList] = React.useState<ShoppingList | null>(null);

  return (
    <div>
      <Header />
      <main>
        <h1>Shopping Lists</h1>
        {
          !createShoppingList && !editShoppingList &&
          <div>
            <ShoppingListSearch
              createShoppingList={createShoppingList}
              onSelectShoppingList={(shoppingList: ShoppingList) => {
                setSelectedShoppingList(shoppingList); // Pass the selected shopping list
                setEditShoppingList(true); // Open the EditShoppingList menu
              }}
            />
            <button className="create-shopping-list" onClick={() => setCreateShoppingList(true)}>Create Shopping List</button>
          </div>
        }
        {
          createShoppingList &&
          <CreateShoppingListForm
            setDisplayed={setCreateShoppingList} 
            onCreateShoppingList={(shoppingList: ShoppingList) => {
              setCreateShoppingList(false);
              setEditShoppingList(true);
            }}
            />
        }
        {
          editShoppingList && selectedShoppingList &&
          <EditShoppingList shoppingList={selectedShoppingList} setDisplayed={setEditShoppingList} />
        }
      </main>
    </div>
  )
}