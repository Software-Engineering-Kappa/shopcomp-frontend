"use client"
import styles from "./page.module.css"
import React from "react"
import { ShoppingListSearch, CreateShoppingListForm, EditShoppingList, ShoppingList, ReportOptionsForm } from "./boundary"
import Header from "../header"


export default function ShoppingListsPage() {
  const [createShoppingList, setCreateShoppingList] = React.useState(false);
  const [editShoppingList, setEditShoppingList] = React.useState(false);
  const [selectedShoppingList, setSelectedShoppingList] = React.useState<ShoppingList | null>(null);
  const [reportOptions, setReportOptions] = React.useState<boolean>(false);
  const [listLocked, setListLocked] = React.useState(false)

  return (
    <div>
      <Header />
      <main>
        <h1>Shopping Lists</h1>
        {
          !createShoppingList && !editShoppingList && !reportOptions &&
          <div>
            <ShoppingListSearch
              createShoppingList={createShoppingList}
              onSelectShoppingList={(shoppingList: ShoppingList) => {
                setSelectedShoppingList(shoppingList); // Pass the selected shopping list
              }}
              onLockChangeShoppingList={(locked) => { setListLocked(locked) }}
            />
            <div className={styles.actionsContainer}>
              <button className="create-shopping-list" onClick={() => setCreateShoppingList(true)}>Create Shopping List</button>
              {selectedShoppingList && listLocked && (
                <div>
                  <button type="button" className="edit-shopping-list-button" onClick={() => setEditShoppingList(true)}>Edit Shopping List</button>
                  <button type="button" className="report-options-button" onClick={() => setReportOptions(true)}>Report Options</button>
                </div>
              )}
            </div>
          </div>
        }
        {
          createShoppingList &&
          <CreateShoppingListForm
            setDisplayed={setCreateShoppingList}
            onCreateShoppingList={(shoppingList: ShoppingList) => {
              setCreateShoppingList(false);
              setEditShoppingList(true);
              setSelectedShoppingList(shoppingList);
            }}
          />
        }
        {
          editShoppingList && selectedShoppingList &&
          <EditShoppingList shoppingList={selectedShoppingList} setDisplayed={setEditShoppingList} />
        }
        {
          reportOptions && selectedShoppingList != null &&
          <ReportOptionsForm listId={selectedShoppingList.id} listName={selectedShoppingList.name} setVisibility={setReportOptions} />
        }
      </main>
    </div>
  )
}