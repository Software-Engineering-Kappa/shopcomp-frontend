import React, { useState, useEffect } from "react";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const awsInstance = axios.create({
    baseURL: "https://..." // TODO replace with the base url of the APIs
});

// reactive input bar for receipts
export function ReceiptSearch() {

    interface Receipt {
        receiptId: number;
        storeName: string;
        date: string;
        totalAmount: number
    }

    interface ReceiptSearchResult {
        receiptList: Receipt[];
    }

    const receiptToString = (receipt: Receipt): string => {
        return receipt.storeName + " - " + receipt.date + " - $" + receipt.totalAmount;
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

    // filter results on query change
    React.useEffect(() => {
        setResults(allReceipts.current.filter((r) => receiptToString(r).toLowerCase().includes(query.trim().toLowerCase())));
    }, [query]);
    
    // calls the API to search receipts
    const search = async () => {
        try {
            // call API
            const response = await awsInstance.get<ReceiptSearchResult>("/receipts");

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
            <img src="DELETEME/search-button-svgrepo-com.svg" alt="search icon"/>
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
function StoreChainInput({setChainId }: {setChainId: (id: number) => void}) {

    interface StoreChain {
        id: number;
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
        if (validChains.length === 1) return validChains[0].id;
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
        if (newChainId >= 0) setChainId(newChainId);
        else setChainId(-1); // invalid chainId because not fully filled out
    }, [query]);

    // calls the API to search store chains
    const search = async () => {
        try {
            // call API
            const response = await awsInstance.get<StoreChainSearchResult>("/chains");

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
                        <li key={storeChain.id}>
                            <button
                                id={"button-" + storeChain.id}
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
    
    // // sets query and calls search on change of input in search bar
    // const handleChange = (query: string) => {
    //     setQuery(query);
    //     if (chainId !== undefined) {
    //         search(query, chainId);
    //     }
    // };
    
    // calls the API to search store locations
    const search = async (chainId: number) => {
        try {
            // call API
            const response = await awsInstance.get<LocationSearchResult>(`/chains/${chainId}/stores`);

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
            const response = await awsInstance.post("/receipts", {
                chainId: chainId,
                storeId: storeId,
                date: date.value
            });

            console.log(response);

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
                    <input type="text" id="date" placeholder="MM/DD/YYYY"/>

                    <button className="create-receipt" onClick={() => submitCreateReceipt()}>Create Receipt</button>
                </div>
            )}
        </>
    );
}

// ---------------------------AXIOS MOCK ADAPTOR----------------------------

// TODO remove mock when actual backend made
const mockInstance = new AxiosMockAdapter(awsInstance, { delayResponse: 0 });

// just for frontend testing rn you can search for Stop and Shop or Shaws (or both with just "s")
mockInstance.onGet("/receipts").reply(config => {
    const query = config.params?.query;
    if (query === "error test") {
        return [400, {
            "error": "this not a real error, just a test"
        }];
    }

    return [200, { 
        "receiptList": [
            {
                "receiptId": "1",
                "storeName": "Shaws",
                "date": "11/08/2025",
                "totalAmount": 68.95
            },
            {
                "receiptId": "2",
                "storeName": "Stop and Shop",
                "date": "11/01/2025",
                "totalAmount": 26.89
            }
        ]
    }];
});

mockInstance.onGet("/chains").reply(config => {
    const query = config.params?.query;

    if (query === "error test") {
        return [400, {
            "error": "this not a real error, just a test"
        }];
    }

    return [200, {
        "chains": [
            { "id": 1, "name": "Stop and Shop" },
            { "id": 2, "name": "Shaws" } 
		]
    }];
});

mockInstance.onGet(/\/chains\/\d+\/stores/).reply(config => {
    // Extract the chainId from the URL (from ChatGPT)
    const match = config.url?.match(/\/chains\/(\d+)\/stores/);
    const chainId = match ? Number(match[1]) : null;

    const query = config.params?.query;

    if (query === "error test") {
        return [400, {
            "error": "this not a real error, just a test"
        }];
    }

    if (chainId == 1) {
        return [200, {
            "stores": [
				{ 
					"id": 1,
					"address": {
						"houseNumber": "949",
						"street": "Grafton St",
						"city": "Worcester",
						"state": "MA",
						"postCode": "01609",
						"country": "USA"
					}
				}
			]
        }];
    }

    if (chainId == 2) {
        return [200, {
            "stores": [
				{ 
					"id": 2,
					"address": {
						"houseNumber": "14",
						"street": "W Boylston St",
						"city": "Worcester",
						"state": "MA",
						"postCode": "01609",
						"country": "USA"
					}
				}
			]
        }]
    }

    return [200, {"stores": []}];
});

mockInstance.onPost("/receipts").reply(config => {
    const body = JSON.parse(config.data);

    if (!(body.chainId && body.storeId && body.date)) {
        return [400, {
            "error": "invalid fields (test error)"
        }];
    }
    
    return [200, {
        "receipt": {
            "id": 3,
            "chainId": body.chainId,
            "storeId": body.storeId,
            "date": body.date,
            "purchases": []
        }
    }];
})

// -------------------------------------------------------------------------
