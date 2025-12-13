import React, { useState, useEffect } from "react";
import { backend } from "../../axiosClient";
import { SearchableList, SearchItem } from "../searchableList"
import styles from './page.module.css';
import { Height, PriceChange } from "@mui/icons-material";

export interface ShoppingList extends SearchItem {
    id: number;
    name: string;
    type: string;
}

export interface Category extends SearchItem {
    type: string;
}

export interface listOfShoppingListSearchResult {
    listOfShoppingLists: ShoppingList[];
}

interface ShoppingListItem {
    shoppingListID: number;
    name: string;
    category: string;
    quantity: number;
    itemID: number;
    isDeleted?: number;
}

export function ShoppingListSearch({
    createShoppingList,
    onSelectShoppingList,
    onLockChangeShoppingList
}: {
    createShoppingList: boolean;
    onSelectShoppingList?: (shoppingList: ShoppingList) => void; // optional callback when a shopping list is selected
    onLockChangeShoppingList: (locked: boolean) => void;
}) {

    const [shoppingLists, setShoppingLists] = React.useState<ShoppingList[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    // fetch shopping lists from API on component mount
    React.useEffect(() => {
        const fetchShoppingLists = async () => {
            try {
                setLoading(true);
                setError(null);

                // Call the API endpoint
                const response = await backend.get<{ listOfShoppingLists: ShoppingList[] }>("/shopping_lists");

                // Map the API response to include the `content` field for SearchableList
                const fetchedShoppingLists = response.data.listOfShoppingLists.map((list) => ({
                    ...list,
                    content: `${list.name} - ${list.type}`, // Combine name and type for searching
                }));
                setShoppingLists(fetchedShoppingLists); // Update state with fetched shopping lists
            } catch (err) {
                console.error("Failed to fetch shopping lists:", err);
                setError("Failed to load shopping lists. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchShoppingLists();
    }, [createShoppingList]);

    const style = {
        display: "flex",
        justifyContent: "center",
        height: "400px",    // <-- The width &  height of SearchableList will be limited to the height 
        width: "600px",    // of the parent component. The search results become scrollable if needed.
    }

    if (loading) return <p>Loading shopping lists...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={style}>
            <SearchableList
                placeholderText="Enter shopping list name"
                items={shoppingLists || []}
                onSelect={(selection) => {
                    if (onSelectShoppingList) {
                        onSelectShoppingList(selection);
                    }
                }}
                onLockChange={(onLockChangeShoppingList)}
            />
        </div>
    )
};

// popup for creating new shopping list
export function CreateShoppingListForm({
    setDisplayed, onCreateShoppingList
}: {
    setDisplayed: (displayed: boolean) => void
    onCreateShoppingList?: (shoppingList: ShoppingList) => void; // optional callback when a shopping list is created
}) {

    const [name, setName] = React.useState<string>("");
    const [category, setCategory] = React.useState<string>("");

    const submitShoppingList = async () => {
        try {
            // check that all fields are filled out
            if (!name || !category) throw new Error("Not all fields filled out.");
            if (!name === null || !category === null) throw new Error("Fields cannot be null.");
            console.log("Submitting new shopping list:", { name, category });



            // call API
            const response = await backend.post("/shopping_lists", {
                name: name,
                type: category
            });

            console.log("Shopping list created:", response.data);
            const newShoppingList: ShoppingList = {
                id: response.data.shoppinglist.shoppingListID, // Map shoppingListID to ID
                name: response.data.shoppinglist.name,
                type: response.data.shoppinglist.type,
                content: `${response.data.shoppinglist.name} - ${response.data.shoppinglist.type}`, // Combine name and type for content
            };

            if (onCreateShoppingList) {
                onCreateShoppingList(newShoppingList);
            }

            // close popup and clear if successful
            setDisplayed(false);
            setName("");
            setCategory("");

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <div className={styles.createShoppingListForm}>
                <div className={styles.formRow}>
                    <label htmlFor="name" className={styles.createShoppingListFont}>Name:</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={styles.inputField}
                    />
                </div>
                <CategoryInput setCategory={setCategory} />
                <div>
                    <button className="create-receipt" onClick={() => submitShoppingList()}>Submit</button>
                    <button className="close-popup" onClick={() => setDisplayed(false)}>X</button>

                </div>
            </div>
        </>
    );
}

function CategoryInput({ setCategory }: { setCategory: (category: string) => void }) {

    const allCategories = React.useRef<string[]>([]);
    const [query, setQuery] = React.useState<string>("");
    const [results, setResults] = React.useState<string[]>([]);
    const [focused, setFocused] = React.useState<boolean>(false);

    const DEFAULT_CATEGORIES = [
        "Groceries",
        "Household",
        "Personal Care",
        "Electronics",
        "Clothing",
        "Pet Supplies",
        "Office Supplies",
        "Party Supplies",
        "Hardware",
        "Gifts"
    ];

    React.useEffect(() => {
        fetchCategories()
    }, []);


    // filter results on query change
    React.useEffect(() => {
        if (query.trim()) {
            setResults(
                allCategories.current.filter(cat =>
                    cat.toLowerCase().includes(query.trim().toLowerCase())
                )
            );
        } else {
            setResults(allCategories.current);
        }
    }, [query]);

    const fetchCategories = async () => {
        try {
            // Call API
            const response = await backend.get<listOfShoppingListSearchResult>("/shopping_lists");

            // Extracts unique categories from shopping lists
            const extractedCategories = [...new Set(
                response.data.listOfShoppingLists.map((list: { type: string }) => list.type)
            )];

            // Combines default and shopping list categories
            const mergedCategories = [...new Set([
                ...DEFAULT_CATEGORIES,
                ...extractedCategories
            ])].sort();

            allCategories.current = mergedCategories
            setResults(allCategories.current);
        }
        catch (error) {
            console.error("Error loading categories:", error);
            allCategories.current = DEFAULT_CATEGORIES;
            setResults(DEFAULT_CATEGORIES);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setCategory(value);
    }

    const handleSelect = (category: string) => {
        setQuery(category);
        setCategory(category);
        setFocused(false);
    }

    return (
        <div className={styles.categoryDropdown}>
            <div className={styles.formRow}>
                <label htmlFor="category" className={styles.createShoppingListFont}>Category:</label>
                <input
                    id="category"
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)} // Show the dropdown when focused
                    onBlur={() => setTimeout(() => setFocused(false), 100)} // Hide the dropdown after a delay
                    placeholder="Type or select category"
                />
                {focused && results.length > 0 && (
                    <ul className={styles.dropdownList}>
                        {results.map((cat) => (
                            <li key={cat} onMouseDown={() => handleSelect(cat)}>
                                {cat}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export function EditShoppingList({
    shoppingList, setDisplayed
}: {
    shoppingList: ShoppingList;
    setDisplayed: (displayed: boolean) => void
}) {

    const [shoppingListItems, setShoppingListItems] = React.useState<ShoppingListItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [itemName, setItemName] = React.useState<string>("");
    const [itemCategory, setItemCategory] = React.useState<string>("");
    const [itemQuantity, setItemQuantity] = React.useState<number>(0);


    const id = shoppingList.id;
    const name = shoppingList.name;
    const category = shoppingList.type;

    // fetch shopping list items on component mount
    React.useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const items = await getShoppingListItems(Number(id));
                if (items) {
                    // filter out deleted items
                    const filteredItems = items.filter((item) => item.isDeleted !== 1);
                    setShoppingListItems(items);
                }
            } catch (error) {
                console.error("Failed to fetch shopping list items:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [id]);

    // handles adding a new item to the shopping list
    const handleAddItem = async () => {
        try {
            // check if fields are filled out
            if (!itemName || !itemCategory || itemQuantity <= 0) {
                throw new Error("Please fill out all item fields correctly.");
            }

            // call API to add item
            const newItem = await addShoppingListItem(Number(id), itemName, itemCategory, itemQuantity);

            if (newItem) {
                setShoppingListItems((prevItems) => [...prevItems, newItem.item]);
                // clear input fields
                setItemName("");
                setItemCategory("");
                setItemQuantity(0);
            }
        } catch (error) {
            console.error("Failed to add item:", error);
        }
    }

    const handleDeleteItem = async (itemID: number) => {
        try {
            // call API to delete item
            const deletedItem = await deleteShoppingListItem(Number(id), itemID);

            if (deletedItem) {
                setShoppingListItems((prevItems) =>
                    prevItems.filter((item) => item.itemID !== itemID)
                );
            }
        } catch (error) {
            console.error("Failed to delete item:", error);
        }
    }


    if (loading) return <p>Loading shopping list items...</p>;

    return (
        <div>
            <h2>Edit: {name} - {category}</h2>
            <div>
                <label htmlFor="itemName" className={styles.inputText}>Item Name: </label>
                <input
                    id="itemName"
                    type="text"
                    placeholder="item name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                />
                <label htmlFor="itemCategory" className={styles.inputText}> Item Category: </label>
                <input
                    id="itemCategory"
                    type="text"
                    placeholder="item category"
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                />
                <label htmlFor="itemQuantity" className={styles.inputText}> Item Quantity: </label>
                <input
                    id="itemQuantity"
                    type="number"
                    placeholder="Item Quantity"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                />
                <button className="addItem" onClick={handleAddItem}>Add Item</button>
            </div>
            <br />
            <div className={styles.tableWrapper}>
                <table className={styles.shoppingListTable}>
                    <colgroup>
                        <col style={{ width: "40%" }} />
                        <col style={{ width: "35%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "10%" }} />
                    </colgroup>

                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th className={styles.qtyCol}>Quantity</th>
                            <th className={styles.actionsCol}></th>
                        </tr>
                    </thead>

                    <tbody>
                        {shoppingListItems
                            .filter((item) => item?.name)
                            .map((item) => (
                                <tr key={item.itemID}>
                                    <td className={styles.ellipsis} title={item.name}>{item.name}</td>
                                    <td className={styles.ellipsis} title={item.category}>{item.category}</td>
                                    <td className={styles.qtyCol}>{item.quantity}</td>
                                    <td className={styles.actionsCol}>
                                        <button
                                            className={styles.deleteItem}
                                            onClick={() => handleDeleteItem(item.itemID)}
                                            aria-label={`Delete ${item.name}`}
                                            type="button"
                                        >
                                            X
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            <button className="close-popup" onClick={() => setDisplayed(false)}>X</button>
        </div>
    )
}

// Calls API Endpoint to get shopping list items
async function getShoppingListItems(shoppingListID: number) {
    try {
        const response = await backend.get<{ items: ShoppingListItem[] }>(`/shopping_lists/${shoppingListID}/items`);
        return response.data.items;
    }
    catch (error) {
        console.error(error);
    }
}

async function addShoppingListItem(shoppingListID: number, itemName: string, itemCategory: string, quantity: number) {
    try {
        const response = await backend.post<{ item: ShoppingListItem }>(`/shopping_lists/${shoppingListID}/items`, {
            name: itemName,
            category: itemCategory,
            quantity: quantity
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

async function deleteShoppingListItem(shoppingListID: number, itemID: number) {
    try {
        console.log("Deleting item:", { shoppingListID, itemID });
        const response = await backend.delete(`/shopping_lists/${shoppingListID}/items/${itemID}`)
        // console.log("delete response:", response.data);
        return response.data
    } catch (error) {
        console.error(error)
    }
}

export function ReportOptionsForm({ listId, listName, setVisibility }: { listId: number; listName: string; setVisibility: (visibility: boolean) => void }) {

    interface Store extends SearchItem {
        chainName: string
        estimatedPrice: string
        priceBreakdown: string

        id: number
        address: {
            houseNumber: string
            street: string
            city: string
            state: string
            postCode: string
            country: string
        }
    }

    interface ReportOptionsResponse {
        stores: Store[];
    }

    // list of all chains from API
    const [allStores, setAllStores] = React.useState<Store[]>([]);
    // list of chains displayed by SearchableList (filtered to exclude selected chains)
    const [stores, setStores] = React.useState<Store[]>([]);
    // chains selected for reporting options of
    const [selectedStores, setSelectedStores] = React.useState<Store[]>([]);
    // loading state for stores
    const [loadingStores, setLoadingStores] = React.useState<boolean>(true);
    // reported options for each chain
    const [options, setOptions] = React.useState<Store[]>([]);

    // get store chains to pass to SearchableList
    React.useEffect(() => {
        const fetchChains = async () => {
            setLoadingStores(true);
            try {
                const listChainsResponse = await backend.get("/chains");
                const chains = listChainsResponse.data.chains;
                
                console.log(`Fetching stores for ${chains.length} chains...`);
                const allFetchedStores: Store[] = [];
                
                // Fetch stores in batches of 5 to balance speed and reliability
                const batchSize = 5;
                for (let i = 0; i < chains.length; i += batchSize) {
                    const batch = chains.slice(i, i + batchSize);
                    
                    // Fetch this batch in parallel
                    const batchResults = await Promise.allSettled(
                        batch.map((chain: any) => fetchStores(chain.ID, chain.name))
                    );
                    
                    // Collect successful results
                    batchResults.forEach((result, index) => {
                        if (result.status === 'fulfilled') {
                            allFetchedStores.push(...result.value);
                        } else {
                            console.error(`Failed to fetch stores for chain ${batch[index].name}:`, result.reason);
                        }
                    });
                    
                    // Small delay between batches
                    if (i + batchSize < chains.length) {
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
                
                console.log(`Successfully fetched ${allFetchedStores.length} total stores`);
                setAllStores(allFetchedStores);
                setStores(allFetchedStores);
            } catch (error) {
                console.error("Error fetching chains:", error);
            } finally {
                setLoadingStores(false);
            }
        };

        fetchChains();
    }, []); // Empty dependency array ensures this runs only once

    // Function to fetch stores from backend API endpoint
    const fetchStores = async (chainId: number, chainName: string): Promise<Store[]> => {
        try {
            const response = await backend.get(`/chains/${chainId}/stores`);
            const fetchedStores = response.data.stores.map((store: any) => {
                return {
                    ...store, // NOTE: id is lowercase in response
                    chainName: `${chainName}`,
                    content: `${chainName} - ${store.address.houseNumber} ${store.address.street}, ${store.address.city}, ${store.address.state} ${store.address.postCode}, ${store.address.country}`
                }
            }); 
            console.log("Stores fetched successfully for chain:", chainName, fetchedStores);
            return fetchedStores;
        } catch (error) {
            console.error("Error fetching stores:", error);
            return [];
        }
    };

    // handles selection of a store in SearchableList
    const handleSelect = (selection: Store) => {
 
        // Add store to selected stores
        const currSelectedStores = [...selectedStores, selection];
        setSelectedStores(currSelectedStores);
        
        // Filter out selected store from available stores
        setStores(allStores.filter(s => !currSelectedStores.some(sc => sc.id === s.id)));
    };

    // handles removal of a store in the list of selected stores
    const handleDelete = (selection: Store) => {
        const currSelectedStores = selectedStores.filter(c => c.id !== selection.id);
        setSelectedStores(currSelectedStores);
        // add store back to available stores
        setStores(allStores.filter(c => !currSelectedStores.some(sc => sc.id === c.id)));
    };

    // fills chainOptions with reported options
    const reportOptions = async () => {
        const response = await backend.post<ReportOptionsResponse>(`/shopping_lists/${listId}/report_options`,
            { storeIds: selectedStores.map((s) => s.id) });
        console.log("Report options response:", response.data);
        
        // Map the response stores to include chain names from selectedStores
        const mappedStores = response.data.stores.map((store: any) => {
            // Find the matching store in selectedStores to get the chain name
            console.log("Mapping store for report options:", store);
            const selectedStore = selectedStores.find(s => s.id === store.storeId);
            return {
                ...store,
                id: store.storeId,
                address: selectedStore?.address
            };
        });
        
        setOptions(mappedStores);
    };

    // Helper function to format store address as a single string
    const getStoreAddress = (store: Store) => {
        return `${store.address.houseNumber} ${store.address.street}, ${store.address.city}, ${store.address.state} ${store.address.postCode}, ${store.address.country}`;
    }

    const style = {
        display: "flex",
        justifyContent: "center",
        maxHeight: "200px",    // <-- The width &  height of SearchableList will be limited to the height 
        width: "1000px",    // of the parent component. The search results become scrollable if needed.
    }

    return (
        <div className="report-options-form">
            <button type="button" className="close-report-options-form" onClick={() => setVisibility(false)}>Select Different Shopping list</button>
            <h2>Shopping List: {listName}</h2>
            <label>Stores to Search</label>

            {loadingStores ? (
                <p>Loading stores...</p>
            ) : (
                <div style={style}>
                    <SearchableList placeholderText="Enter Store Name..." items={stores} onSelect={handleSelect} />
                </div>
            )}

            <ul className={styles.selectedStoresList}>
                {selectedStores.map((s) => (
                    <li key={s.id} className={styles.selectedStoreItem}>
                        <div className={styles.storeInfo}>
                            <div className={styles.storeName}>{s.chainName}</div>
                            <div className={styles.storeAddress}>{getStoreAddress(s)}</div>
                        </div>
                        <button type="button" className={styles.removeButton} onClick={() => handleDelete(s)}>Remove</button>
                    </li>
                ))}
            </ul>

            {selectedStores.length > 0 && (
                <button id="find-best-store-button" onClick={() => reportOptions()}>Find Best Store</button>
            )}

            {options.length > 0 && (
                <>
                    <h3>Best Stores for Shopping List: {listName}</h3>
                    <table className={styles.reportTable}>
                        <thead>
                            <tr>
                                <th>Store</th>
                                <th>Price (estimated)</th>
                                <th>Price Breakdown</th>
                                <th>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {options.map((o) => (
                                <tr key={o.id}>
                                    <td>{o.chainName}</td>
                                    <td className={styles.priceCell}>${o.estimatedPrice}</td>
                                    <td className={styles.breakdownCell}>
                                        {Array.isArray(o.priceBreakdown) 
                                            ? o.priceBreakdown.map((item: any, idx: number) => (
                                                <div key={idx} className={styles.breakdownItem}>
                                                    <span>{item.itemName}</span>: ${item.mostRecentPrice}
                                                </div>
                                            ))
                                            : o.priceBreakdown
                                        }
                                    </td>
                                    <td>
                                        {`${o.address.houseNumber} ${o.address.street}, ${o.address.city}, ${o.address.state} ${o.address.postCode}, ${o.address.country}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}