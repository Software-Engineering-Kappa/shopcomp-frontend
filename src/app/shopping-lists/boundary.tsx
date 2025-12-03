import React, { useState, useEffect } from "react";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { backend } from "../../axiosClient";
import { create } from "domain";

// MOCK DATA FOR TESTING - Remove when backend is ready
const mockInstance = new AxiosMockAdapter(backend, { delayResponse: 500 });
mockInstance.onGet("/shopping_list").reply(200, {
    listOfShoppingLists: [
        { ID: 1, name: "Weekly Groceries", type: "Groceries", shopperID: 'c4f85428-a0f1-70aa-bd7b-f6169dfde1c5' },
        { ID: 2, name: "Birthday Party Supplies", type: "Party", shopperID: 'c4f85428-a0f1-70aa-bd7b-f6169dfde1c5' },
        { ID: 3, name: "Hardware Store Run", type: "Hardware", shopperID: 'c4f85428-a0f1-70aa-bd7b-f6169dfde1c5' },
        { ID: 4, name: "Holiday Shopping", type: "Gifts", shopperID: 'c4f85428-a0f1-70aa-bd7b-f6169dfde1c5' },
        { ID: 5, name: "Office Supplies", type: "Office", shopperID: 'c4f85428-a0f1-70aa-bd7b-f6169dfde1c5' }
    ]
});

// reactive input bar for shoppinglists
export function ShoppingListSearch({ createShoppingList }: { createShoppingList: boolean }) {

    interface ShoppingList {
        ID: number;
        name: string;
        type: string;
        shopperID: string;
    }

    interface listOfShoppingListSearchResult {
        listOfShoppingLists: ShoppingList[];
    }

    // current toString function
    const shoppingListToString = (shoppingList: ShoppingList): string => {
        return `${shoppingList.name} - ${shoppingList.type}`;
    }

    // the persistent list of receipts from the API call
    const allShoppingLists = React.useRef<ShoppingList[]>([]);

    // search query in the search bar
    const [query, setQuery] = React.useState<string>("");
    // search results under the search bar
    const [results, setResults] = React.useState<ShoppingList[]>([]);
    // if the input is focused and should display results
    const [focused, setFocused] = React.useState<boolean>(true);

    // calls search on the first render so the autofocus shows results
    React.useEffect(() => {
        search()
    }, []);

    // calls search when createReceipt changes e.g. receipt potentially added
    React.useEffect(() => {
        search()
    }, [createShoppingList]);

    // filter results on query change
    React.useEffect(() => {
        setResults(allShoppingLists.current.filter((r) => shoppingListToString(r).toLowerCase().includes(query.trim().toLowerCase())));
    }, [query]);

    // calls the API to search receipts
    const search = async () => {
        try {
            // call API
            const response = await backend.get<listOfShoppingListSearchResult>("/shopping_list");

            // set allShoppingLists and results with API response
            allShoppingLists.current = response.data.listOfShoppingLists;
            setResults(response.data.listOfShoppingLists);

        } catch (error) { // axios automatically throws error on 400s
            console.error(error);
        }
    };

    const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
        setQuery(e.currentTarget.textContent);
        setResults([]);
    }

    return (
        <div className="search-list">
            <input
                type="text"
                placeholder="Search for shopping list"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { setFocused(true); }}
                onBlur={() => setTimeout(() => setFocused(false), 100)} // delay to let query fill input (from ChatGPT)
                autoFocus
            />
            {/* <img src="search-button-svgrepo-com.svg" alt="search icon"/> */}
            {focused && (
                <ul className="shopping-list">
                    {results.map((shoppingList) => (
                        <li key={shoppingList.ID}>
                            <button
                                id={"button-" + shoppingList.ID}
                                onMouseDown={(e) => handlePress(e)}
                            >
                                {shoppingListToString(shoppingList)}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// reactive input bar for store chains, used by CreateReceiptForm
// function StoreChainInput({ setChainId }: { setChainId: (id: number) => void }) {

//     interface StoreChain {
//         ID: number;
//         name: string;
//     }

//     interface StoreChainSearchResult {
//         chains: StoreChain[];
//     }

//     const storeChainToString = (storeChain: StoreChain): string => {
//         return storeChain.name;
//     }
//     // returns -1 if can't find, actual id if can
//     const stringToChainId = (str: string): number => {
//         const validChains: StoreChain[] = allStoreChains.current.filter((s) => s.name.trim() === str);
//         if (validChains.length === 1) return validChains[0].ID;
//         else return -1;
//     }

//     // the persistent list of receipts from the API call
//     const allStoreChains = React.useRef<StoreChain[]>([]);

//     // search query for the input
//     const [query, setQuery] = React.useState<string>("");
//     // matches under the search bar
//     const [results, setResults] = React.useState<StoreChain[]>([]);
//     // if the input is focused and should display results
//     const [focused, setFocused] = React.useState<boolean>(true);

//     // calls search on the first render so the autofocus shows results
//     React.useEffect(() => {
//         search();
//     }, []);

//     // filter results on query change
//     React.useEffect(() => {
//         setResults(allStoreChains.current.filter((r) => storeChainToString(r).toLowerCase().includes(query.trim().toLowerCase())));
//         // check if fully filled out
//         const newChainId = stringToChainId(query);
//         setChainId(newChainId);
//     }, [query]);

//     // calls the API to search store chains
//     const search = async () => {
//         try {
//             // call API
//             const response = await backend.get<StoreChainSearchResult>("/chains");

//             // set allStoreChains and results with API response
//             allStoreChains.current = response.data.chains;
//             setResults(response.data.chains);

//         } catch (error) { // axios automatically throws error on 400s
//             console.error(error);
//         }
//     };

//     const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
//         const chainId: number = parseInt(e.currentTarget.id.slice("button-".length));
//         setChainId(chainId);
//         setQuery(e.currentTarget.textContent);
//         setResults([]);
//     };

//     return (
//         <div className="store-chain-input">
//             <label htmlFor="store-chain">Store chain:</label>
//             <input
//                 type="text"
//                 id="store-chain"
//                 placeholder="chain name"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 onFocus={() => setFocused(true)}
//                 onBlur={() => setTimeout(() => setFocused(false), 100)}
//                 autoFocus
//             />
//             {focused && (
//                 <ul className="store-chains">
//                     {results.map((storeChain) => (
//                         <li key={storeChain.ID}>
//                             <button
//                                 id={"button-" + storeChain.ID}
//                                 onMouseDown={(e) => handlePress(e)}
//                             >
//                                 {storeChainToString(storeChain)}
//                             </button>
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// }

// reactive input bar for store locations, used by CreateReceiptForm
// function LocationInput({ chainId, setStoreId }: { chainId?: number, setStoreId: (id: number) => void }) {

//     interface Address {
//         houseNumber: string;
//         street: string;
//         city: string;
//         state: string;
//         postCode: string;
//         country: string;
//     }

//     interface Store {
//         id: number;
//         address: Address;
//     }

//     interface LocationSearchResult {
//         stores: Store[];
//     }

//     const storeToString = (store: Store): string => {
//         return (
//             store.address.houseNumber + " "
//             + store.address.street + ", "
//             + store.address.city + ", "
//             + store.address.state + " "
//             + store.address.postCode
//         );
//     }
//     // returns -1 if can't find, actual id if can
//     const stringToStoreId = (str: string): number => {
//         const validStores: Store[] = allStores.current.filter((s) => storeToString(s) === str);
//         if (validStores.length === 1) return validStores[0].id;
//         else return -1;
//     }

//     // the persistent list of receipts from the API call
//     const allStores = React.useRef<Store[]>([]);

//     // search query in the search bar
//     const [query, setQuery] = React.useState<string>("");
//     // search results under the search bar
//     const [results, setResults] = React.useState<Store[]>([]);
//     // if the input is focused and should display results
//     const [focused, setFocused] = React.useState<boolean>(false);

//     // calls search on changes of chainId (if chainId is set)
//     React.useEffect(() => {
//         if (chainId && chainId >= 0) search(chainId);
//         else setResults([]);
//     }, [chainId]);

//     // filter results on query change
//     React.useEffect(() => {
//         setResults(allStores.current.filter((r) => storeToString(r).toLowerCase().includes(query.trim().toLowerCase())));
//         // check if fully filled out
//         const newStoreId = stringToStoreId(query);
//         if (newStoreId >= 0) setStoreId(newStoreId);
//         else setStoreId(-1); // invalid storeId because not fully filled out
//     }, [query]);

//     // calls the API to search store locations
//     const search = async (chainId: number) => {
//         try {
//             // call API
//             const response = await backend.get<LocationSearchResult>(`/chains/${chainId}/stores`);

//             // set allStores and results with API response
//             allStores.current = response.data.stores;
//             setResults(response.data.stores);

//         } catch (error) { // axios automatically throws error on 400s
//             console.error(error);
//         }
//     };

//     const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
//         const storeId: number = parseInt(e.currentTarget.id.slice("button-".length));
//         setStoreId(storeId);
//         setQuery(e.currentTarget.textContent);
//         setResults([]);
//     }

//     return (
//         <div className="location-input">
//             <label htmlFor="location">Location:</label>
//             <input
//                 type="text"
//                 id="location"
//                 placeholder="store address"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 onFocus={() => setFocused(true)}
//                 onBlur={() => setTimeout(() => setFocused(false), 100)}
//             />
//             {focused && (
//                 <ul className="location">
//                     {results.map((store) => (
//                         <li key={store.id}>
//                             <button
//                                 id={"button-" + store.id}
//                                 onMouseDown={(e) => handlePress(e)}
//                             >
//                                 {storeToString(store)}
//                             </button>
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// }

// popup for creating new receipts
// export function CreateReceiptForm({ displayed, setDisplayed }: { displayed: boolean; setDisplayed: (displayed: boolean) => void }) {

//     const [chainId, setChainId] = React.useState<number>();
//     const [storeId, setStoreId] = React.useState<number>();

//     const submitCreateReceipt = async () => {
//         const date = document.getElementById("date") as HTMLInputElement;

//         try {
//             // check that all fields are filled out
//             if (chainId === -1 || storeId === -1 || date.value.length === 0) throw new Error("Not all fields filled out.");

//             // call API
//             const response = await backend.post("/receipts", {
//                 chainId: chainId,
//                 storeId: storeId,
//                 date: date.value
//             });

//             // close popup if successful
//             setDisplayed(false);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     return (
//         <>
//             {displayed && (
//                 <div className="create-receipt-form">
//                     <button className="close-popup" onClick={() => setDisplayed(false)}>X</button>

//                     <StoreChainInput setChainId={setChainId} />
//                     <LocationInput chainId={chainId} setStoreId={setStoreId} />
//                     <label htmlFor="date">Date:</label>
//                     <input type="date" id="date" placeholder="YYYY-MM-DD HH:MM:SS" />

//                     <button className="create-receipt" onClick={() => submitCreateReceipt()}>Create Receipt</button>
//                 </div>
//             )}
//         </>
//     );
// }
