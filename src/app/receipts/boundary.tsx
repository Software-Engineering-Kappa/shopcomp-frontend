import React, { useState, useEffect } from "react";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

interface Receipt {
    receiptId: number;
    storeName: string;
    date: string;
    totalAmount: number
}

interface SearchResult {
    receiptList: Receipt[];
}

const awsInstance = axios.create({
    baseURL: "https://..." // TODO replace with the base url of the APIs
});


export function SearchBar() {
    
    // search query in the search bar
    const [query, setQuery] = React.useState<string>("");
    // search results under the search bar
    const [results, setResults] = React.useState<Receipt[]>([]);
    
    // sets query and calls search on change of input in search bar
    const handleChange = async (query: string) => {
        setQuery(query);
        search(query);
    };
    
    // calls the API to search receipts
    const search = async (query: string) => {
        try {
            // call API
            const queryParams = {query: query}
            const response = await awsInstance.get<SearchResult>("/receipts", { params: queryParams });

            // set results with API response
            setResults(response.data.receiptList);

        } catch (error) { // axios automatically throws error on 400s
            console.error(error);
        }
    };

    return (
        <div className="search-list">
            <input  type="text" 
                    placeholder="Search for receipts" 
                    value={query} onChange={(e) => handleChange(e.target.value)} 
                    autoFocus
            />
            <img src="/search-button-svgrepo-com.svg" alt="search icon"/>
            <ul className="receipts">
                {results.map((receipt) => (
                    <li key={receipt.receiptId}>
                        <button id={"button-" + receipt.receiptId}>
                            {receipt.storeName + " - " + receipt.date + " - $" + receipt.totalAmount}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
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

    if (/^sh.*/.test(query.toLowerCase())) {
        return [200, {
            "receiptList": [
				{
					"receiptId": "1",
					"storeName": "Shaws",
					"date": "11/08/2025",
					"totalAmount": 68.95
				}
			]
        }];
    }
    if (/^st.*/.test(query.toLowerCase())) {
        return [200, {
            "receiptList": [
				{
					"receiptId": "2",
					"storeName": "Stop and Shop",
					"date": "11/01/2025",
					"totalAmount": 26.89
				}
			]
        }];
    }
    if (/^s.*/.test(query.toLowerCase())) {
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
    }

    return [200, { "receiptList": []}];
});

// -------------------------------------------------------------------------
