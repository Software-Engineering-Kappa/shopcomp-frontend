import React, { useState, useEffect } from "react";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { backend } from "../../axiosClient";
import { create } from "domain";
import styles from "./page.module.css"
import { ReceiptHeader, Receipt, StoreChain, Address, Store, Purchase } from "./types"
import OpenAI from "openai"

// reactive input bar for receipts
export function ReceiptSearch({ createReceipt, editReceipt, setReceiptId }: { createReceipt: boolean; editReceipt: boolean; setReceiptId: (receiptId: number) => void }) {

  interface ReceiptSearchResult {
    receiptList: ReceiptHeader[];
  }

  // the persistent list of receipts from the API call
  const allReceipts = React.useRef<ReceiptHeader[]>([]);
  // search query in the search bar
  const [query, setQuery] = React.useState<string>("");
  // search results under the search bar
  const [results, setResults] = React.useState<ReceiptHeader[]>([]);
  // if the input is focused and should display results
  const [focused, setFocused] = React.useState<boolean>(true);

  // current toString function
  const receiptToString = (receipt: ReceiptHeader): string => {
    const dt = new Date(receipt.date);
    // fallback if invalid date
    const dateStr = isNaN(dt.getTime())
      ? receipt.date // whatever the server sent, if unparsable
      : new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(dt);
    return `${receipt.storeName} - ${dateStr} - $${receipt.totalAmount.toFixed(2)} (#${receipt.receiptId})`;
  }

  const stringToReceiptId = (str: string): number => {
    const validReceipts: ReceiptHeader[] = allReceipts.current.filter((r) => receiptToString(r) === str);
    if (validReceipts.length === 1) return validReceipts[0].receiptId;
    else return -1;
  }

  // calls search on the first render so the autofocus shows results
  React.useEffect(() => {
    search()
  }, []);

  // calls search when createReceipt changes e.g. receipt potentially added or edited
  React.useEffect(() => {
    search()
  }, [createReceipt, editReceipt]);

  // filter results on query change
  React.useEffect(() => {
    setResults(allReceipts.current.filter((r) => receiptToString(r).toLowerCase().includes(query.trim().toLowerCase())));
    const newReceiptId = stringToReceiptId(query);
    if (!createReceipt && !editReceipt) // don't select receipt if popup opened
      setReceiptId(newReceiptId); // will be -1 if not a valid receipt
  }, [query]);

  // calls the API to search receipts
  const search = async () => {
    try {
      // call API
      const response = await backend.get<ReceiptSearchResult>("/receipts");

      // set allReceipts and results with API response
      allReceipts.current = response.data.receiptList;
      setResults(response.data.receiptList);

    } catch (error) { // axios automatically throws error on 400s
      console.error(error);
    }
  };

  const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
    setQuery(e.currentTarget.textContent);
    setResults([]);
  }

  return ( // TODO reinstate image (get rid of DELETEME/ when styling)
    <div className="search-list">
      <input
        type="text"
        placeholder="Search for receipts"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { setFocused(true); }}
        onBlur={() => setTimeout(() => setFocused(false), 100)} // delay to let query fill input (from ChatGPT)
        disabled={createReceipt || editReceipt}
        autoFocus
      />
      {/* <img src="search-button-svgrepo-com.svg" alt="search icon"/> */}
      {focused && (!createReceipt && !editReceipt) && (
        <ul className="receipts">
          {results.map((receipt) => (
            <li key={receipt.receiptId}>
              <button
                type="button"
                id={"button-" + receipt.receiptId}
                onMouseDown={(e) => handlePress(e)}
              >
                {receiptToString(receipt)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// reactive input bar for store chains, used by CreateReceiptForm
function StoreChainInput({ setChainId }: { setChainId: (id: number) => void }) {

  interface StoreChainSearchResult {
    chains: StoreChain[];
  }

  const storeChainToString = (storeChain: StoreChain): string => {
    return storeChain.name;
  }
  // returns -1 if can't find, actual id if can
  const stringToChainId = (str: string): number => {
    const validChains: StoreChain[] = allStoreChains.current.filter((s) => s.name.trim() === str);
    if (validChains.length === 1) return validChains[0].ID;
    else return -1;
  }

  // the persistent list of receipts from the API call
  const allStoreChains = React.useRef<StoreChain[]>([]);

  // search query for the input
  const [query, setQuery] = React.useState<string>("");
  // matches under the search bar
  const [results, setResults] = React.useState<StoreChain[]>([]);
  // if the input is focused and should display results
  const [focused, setFocused] = React.useState<boolean>(true);

  // calls search on the first render so the autofocus shows results
  React.useEffect(() => {
    search();
  }, []);

  // filter results on query change
  React.useEffect(() => {
    setResults(allStoreChains.current.filter((r) => storeChainToString(r).toLowerCase().includes(query.trim().toLowerCase())));
    // check if fully filled out
    const newChainId = stringToChainId(query);
    setChainId(newChainId);
  }, [query]);

  // calls the API to search store chains
  const search = async () => {
    try {
      // call API
      const response = await backend.get<StoreChainSearchResult>("/chains");

      // set allStoreChains and results with API response
      allStoreChains.current = response.data.chains;
      setResults(response.data.chains);

    } catch (error) { // axios automatically throws error on 400s
      console.error(error);
    }
  };

  const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
    const chainId: number = parseInt(e.currentTarget.id.slice("button-".length));
    setChainId(chainId);
    setQuery(e.currentTarget.textContent);
    setResults([]);
  };

  return (
    <div className="store-chain-input">
      <label htmlFor="store-chain">Store chain:</label>
      <input
        type="text"
        id="store-chain"
        placeholder="chain name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 100)}
        autoFocus
      />
      {focused && (
        <ul className="store-chains">
          {results.map((storeChain) => (
            <li key={storeChain.ID}>
              <button
                type="button"
                id={"button-" + storeChain.ID}
                onMouseDown={(e) => handlePress(e)}
              >
                {storeChainToString(storeChain)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// reactive input bar for store locations, used by CreateReceiptForm
function LocationInput({ chainId, setStoreId }: { chainId?: number, setStoreId: (id: number) => void }) {

  interface LocationSearchResult {
    stores: Store[];
  }

  const storeToString = (store: Store): string => {
    return (
      store.address.houseNumber + " "
      + store.address.street + ", "
      + store.address.city + ", "
      + store.address.state + " "
      + store.address.postCode
    );
  }
  // returns -1 if can't find, actual id if can
  const stringToStoreId = (str: string): number => {
    const validStores: Store[] = allStores.current.filter((s) => storeToString(s) === str);
    if (validStores.length === 1) return validStores[0].id;
    else return -1;
  }

  // the persistent list of receipts from the API call
  const allStores = React.useRef<Store[]>([]);

  // search query in the search bar
  const [query, setQuery] = React.useState<string>("");
  // search results under the search bar
  const [results, setResults] = React.useState<Store[]>([]);
  // if the input is focused and should display results
  const [focused, setFocused] = React.useState<boolean>(false);

  // calls search on changes of chainId (if chainId is set)
  React.useEffect(() => {
    if (chainId && chainId >= 0) search(chainId);
    else setResults([]);
  }, [chainId]);

  // filter results on query change
  React.useEffect(() => {
    setResults(allStores.current.filter((r) => storeToString(r).toLowerCase().includes(query.trim().toLowerCase())));
    // check if fully filled out
    const newStoreId = stringToStoreId(query);
    if (newStoreId >= 0) setStoreId(newStoreId);
    else setStoreId(-1); // invalid storeId because not fully filled out
  }, [query]);

  // calls the API to search store locations
  const search = async (chainId: number) => {
    try {
      // call API
      const response = await backend.get<LocationSearchResult>(`/chains/${chainId}/stores`);

      // set allStores and results with API response
      allStores.current = response.data.stores;
      setResults(response.data.stores);

    } catch (error) { // axios automatically throws error on 400s
      console.error(error);
    }
  };

  const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
    const storeId: number = parseInt(e.currentTarget.id.slice("button-".length));
    setStoreId(storeId);
    setQuery(e.currentTarget.textContent);
    setResults([]);
  }

  return (
    <div className="location-input">
      <label htmlFor="location">Location:</label>
      <input
        type="text"
        id="location"
        placeholder="store address"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 100)}
      />
      {focused && (
        <ul className="location">
          {results.map((store) => (
            <li key={store.id}>
              <button
                type="button"
                id={"button-" + store.id}
                onMouseDown={(e) => handlePress(e)}
              >
                {storeToString(store)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// popup for creating new receipts
export function CreateReceiptForm({ displayed, setDisplayed, setEditReceiptDisplayed, setReceiptId }: { displayed: boolean; setDisplayed: (displayed: boolean) => void; setEditReceiptDisplayed: (editReceiptDisplayed: boolean) => void; setReceiptId: (receiptId: number) => void }) {

  interface CreateReceiptResponse {
    receipt: Receipt;
  }

  const [chainId, setChainId] = React.useState<number>();
  const [storeId, setStoreId] = React.useState<number>();

  const submitCreateReceipt = async () => {
    const date = document.getElementById("date") as HTMLInputElement;
    const time = document.getElementById("time") as HTMLInputElement;

    try {
      // check that all fields are filled out
      if (chainId === -1 || storeId === -1 || date.value.length === 0) throw new Error("Not all fields filled out.");

      // append time to date
      const actualTime = (time.value.length !== 0) ? time.value : "12:00";
      const actualDate = date.value + "T" + actualTime + ":00";
      console.log("actDate: " + actualDate); // TODO delete; test

      // call API
      const response = await backend.post<CreateReceiptResponse>("/receipts", {
        chainId: chainId,
        storeId: storeId,
        date: actualDate
      });

      const receiptId = response.data.receipt.receiptId; // changed from `.id` to `.receiptId`
      if (receiptId >= 0) {
        setReceiptId(receiptId);
        setEditReceiptDisplayed(true);
      }

      // close popup if successful
      setDisplayed(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {displayed && (
        <div className="create-receipt-form">
          <button type="button" className="close-popup" onClick={() => setDisplayed(false)}>X</button>

          <StoreChainInput setChainId={setChainId} />
          <LocationInput chainId={chainId} setStoreId={setStoreId} />
          <label htmlFor="date">Date:</label>
          <input type="date" id="date" placeholder="YYYY-MM-DD" required />
          <input type="time" id="time" placeholder="HH:MM XM" />

          <button type="button" className="create-receipt" onClick={() => submitCreateReceipt()}>Create Receipt</button>
        </div>
      )}
    </>
  );
}

// a popup for viewing and editing a selected receipt
export function EditReceiptForm({
  displayed,
  setDisplayed,
  receiptId,
  receipt,
  setReceipt,
}: {
  displayed: boolean,
  setDisplayed: (displayed: boolean) => void,
  receiptId: number,
  receipt: Receipt | undefined,
  setReceipt: (r: Receipt | undefined) => void,
}) {

  // the receipt being edited
  // const [receipt, setReceipt] = React.useState<Receipt>();
  // the header of the receipt being edited
  const [receiptHeader, setReceiptHeader] = React.useState<ReceiptHeader>();
  // purchase IDs marked for deletion
  const purchasesToDelete = React.useRef<number[]>([]);
  // default item number if itemName field deleted
  const defaultItemIndex = React.useRef<number>(1);
  // ensures only one purchase is being edited at a time
  const purchaseBeingEdited = React.useRef<boolean>(false);

  // displays a table row of the given purchase
  function PurchaseRow({ purchase }: { purchase: Purchase }) {

    // if the purchase is being edited
    const [edit, setEdit] = React.useState<boolean>(false);

    // previous values, in case of cancellation
    const ogReceipt = React.useRef<Receipt>(structuredClone(receipt));

    // opens up the purchase to being edited
    const editPurchase = () => {
      if (!purchaseBeingEdited.current) {
        setEdit(true);
        purchaseBeingEdited.current = true;
      }
    }

    // editable fields of the row
    const [itemName, setItemName] = React.useState<string>(purchase.itemName);
    const [price, setPrice] = React.useState<number>(purchase.price);
    const [quantity, setQuantity] = React.useState<number>(purchase.quantity)

    // cancels the purchase edit, reverting changes back to before edit button pressed
    const cancelEditPurchase = () => {
      if (purchaseBeingEdited.current) {
        setReceipt(ogReceipt.current); // TODO should it be a copy of it?
        setEdit(false);
        purchaseBeingEdited.current = false;
      }
    }

    // submits new purchase values of edited purhcase and closes it to further editing
    const submitPurchase = () => {
      if (!receipt) {
        console.error("receipt undefined");
        return;
      }

      // check valid ranges of input values
      if (price < 0.01) setPrice(0.01);
      if (quantity < 1) setQuantity(1);

      // get original receipt and purchase
      const newReceipt = structuredClone(receipt);
      const purchaseIndex = receipt.items.indexOf(purchase);
      const newPurchase = newReceipt.items[purchaseIndex];
      const ogPurchaseId = newPurchase.purchaseId;
      // set new values of new purchase
      newPurchase.purchaseId = -1; // marked as edited
      newPurchase.itemName = itemName;
      newPurchase.price = price;
      newPurchase.quantity = quantity;
      newReceipt.items[purchaseIndex] = newPurchase;
      // check that purchase is different
      const diffItemName = newPurchase.itemName !== purchase.itemName;
      const diffPrice = newPurchase.price !== purchase.price;
      const diffQuantity = newPurchase.quantity !== purchase.quantity;
      if (diffItemName || diffPrice || diffQuantity) {
        // remove old purchase
        if (ogPurchaseId >= 0) // ensure purchaseId not already set for deletion
            purchasesToDelete.current.push(ogPurchaseId);
        // update receipt
        setReceipt(newReceipt);
        ogReceipt.current = structuredClone(newReceipt);
      }

      setEdit(false);
      purchaseBeingEdited.current = false;
    }

    // deletes the current purchase from the receipt
    const deletePurchase = () => {
      if (!receipt) {
        console.error("receipt undefined");
        return;
      }

      // get original receipt and purchase
      const newReceipt = structuredClone(receipt);
      const purchaseIndex = receipt.items.indexOf(purchase);
      const deletedPurchase = newReceipt.items[purchaseIndex];
      // mark new purchase for deletion
      if (deletedPurchase.purchaseId >= 0)
        purchasesToDelete.current.push(deletedPurchase.purchaseId);
      newReceipt.items.splice(purchaseIndex, 1);
      // update receipt
      setReceipt(newReceipt);
      ogReceipt.current = structuredClone(newReceipt);

      setEdit(false);
      purchaseBeingEdited.current = false;
    }

    const checkItemName = () => {
      if (!receipt) {
        console.log("receipt not defined");
        return;
      }
      if (itemName.length < 1) {
        setItemName("Item #" + defaultItemIndex.current++);
      } else if (receipt.items.filter((p) => p.purchaseId !== purchase.purchaseId).map((p) => p.itemName).includes(itemName)) {
        // setItemName(itemName + " #" + defaultItemIndex.current++);
        setItemName("Item #" + defaultItemIndex.current++);
        alert("Duplicate item name \"" + itemName + "\"- please change.");
      }
    }

    const checkPrice = () => {
      if (price < 0.01) {
        setPrice(0.01);
      }
    };

    const checkQuantity = () => {
      if (quantity < 1) {
        setQuantity(1);
      }
    };

    // the full row of inputs for the given purchase
    return (
      <tr>
        <td>
          <input
            type="text"
            style={{width: "100%"}}
            id={`edit-item-name-${purchase.purchaseId}`}
            disabled={!edit}
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onBlur={() => checkItemName()}
          />
        </td>
        <td>
          <span className={styles.dollars}>
            <input
              type="number"
              id={`edit-price-${purchase.purchaseId}`}
              disabled={!edit}
              value={price}
              step="0.01"
              onChange={(e) => setPrice(Number(e.target.value))}
              onBlur={() => checkPrice()}
            />
          </span>
        </td>
        <td>
          <input
            type="number"
            id={`edit-quantity-${purchase.quantity}`}
            disabled={!edit}
            value={quantity}
            step="1"
            min="1"
            onChange={(e) => setQuantity(Number(e.target.value))}
            onBlur={() => checkQuantity()}
          />
        </td>
        <td className={styles.actionCell}>
          <span className={styles.actionIcons}>
            {!edit && 
              <button 
                className={styles.iconButton}
                type="button" 
                id="edit-purchase" 
                onClick={() => editPurchase()}
              >
              edit
            </button>}
            {edit && 
              <button 
                className={styles.iconButton}
                type="button" 
                id="submit-purchase" 
                onClick={() => submitPurchase()}
              >
                submit
              </button>}
            {edit && 
              <button 
                className={styles.iconButton}
                type="button" 
                id="cancel-edit-purchase" 
                onClick={() => cancelEditPurchase()}
              >
                cancel
              </button>}
            <button 
              className={styles.iconButton}
              type="button" 
              id="delete-purchase" 
              onClick={() => deletePurchase()}
            >
              delete
            </button>
          </span>
        </td>
      </tr>
    );
  }

  // adds a new purchase
  const addPurchase = () => {
    if (!receipt) {
      console.log("receipt undefined");
      return;
    }

    // get input values
    const itemName = document.getElementById("add-item-name") as HTMLInputElement;
    const price = document.getElementById("add-price") as HTMLInputElement;
    const category = document.getElementById("add-category") as HTMLInputElement;
    const quantity = document.getElementById("add-quantity") as HTMLInputElement;

    // check if all inputs are valid
    const validItemName = itemName.value && itemName.value.length > 0 && !receipt.items.map((p) => p.itemName).includes(itemName.value);
    const validPrice = price.value && Number(price.value) > 0;
    const validCategory = category.value && category.value.length > 0;
    const validQuantity = quantity.value && Number(quantity.value) > 0;
    if (validItemName && validPrice && validCategory && validQuantity) {

      // get original receipt
      const newReceipt = structuredClone(receipt);

      // construct new purchase
      const newPurchase: Purchase = {
        purchaseId: -1, // marked for additon
        itemName: itemName.value,
        price: Number(price.value),
        category: category.value,
        quantity: Number(quantity.value),
      }

      // clear inputs
      itemName.value = "";
      price.value = "";
      category.value = "";
      quantity.value = "";

      // set new receipt
      newReceipt.items.push(newPurchase);
      setReceipt(newReceipt);
    } else {
      alert("Invalid or incomplete fields"); // TODO could replace with a more UI-integrated/native-feeling alert
    }
  }

  const submitEditReceipt = async () => {
    if (!receipt) {
      console.log("receipt undefined");
      return;
    }

    try {
      // delete all purchases marked for deletion
      purchasesToDelete.current.forEach(async (pid) => {
        // call purchase deletion API
        const response = await backend.delete(`/receipts/${receiptId}/items/${pid}`);
      });
      purchasesToDelete.current = [];

      // add new purchases (fully new or edited)
      const newPurchases = receipt.items.filter((p) => p.purchaseId === -1);
      for (const p of newPurchases) {
        await backend.post(`/receipts/${receiptId}/items`, {
          itemName: p.itemName,
          price: p.price,
          category: p.category,
          quantity: p.quantity,
          date: receipt.date,
        })
      }

      // close popup if successful
      setDisplayed(false);
    } catch (error) {
      console.error("Error submitting receipt: ", error);
    }
  }

  // format date from ISO to more readable
  const formatDate = (date: string): string => {
    const dt = new Date(date);
    // fallback if invalid date
    const dateStr = isNaN(dt.getTime())
      ? date // whatever the server sent, if unparsable
      : new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(dt);
    return dateStr;
  }

  // call getReceipt when receiptId or displayed state changes
  React.useEffect(() => {
    // sets the receipt to that of the receiptId
    const getReceipt = async () => {
      try {

        // call API
        const response = await backend.get<Receipt>(`/receipts/${receiptId}`);

        // set receipt to API response if valid
        const newReceipt = response.data;
        setReceipt(newReceipt);

      } catch (error) { // axios automatically throws error on 400s
        console.error(error);
        return false;
      }
    };

    if (receiptId >= 0) getReceipt();
  }, [receiptId, displayed]);

  // calls PurchaseRow under category names for all purchases
  function ListPurchases() {
    // create list of categories
    const [categories, setCategories] = React.useState<string[]>([]);

    // compile a list of the categories
    React.useEffect(() => {
      const newCategories: string[] = [];
      if (receipt) {
        receipt.items.forEach((p) => {
          if (!newCategories.includes(p.category) && p.purchaseId >= -1)
            newCategories.push(p.category);
        });
      }
      setCategories(newCategories);
    }, [receipt]);

    if (!receipt) {
      console.error("receipt undeclared")
      return;
    }

    // create table rows for each category
    return (
      <>
        {categories.map((c) => (
          <React.Fragment key={c}>
            <tr className={styles.categoryRow}>
              <th colSpan={3}>{c}</th>
            </tr>
            {receipt.items.filter((p) => p.category === c && p.purchaseId >= -1).map((p, i) => {
              return <PurchaseRow key={i} purchase={p} />
            }
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  // computes subtotal
  const getSubtotal = (): number => {
    if (!receipt) {
      console.log("receipt undefined");
      return 0;
    }

    let sum = 0;
    receipt.items.forEach((p) => {
      sum += p.price * p.quantity;
    });
    return Number(sum.toFixed(2));
  }

  if (!receipt) {
    console.log("receipt undefined");
    return;
  }

  // top level of edit receipt popup
  return (
    <>
      {displayed && receiptId >= 0 && (
        <div className="edit-receipt-form">
          <button type="button" className="close-popup" onClick={() => setDisplayed(false)}>X</button>
          <h3>{receipt.chainName} - {formatDate(receipt.date)}</h3>
          <div className="add-item">
            <label htmlFor="add-item-name">Item</label>
            <input type="text" id="add-item-name" placeholder="Item name" />

            <label htmlFor="add-price">Price</label>
            <span className={styles.dollars}>
              <input type="number" id="add-price" placeholder="Item price" />
            </span>

            <label htmlFor="add-category">Category</label>
            <input type="text" id="add-category" placeholder="Category name" />

            <label htmlFor="add-quantity">Quantity</label>
            <input type="number" id="add-quantity" placeholder="Number of items" />

            <button type="button" id="add-item-button" onClick={(() => addPurchase())}>Add Item</button>
          </div>
        
          <table className={styles.editReceiptTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              <ListPurchases />
            </tbody>
          </table>

          <label id="subtotal">Subtotal: ${getSubtotal().toFixed(2)}</label>

          <button type="button" className="create-receipt" onClick={() => { submitEditReceipt() }}>Submit Edited Receipt</button>
        </div>
      )}
    </>
  );
}



const responseFormat = {
  "name": "receipt_data",
  "type": "json_schema",
  "schema": {
    "type": "object",
    "properties": {
      "date": {
        "type": "string",
        "description": "The date on the receipt in ISO 8601 format (YYYY-MM-DD)."
      },
      "subtotal": {
        "type": "number"
      },
      "tax": {
        "type": "number"
      },
      "total": {
        "type": "number"
      },
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Human readable item name, including brand of item (if applicable) and unabbreviated item name in singular form (e.g., Tostitos Mild Salsa)."
            },
            "rawText": {
              "type": "string",
              "description": "Raw text item label"
            },
            "category": {
              "type": "string",
              "description": "Human readable item category in Title Case (e.g., Meat, Dairy, Produce)."
            },
            "order": {
              "type": "number",
              "description": "The position of the item on the receipt"
            },
            "unitPrice": {
              "type": "number",
              "description": "The price per unit of the item"
            },
            "quantity": {
              "type": "number"
            },
            "weight": {
              "type": "number"
            },
            "weightUnit": {
              "type": "string"
            },
            "totalPrice": {
              "type": "number",
              "description": "The total price of this item"
            },
            "discount": {
              "type": "number"
            }
          },
          "required": [
            "name",
            "rawText",
            "category",
            "order",
            "unitPrice",
            "quantity",
            "weight",
            "weightUnit",
            "totalPrice",
            "discount"
          ],
          "additionalProperties": false
        }
      }
    },
    "required": [
      "date",
      "subtotal",
      "tax",
      "total",
      "items"
    ],
    "additionalProperties": false
  },
  "strict": true
}

interface ReceiptData {
  date: string
  subtotal: number
  tax: number
  total: number
  items: ReceiptItem[]
}

interface ReceiptItem {
  name: string
  rawText: string
  category: string
  order: number
  unitPrice: number
  quantity: number
  weight: number
  weightUnit: string
  totalPrice: number
  discount: number
}


const systemPrompt = 'Extract the receipt metadata and items following the JSON format exactly. Do not use abbreviated item names. When it is clear what the abbreviation stands for, expand it in the item name. For example, "SIG Ckn Brst Tendr" expands to "Signature Chicken Breast Tender".'





export function AnalyzeWithAIForm({
  receiptId,
  receipt,
  setReceipt,
}: {
  receiptId: number,
  receipt: Receipt,
  setReceipt: (r: Receipt) => void,
}) {
  const [apiKey, setApiKey] = React.useState("")
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null)
  const [analyzeButtonText, setAnalyzeButtonText] = React.useState("Analyze Receipt")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Verify form fields are filled out
    if (apiKey === "" || receiptFile === null) {
      return
    }

    // Read the receipt file and generate a URL for it
    const receiptFileUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(receiptFile);
    })

    setAnalyzeButtonText("Analyzing...")

    // Send request to OpenAI
    const client = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true })
    // @ts-ignore
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "input_image",
              image_url: receiptFileUrl,
            },
          ],
        },
      ],
      text: {
        format: responseFormat
      },
    })

    // Verify sucess
    if (response.status !== "completed") {
      console.log("OpenAI API call failed: ", response.error)
    }

    // Add every item to the receipt item table
    const output: ReceiptData = JSON.parse(response.output_text)
    console.log("Got model output.")
    console.log(output)

    console.log("Extracting receipt items...")
    const purchases: Purchase[] = output.items.map((item) => {
      return {
        purchaseId: -1,
        itemName: item.name,
        price: item.totalPrice,
        category: item.category,
        quantity: item.quantity,
      }
    })
    console.log("Constructing newReceipt")

    const newReceipt = {
      ...receipt,
      items: purchases
    }

    console.log("Setting receipt")
    setReceipt(newReceipt)

    setAnalyzeButtonText("Analyze Receipt")
  }

  return (
    <div className={styles.analyzeWithAIFormContainer}>
      <form
        className={styles.analyzeWithAIForm}
        onSubmit={handleSubmit}
      >
        <label htmlFor="api-key">OpenAI API Key:</label>
        <input
          type="text"
          name="api-key"
          placeholder="sk-"
          className={styles.analyzeWithAIFormInputField}
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          required={true}
        />
        <label htmlFor="receipt-image">Upload receipt: </label>
        <input
          type="file"
          name="receipt-image"
          accept="image/*"
          className={styles.analyzeWithAIFormInputField}
          onChange={e => setReceiptFile(e.target.files?.item(0) || null)}
          required={true}
        />
        <button
          type="submit"
          className={styles.analyzeWithAIFormSubmitButton}
        >
          {analyzeButtonText}
        </button>
        <a
          href="https://platform.openai.com/settings/organization/api-keys"
          target="_blank"
        >
          Get an API key
        </a>
      </form>
    </div>
  )
}


// ---------------------------AXIOS MOCK ADAPTOR----------------------------

// TODO remove mock when actual backend made
const mockInstance = new AxiosMockAdapter(backend, { delayResponse: 0 });

// just for frontend testing rn you can search for Stop and Shop or Shaws (or both with just "s")
// .onGet("/receipts").reply(config => {
//     const query = config.params?.query;
//     if (query === "error test") {
//         return [400, {
//             "error": "this not a real error, just a test"
//         }];
//     }

//     return [200, { 
//         "receiptList": [
//             {
//                 "receiptId": "1",
//                 "storeName": "Shaws",
//                 "date": "11/08/2025",
//                 "totalAmount": 68.95
//             },
//             {
//                 "receiptId": "2",
//                 "storeName": "Stop and Shop",
//                 "date": "11/01/2025",
//                 "totalAmount": 26.89
//             }
//         ]
//     }];
// })

// mockInstance.onGet("/chains").reply(config => {
//     const query = config.params?.query;

//     if (query === "error test") {
//         return [400, {
//             "error": "this not a real error, just a test"
//         }];
//     }

//     return [200, {
//         "chains": [
//             { "id": 1, "name": "Stop and Shop" },
//             { "id": 2, "name": "Shaws" } 
// 		]
//     }];
// });

// .onGet(/\/chains\/\d+\/stores/).reply(config => {
//     // Extract the chainId from the URL (from ChatGPT)
//     const match = config.url?.match(/\/chains\/(\d+)\/stores/);
//     const chainId = match ? Number(match[1]) : null;

//     const query = config.params?.query;

//     if (query === "error test") {
//         return [400, {
//             "error": "this not a real error, just a test"
//         }];
//     }

//     if (chainId == 1) {
//         return [200, {
//             "stores": [
// 				{ 
// 					"id": 1,
// 					"address": {
// 						"houseNumber": "949",
// 						"street": "Grafton St",
// 						"city": "Worcester",
// 						"state": "MA",
// 						"postCode": "01609",
// 						"country": "USA"
// 					}
// 				}
// 			]
//         }];
//     }

//     if (chainId == 2) {
//         return [200, {
//             "stores": [
// 				{ 
// 					"id": 2,
// 					"address": {
// 						"houseNumber": "14",
// 						"street": "W Boylston St",
// 						"city": "Worcester",
// 						"state": "MA",
// 						"postCode": "01609",
// 						"country": "USA"
// 					}
// 				}
// 			]
//         }]
//     }

//     return [200, {"stores": []}];
// })

// .onPost("/receipts").reply(config => {
//     const body = JSON.parse(config.data);

//     if (!(body.chainId && body.storeId && body.date)) {
//         return [400, {
//             "error": "invalid fields (test error)"
//         }];
//     }

//     return [200, {
//         "receipt": {
//             "id": 3,
//             "chainId": body.chainId,
//             "storeId": body.storeId,
//             "date": body.date,
//             "purchases": []
//         }
//     }];
// })

// I think this one is wrong
// .onPost(/\/receipts\/\d+\/items/).reply(config => {
//     const body = JSON.parse(config.data);
// 
//     // extract itemId from URL
//     const match = config.url?.match(/\/receipts\/(\d+)\/items/)
//     const receiptId = match ? Number(match[1]) : null;
// 
//     let incomplete = (!body.item || !body.item.name || !body.item.storeId || !body.item.price || !body.item.category || !body.item.quantity);
//     let invalid = (body.item.name.length < 1 || body.item.price <= 0 || body.item.category.length < 1 || body.item.quantity <= 0);
//     
//     if (incomplete || invalid) {
//         return [400, {
//             "error": "Invalid or incomplete field(s)"
//         }];
//     }
// 
//     return [
//         200, 
//         {
//             "id": receiptId,
//             "chainName": "Shaw's",
//             "date": "11/15/2025",
//             "purchases": [
//                 {
//                     "purchaseId": 1,
//                     "itemName": body.item.name,
//                     "price": body.item.price,
//                     "category": body.item.category,
//                     "quantity": body.item.quantity
//                 }
//             ]
//         }
//     ];
// 
// })


//   .onGet(/\/receipts\/\d+\/items/).reply(config => { // Get Receipt
//     // extract itemId from URL
//     console.log("onGet being called"); // TODO remove; test
//     const match = config.url?.match(/\/receipts\/(\d+)/)
//     const receiptId = match ? Number(match[1]) : null;

//     if (!receiptId || receiptId < 0) {
//       return [400, {
//         "error": "Invalid or incomplete field(s)"
//       }];
//     }

//     return [
//       200,
//       {
//         "id": 1,
//         "chainName": "Shaw's",
//         "date": "11/15/2025",
//         "items": [
//           {
//             "purchaseId": 1,
//             "itemName": "Banana",
//             "price": 0.59,
//             "category": "Fruit",
//             "quantity": 1
//           },
//           {
//             "purchaseId": 2,
//             "itemName": "Apple",
//             "price": 0.89,
//             "category": "Fruit",
//             "quantity": 3
//           },
//           {
//             "purchaseId": 3,
//             "itemName": "Soap",
//             "price": 3.99,
//             "category": "Cleaning",
//             "quantity": 2
//           },
//         ]
//       }
//     ];

//   })


//   .onPost(/\/receipts\/\d+\/items/).reply(config => { // Add Purchase to Receipt
//     // extract receiptId from URL
//     console.log("onPost being called"); // TODO remove; test
//     const receiptIdMatch = config.url?.match(/\/receipts\/(\d+)/)
//     const receiptId = receiptIdMatch ? Number(receiptIdMatch[1]) : null;

//     if (!receiptId || receiptId < 0) {
//       return [400, {
//         "error": "invalid receiptId"
//       }]
//     }
    
//     const body = JSON.parse(config.data);

//     const incomplete = (!body.itemName || !body.price || !body.category || !body.date);
//     const invalid = (body.itemName.length < 1 || Number(body.price) <= 0 || body.category.length < 1 || Number(body.quantity) <= 0);

//     if (incomplete || invalid) {
//       return [400, {
//         "error": "Invalid or incomplete field(s)"
//       }];
//     }

//     return [200, {
//       items: [
//         {
//           "purchaseId": 1,
//           "itemName": "Banana",
//           "price": 0.59,
//           "category": "Fruit",
//           "quantity": 1
//         },
//         {
//           "purchaseId": 2,
//           "itemName": "Apple",
//           "price": 0.89,
//           "category": "Fruit",
//           "quantity": 3
//         },
//         {
//           "purchaseId": 3,
//           "itemName": "Soap",
//           "price": 3.99,
//           "category": "Cleaning",
//           "quantity": 2
//         }
//       ]
//     }
//     ];
//   })


//   .onDelete(/\/receipts\/\d+\/items\/\d+/).reply(config => { // Remove Purchase from Receipt
//     // extract receiptId and purchaseId from URL
//     console.log("onDelete being called"); // TODO remove; test
//     const match = config.url?.match(/\/receipts\/(\d+)\/items\/(\d+)/)
//     const receiptId = match ? Number(match[1]) : null;
//     const purchaseId = match ? Number(match[2]) : null;

//     if (!receiptId || receiptId < 0) {
//       return [400, {
//         "error": "invalid receiptId"
//       }]
//     }
//     if (!purchaseId || purchaseId < 0) {
//       return [400, {
//         "error": "invalid purchaseId"
//       }]
//     }

//     return [200, [ // may need to be an object, e.g. { purchases: [...] }
//       {
//         "purchaseId": 1,
//         "itemName": "Apple",
//         "price": 0.89,
//         "category": "Fruit",
//         "quantity": 2
//       }
//     ]];
//   })

mockInstance

.onAny().passThrough();

// -------------------------------------------------------------------------
