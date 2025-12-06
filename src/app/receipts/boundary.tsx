import React, { useState, useEffect } from "react";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { backend } from "../../axiosClient";
import { create } from "domain";

// reactive input bar for receipts
export function ReceiptSearch({createReceipt, setReceiptId}: {createReceipt: boolean; setReceiptId: (receiptId: number) => void}) {

    interface Receipt {
        receiptId: number;
        storeName: string;
        date: string;
        totalAmount: number
    }

    interface ReceiptSearchResult {
        receiptList: Receipt[];
    }

    // current toString function
    const receiptToString = (receipt: Receipt): string => {
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
        return `${receipt.storeName} - ${dateStr} - $${receipt.totalAmount.toFixed(2)}`;
    }

    const stringToReceiptId = (str: string): number => {
        const validReceipts: Receipt[] = allReceipts.current.filter((r) => receiptToString(r) === str);
        if (validReceipts.length === 1) return validReceipts[0].receiptId;
        else return -1;
    }

    // the persistent list of receipts from the API call
    const allReceipts = React.useRef<Receipt[]>([]);
    
    // search query in the search bar
    const [query, setQuery] = React.useState<string>("");
    // search results under the search bar
    const [results, setResults] = React.useState<Receipt[]>([]);
    // if the input is focused and should display results
    const [focused, setFocused] = React.useState<boolean>(true);

    // calls search on the first render so the autofocus shows results
    React.useEffect(() => {
        search()
    }, []);

    // calls search when createReceipt changes e.g. receipt potentially added
    React.useEffect(() => {
        search()
    }, [createReceipt]);

    // filter results on query change
    React.useEffect(() => {
        setResults(allReceipts.current.filter((r) => receiptToString(r).toLowerCase().includes(query.trim().toLowerCase())));
        const newReceiptId = stringToReceiptId(query);
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
                onFocus={() => {setFocused(true); }}
                onBlur={() => setTimeout(() => setFocused(false), 100)} // delay to let query fill input (from ChatGPT)
                autoFocus
            />
            {/* <img src="search-button-svgrepo-com.svg" alt="search icon"/> */}
            {focused && (
                <ul className="receipts">
                    {results.map((receipt) => (
                        <li key={receipt.receiptId}>
                            <button 
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
function StoreChainInput({setChainId}: {setChainId: (id: number) => void}) {

    interface StoreChain {
        ID: number;
        name: string;
    }

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
function LocationInput({chainId, setStoreId}: {chainId?: number, setStoreId: (id: number) => void}) {

    interface Address {
        houseNumber: string;
        street: string;
        city: string;
        state: string;
        postCode: string;
        country: string;
    }

    interface Store {
        id: number;
        address: Address;
    }

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
export function CreateReceiptForm({displayed, setDisplayed}: {displayed: boolean; setDisplayed: (displayed: boolean) => void}) {

    const [chainId, setChainId] = React.useState<number>();
    const [storeId, setStoreId] = React.useState<number>();

    const submitCreateReceipt = async () => {
        const date = document.getElementById("date") as HTMLInputElement;

        try {
            // check that all fields are filled out
            if (chainId === -1 || storeId === -1 || date.value.length === 0) throw new Error("Not all fields filled out.");

            // call API
            const response = await backend.post("/receipts", {
                chainId: chainId,
                storeId: storeId,
                date: date.value
            });

            // close popup if successful
            setDisplayed(false);
        } catch(error) {
            console.error(error);
        }
    };

    return (
        <>
            {displayed && (
                <div className="create-receipt-form">
                    <button className="close-popup" onClick={() => setDisplayed(false)}>X</button>

                    <StoreChainInput setChainId={setChainId}/>
                    <LocationInput chainId={chainId} setStoreId={setStoreId}/>
                    <label htmlFor="date">Date:</label>
                    <input type="date" id="date" placeholder="YYYY-MM-DD HH:MM:SS"/>

                    <button className="create-receipt" onClick={() => submitCreateReceipt()}>Create Receipt</button>
                </div>
            )}
        </>
    );
}

export function EditReceiptForm({displayed, setDisplayed, receiptId}: {displayed: boolean; setDisplayed: (displayed: boolean) => void; receiptId: number}) {

    interface Purchase {
        purchaseId: number;
        itemName: string;
        price: number;
        category: string;
        quantity: number;
    }

    interface Receipt {
        id: number;
        chainName: string;
        date: string;
        purchases: Purchase[];
    }

    // the receipt being edited
    const [receipt, setReceipt] = React.useState<Receipt>();
    // purchase IDs marked for deletion
    const purchasesToDelete = React.useRef<number[]>([]);

    // displays a table row of the given purchase
    function PurchaseRow({purchase}: {purchase: Purchase}) {

        // if the purchase is being edited
        const [edit, setEdit] = React.useState<boolean>(false);

        // opens up the purchase to being edited
        const editPurchase = () => {
            setEdit(true);
        }

        // editable fields of the row
        const [itemName, setItemName] = React.useState(purchase.itemName);
        const [price, setPrice] = React.useState(purchase.price);
        const [quantity, setQuantity] = React.useState(purchase.quantity)

        // submits new purchase values of edited purhcase and closes it to further editing
        const submitPurchase = () => {
            if (!receipt) {
                console.error("receipt undefined");
                return;
            }

            // get original receipt and purchase
            const newReceipt = structuredClone(receipt);
            const purchaseIndex = receipt.purchases.indexOf(purchase);
            const newPurchase = newReceipt.purchases[purchaseIndex];
            const ogPurchaseId = newPurchase.purchaseId;
            // set new values of new purchase
            newPurchase.purchaseId = -1; // marked as edited
            newPurchase.itemName = itemName;
            newPurchase.price = price;
            newPurchase.quantity = quantity;
            newReceipt.purchases[purchaseIndex] = newPurchase;
            // check that purchase is different
            const diffItemName = newPurchase.itemName !== purchase.itemName;
            const diffPrice = newPurchase.price !== purchase.price;
            const diffQuantity = newPurchase.quantity !== purchase.quantity;
            if (diffItemName || diffPrice || diffQuantity) {
                // remove old purchase
                purchasesToDelete.current.push(ogPurchaseId);
                // update receipt
                setReceipt(newReceipt);
            }
            
            setEdit(false);
        }

        // deletes the current purchase from the receipt
        const deletePurchase = () => {
            if (!receipt) {
                console.error("receipt undefined");
                return;
            }
            
            // get original receipt and purchase
            const newReceipt = structuredClone(receipt);
            const purchaseIndex = receipt.purchases.indexOf(purchase);
            const deletedPurchase = newReceipt.purchases[purchaseIndex];
            // mark new purchase for deletion
            if (deletedPurchase.purchaseId >= 0)
                purchasesToDelete.current.push(deletedPurchase.purchaseId);
            newReceipt.purchases.splice(purchaseIndex, 1);
            // update receipt
            setReceipt(newReceipt);

            setEdit(false);
        }
        
        // the full row of inputs for the given purchase
        return (
            <tr>
                <td>
                    <input type="text" id={`edit-item-name-${purchase.purchaseId}`} readOnly={!edit} value={itemName} onChange={(e) => setItemName(e.target.value)}/>
                </td>
                <td>
                    <input type="number" id={`edit-price-${purchase.purchaseId}`} readOnly={!edit} value={price} onChange={(e) => setPrice(Number(e.target.value))}/>
                </td>
                <td>
                    <input type="number" id={`edit-quantity-${purchase.quantity}`} readOnly={!edit} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}/>
                </td>
                <td>
                    {!edit && <button id="edit-purchase" onClick={() => editPurchase()}>edit</button>}
                    {edit && <button id="submit-purchase" onClick={() => submitPurchase()}>submit</button>}
                    <button id="delete-purchase" onClick={() => deletePurchase()}>delete</button>
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
        const validItemName = itemName.value && itemName.value.length > 0;
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

            // set new receipt
            newReceipt.purchases.push(newPurchase);
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
            receipt.purchases.filter((p) => p.purchaseId === -1).forEach(async (p) => {
                // call purchase addition API
                const response = await backend.post(`/receipts/${receiptId}/items`, {
                    itemName: p.itemName,
                    price: p.price,
                    category: p.category,
                    date: receipt.date
                });
            });

            // close popup if successful
            setDisplayed(false);
        } catch(error) {
            console.error(error);
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
                setReceipt(response.data);

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
                receipt.purchases.forEach((p) => {
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
                        <tr>
                            <th colSpan={3}>{c}</th>
                        </tr>
                            {receipt.purchases.filter((p) => p.category === c && p.purchaseId >= -1).map((p, i) => {
                                return <PurchaseRow key={i} purchase={p}/>
                            }
                        )}
                    </React.Fragment>
                ))}
            </>
        );
    };

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
                        <label htmlFor="name">Item</label>
                        <input type="text" id="add-item-name" placeholder="Item name"/>

                        <label htmlFor="name">Price</label>
                        <input type="text" id="add-price" placeholder="Item price"/>

                        <label htmlFor="name">Category</label>
                        <input type="text" id="add-category" placeholder="Category name"/>

                        <label htmlFor="name">Quantity</label>
                        <input type="text" id="add-quantity" placeholder="Number of items"/>

                        <button type="button" id="add-item-button" onClick={(() => addPurchase())}>Add Item</button>
                    </div>

                    <table className="items">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ListPurchases/>
                        </tbody>
                    </table>
                        
                    <button type="button" className="create-receipt" onClick={() => submitEditReceipt()}>Submit Edited Receipt</button>
                </div>
            )}
        </>
    );
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

mockInstance

.onGet(/\/receipts\/\d+/).reply(config => { // Get Receipt
    // extract itemId from URL
    console.log("onGet being called"); // TODO remove; test
    const match = config.url?.match(/\/receipts\/(\d+)/)
    const receiptId = match ? Number(match[1]) : null;

    if (!receiptId || receiptId < 0) {
        return [400, {
            "error": "Invalid or incomplete field(s)"
        }];
    }

    return [
        200, 
        {
            "id": 1,
            "chainName": "Shaw's",
            "date": "11/15/2025",
            "purchases": [
                {
                    "purchaseId": 1,
                    "itemName": "Banana",
                    "price": 0.59,
                    "category": "Fruit",
                    "quantity": 1
                },
                {
                    "purchaseId": 2,
                    "itemName": "Apple",
                    "price": 0.89,
                    "category": "Fruit",
                    "quantity": 3
                },
                {
                    "purchaseId": 3,
                    "itemName": "Soap",
                    "price": 3.99,
                    "category": "Cleaning",
                    "quantity": 2
                },
            ]
        }
    ];

})

.onPost(/\/receipts\/\d+\/items/).reply(config => { // Add Purchase to Receipt
    // extract receiptId from URL
    console.log("onPost being called"); // TODO remove; test
    const receiptIdMatch = config.url?.match(/\/receipts\/(\d+)/)
    const receiptId = receiptIdMatch ? Number(receiptIdMatch[1]) : null;

    if (!receiptId || receiptId < 0) {
        return [400, {
            "error": "invalid receiptId"
        }]
    }

    const body = JSON.parse(config.data);

    const incomplete = (!body.itemName || !body.price || !body.category || !body.date);
    const invalid = (body.itemName.length < 1 || Number(body.price) <= 0 || body.category.length < 1 || Number(body.quantity) <= 0);
    
    if (incomplete || invalid) {
        return [400, {
            "error": "Invalid or incomplete field(s)"
        }];
    }

    return [200, [
        {
            "purchaseId": 1,
            "itemName": "Banana",
            "price": 0.59,
            "category": "Fruit",
            "quantity": 1
        },
        {
            "purchaseId": 2,
            "itemName": "Apple",
            "price": 0.89,
            "category": "Fruit",
            "quantity": 3
        },
        {
            "purchaseId": 3,
            "itemName": "Soap",
            "price": 3.99,
            "category": "Cleaning",
            "quantity": 2
        }
    ]];
})

.onDelete(/\/receipts\/\d+\/items\/\d+/).reply(config => { // Remove Purchase from Receipt
    // extract receiptId and purchaseId from URL
    console.log("onDelete being called"); // TODO remove; test
    const match = config.url?.match(/\/receipts\/(\d+)\/items\/(\d+)/)
    const receiptId = match ? Number(match[1]) : null;
    const purchaseId = match ? Number(match[2]) : null;

    if (!receiptId || receiptId < 0) {
        return [400, {
            "error": "invalid receiptId"
        }]
    }
    if (!purchaseId || purchaseId < 0) {
        return [400, {
            "error": "invalid purchaseId"
        }]
    }

    return [200, [ // may need to be an object, e.g. { purchases: [...] }
        {
            "purchaseId": 1,
            "itemName": "Apple",
            "price": 0.89,
            "category": "Fruit",
            "quantity": 2
        }
    ]];
})

.onAny().passThrough();

// -------------------------------------------------------------------------
