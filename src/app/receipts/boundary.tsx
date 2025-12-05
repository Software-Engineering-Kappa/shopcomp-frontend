import React, { useState, useEffect } from "react";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { backend } from "../../axiosClient";
import { create } from "domain";

// reactive input bar for receipts
export function ReceiptSearch({createReceipt, editReceipt, receiptId}: {createReceipt: boolean; editReceipt: boolean; receiptId: React.RefObject<number>}) {

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
        receiptId.current = newReceiptId; // will be -1 if not a valid receipt
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

export function EditReceiptForm({displayed, setDisplayed, receiptId}: {displayed: boolean; setDisplayed: (displayed: boolean) => void; receiptId: React.RefObject<number>}) {

    interface Purchase {
        id: number;
        itemName: string;
        price: number;
        category: string;
    }

    interface Receipt {
        id: number;
        chainName: string;
        date: string;
        purchases: Purchase[];
    }

    const [receipt, setReceipt] = React.useState<Receipt>(); // TODO does initial value null work?

        function PurchaseRow({purchase}: {purchase: Purchase}) {

            // if the purchase is being edited
            const [edit, setEdit] = React.useState<boolean>(false);

            // opens up the purchase to being edited
            const editPurchase = () => {
                setEdit(true);
            }

            // submits new purchase values and closes it to further editing
            const submitPurchase = () => {
                // get new values
                const newItemName = document.getElementById("edit-item-name") as HTMLInputElement;
                const newPrice = document.getElementById("edit-price") as HTMLInputElement;
                // get original receipt and purchase
                let newReceipt = receipt;
                let purchaseIndex = newReceipt.purchases.indexOf(purchase);
                let newPurchase = newReceipt.purchases[purchaseIndex];
                // set new values of new purchase
                newPurchase.id = -1; // marked as edited
                newPurchase.itemName = newItemName.value;
                newPurchase.price = Number(newPrice.value); // TODO should probably check it its actually a number
                newReceipt.purchases[purchaseIndex] = newPurchase;
                // update receipt
                setReceipt(newReceipt);
                
                setEdit(false);
            }

            const deletePurchase = () => {
                // TODO deletePurchase; should be similar to submitPurchase
            }
            
            return (
                <tr>
                    <th>{purchase.itemName}</th>
                    <td>
                        <input type="text" id="edit-item-name" readOnly={!edit} value={purchase.itemName}/>
                        <input type="number" id="edit-price" readOnly={!edit} value={purchase.price}/>
                        <button id="delete-purchase" onClick={() => deletePurchase()}>-</button>
                        {!edit && <button id="edit-purchase" onClick={() => editPurchase()}>edit</button>}
                        {edit && <button id="submit-purchase" onClick={() => submitPurchase()}>edit</button>}
                    </td>
                </tr>
            );
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

    // call getReceipt when displayed changed
    React.useEffect(() => {
        if (displayed) getReceipt();
    }, [displayed]);

    // sets the receipt to that of the receiptId
    const getReceipt = async () => {
        try {
            console.log("receiptId.current: " + receiptId.current); // test, TODO remove
            console.log("url: " + `/receipts/${receiptId.current}`);


            // call API
            const response = await backend.get<Receipt>(`/receipts/${receiptId.current}`);

            // set receipt to API response if valid
            setReceipt(response.data);

        } catch (error) { // axios automatically throws error on 400s
            console.error(error);
        }
    };

    const submitEditReceipt = async () => { // TODO implement correctly
        const date = document.getElementById("date") as HTMLInputElement;

        try {
            const name = document.getElementById("name") as HTMLInputElement;
            const price = document.getElementById("price") as HTMLInputElement;
            const category = document.getElementById("category") as HTMLInputElement;

            // check that all fields are filled out
        if (name.value.length < 1 || Number(price.value) <= 0 || category.value.length < 1) throw new Error("Not all fields filled out.");

        // call API
        const response = await backend.post("/receipts", { // TODO do /receipts/{storeId}/items here (also continue changing c/p from here)
            item: {
                name: name.value,
                storeId: storeId, // need to get storeId somehow
                price: price.value,
                category: category.value
            }
        });

        // close popup if successful
        setDisplayed(false);
    } catch(error) {
        console.error(error);
    }

    const listPurchases = () => {
        // - adding to the table dynamically with purchases, and organizing by category
        //     - should be done in a separate function
        //     - go through receipt.purchases and make a list (alphabetical?) of the categories
        //         - .forEach((p) => if (!categories.contains(p.category)) categories.add(p.category))
        //     - then for each category just .map((p) => if (p.category == currCategory)) 
        //         - maybe something like that

        // create list of categories
        let categories: string[] = [];
        receipt.purchases.forEach((p) => {
            if (!categories.includes(p.category))
                categories.push(p.category);
        });

        // create table rows for each category
        return (
            <>
                {categories.map((c) => (
                    <>
                        <tr>
                            <th>{c}</th>
                        </tr>
                        {receipt.purchases.map((p) => (
                            p.category === c && <PurchaseRow key={p.id} purchase={p}/>
                        ))}
                    </>
                ))}
            </>
        );
    };

    return (
        <>
            {displayed && (
                <div className="edit-receipt-form">
                    <button className="close-popup" onClick={() => setDisplayed(false)}>X</button>
                    <h3>{receipt.chainName} - {formatDate(receipt.date)}</h3>
                    <div className="add-item">
                        <label htmlFor="name">Item</label>
                        <input type="text" id="name" placeholder="Item name"/>

                        <label htmlFor="name">Quantity</label>
                        <input type="text" id="quantity" placeholder="Number of items"/>

                        <label htmlFor="name">Price</label>
                        <input type="text" id="price" placeholder="Item price"/>

                        <label htmlFor="name">Category</label>
                        <input type="text" id="category" placeholder="Category name"/>

                        <button id="add-item-button">Add Item</button>
                    </div>

                    <table className="items">
                        <tr>
                            <th>Name</th>
                            <th>Quantity</th>
                        </tr>
                        {listPurchases()}
                    </table>
                        

                    {/* old stuff */}

                    <StoreChainInput setChainId={setChainId}/>
                    <LocationInput chainId={chainId} setStoreId={setStoreId}/>
                    <label htmlFor="date">Date:</label>
                    <input type="date" id="date" placeholder="YYYY-MM-DD HH:MM:SS"/>

                    {/* <button className="create-receipt" onClick={() => submitCreateReceipt()}>Create Receipt</button> TODO uncomment and implement! */}
                    </div>
                )}
            </>
        );
    }

};




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

mockInstance.onPost(/\/receipts\/\d+\/items/).reply(config => {
    const body = JSON.parse(config.data);

    // extract itemId from URL
    const match = config.url?.match(/\/receipts\/(\d+)\/items/)
    const receiptId = match ? Number(match[1]) : null;

    let incomplete = (!body.item || !body.item.name || !body.item.storeId || body.item.price || body.item.category);
    let invalid = (body.item.name.length < 1 || body.item.price <= 0 || body.item.category.length < 1);
    
    if (incomplete || invalid) {
        return [400, {
            "error": "Invalid or incomplete field(s)"
        }];
    }

    return [
        200, 
        {
            "id": receiptId,
            "chainName": "Shaw's",
            "date": "11/15/2025",
            "purchases": [
                {
                    "purchaseId": 1,
                    "itemName": body.item.name,
                    "price": body.item.price,
                    "category": body.item.category
                }
            ]
        }
    ];

})

.onGet(/\/receipts\/\d+/).reply(config => {
    // extract itemId from URL
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
                    "itemName": "Soap",
                    "price": 3.99,
                    "category": "Cleaning"
                }
            ]
        }
    ];

})

.onAny().passThrough();

// -------------------------------------------------------------------------
