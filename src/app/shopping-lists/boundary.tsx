import React, { useState, useEffect } from "react";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { backend } from "../../axiosClient";
import { SearchableList, SearchItem } from "../searchableList"
import { create } from "domain";

export interface ShoppingList extends SearchItem {
    name: string;
    type: string;
}

interface ShoppingListItem {
    shoppingListID: number;
    name: string;
    category: string;
    quantity: number;
    itemID: number;
    isDeleted?: number;
}

// MOCK DATA FOR TESTING - Remove when backend is ready
const mockInstance = new AxiosMockAdapter(backend, { delayResponse: 500, onNoMatch: "passthrough" });
// mockInstance.onGet("/shopping_lists").reply(200, {
//     listOfShoppingLists: [
//         { ID: 1, name: "Weekly Groceries", type: "Groceries"},
//         { ID: 2, name: "Birthday Party Supplies", type: "Party"},
//         { ID: 3, name: "Hardware Store Run", type: "Hardware"},
//         { ID: 4, name: "Holiday Shopping", type: "Gifts"},
//         { ID: 5, name: "Office Supplies", type: "Office"},
//         { ID: 6, name: "Test", type: "Test"}
//     ]
// });

// mockInstance.onPost("/shopping_lists").reply((config) => {
//     const { name, category } = JSON.parse(config.data);
//     const newShoppingList = {
//         ID: 7,
//         name: name,
//         type: category,
//     };
//     return [200, newShoppingList];
// });

const weeklyGroceriesItems: ShoppingListItem[] = [
    { shoppingListID: 1, name: "Milk", category: "Dairy", quantity: 2, itemID: 1 },
    { shoppingListID: 1, name: "Eggs", category: "Dairy", quantity: 12, itemID: 2 },
    { shoppingListID: 1, name: "Bread", category: "Bakery", quantity: 1, itemID: 3 },
    { shoppingListID: 1, name: "Apples", category: "Fruits", quantity: 6, itemID: 4 },
];

mockInstance.onGet(/\/shopping_lists\/\d+\/items/).reply((config) => {
    const urlParts = config.url?.split("/") || [];
    const shoppingListID = parseInt(urlParts[2], 10); // Extract shoppingListID from the URL

    // Mock data for different shopping lists
    const mockData: Record<number, ShoppingListItem[]> = {
        1: weeklyGroceriesItems,
        2: [
            { shoppingListID: 2, name: "Balloons", category: "Party", quantity: 10, itemID: 1 },
            { shoppingListID: 2, name: "Cake", category: "Bakery", quantity: 1, itemID: 2 },
        ],
        3: [
            { shoppingListID: 3, name: "Hammer", category: "Tools", quantity: 1, itemID: 1 },
            { shoppingListID: 3, name: "Nails", category: "Hardware", quantity: 50, itemID: 2 },
        ],
    };

    const items = mockData[shoppingListID] || []; // Return items for the shoppingListID or an empty array
    return [200, { items }];
});

mockInstance.onPost(/\/shopping_lists\/\d+\/items/).reply((config) => {
    const urlParts = config.url?.split("/") || [];
    const shoppingListID = parseInt(urlParts[2], 10); // Extract shoppingListID from the URL

    const newItem = JSON.parse(config.data);
    const createdItem: ShoppingListItem = {
        shoppingListID,
        name: newItem.name,
        category: newItem.category,
        quantity: newItem.quantity,
        itemID: Math.floor(Math.random() * 1000), // Generate a random itemID
    };

    // Add the new item to the appropriate mock data array
    const mockData: Record<number, ShoppingListItem[]> = {
        1: weeklyGroceriesItems,
        2: [],
        3: [],
    };

    if (!mockData[shoppingListID]) {
        mockData[shoppingListID] = [];
    }
    mockData[shoppingListID].push(createdItem);

    return [200, { item: createdItem }];
});

mockInstance.onPost(/\/shopping_lists\/\d+\/items\/\d+/).reply((config) => {
    const urlParts = config.url?.split("/") || [];
    const shoppingListID = parseInt(urlParts[2], 10); // Extract shoppingListID from the URL
    const itemID = parseInt(urlParts[4], 10); // Extract itemID from the URL

    // Find the item in the mock data
    const itemIndex = weeklyGroceriesItems.findIndex(
        (item) => item.shoppingListID === shoppingListID && item.itemID === itemID
    );

    if (itemIndex !== -1) {
        // Update the isDeleted field for the item
        weeklyGroceriesItems[itemIndex].isDeleted = 1;
        return [200, { item: weeklyGroceriesItems[itemIndex] }];
    }

    return [404, { message: "Item not found" }];
});



// reactive input bar for shoppinglists

export function ShoppingListSearch({
    createShoppingList,
    onSelectShoppingList,
}: {
    createShoppingList: boolean;
    onSelectShoppingList?: (shoppingList: ShoppingList) => void; // optional callback when a shopping list is selected
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
                    id: list.ID, // Map ID to id for SearchItem interface
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
            />
        </div>
    )
};

// export function ShoppingListSearchOld({
//     createShoppingList, onSelectShoppingList
// }: {
//     createShoppingList: boolean;
//     onSelectShoppingList?: (shoppingList: ShoppingList) => void; // optional callback when a shopping list is selected
// }) {

//     // current toString function
//     const shoppingListToString = (shoppingList: ShoppingList): string => {
//         return `${shoppingList.name} - ${shoppingList.type}`;
//     }

//     // the persistent list of shoppling lists from the API call
//     const allShoppingLists = React.useRef<ShoppingList[]>([]);
//     // search query in the search bar
//     const [query, setQuery] = React.useState<string>("");
//     // search results under the search bar
//     const [results, setResults] = React.useState<ShoppingList[]>([]);
//     // if the input is focused and should display results
//     const [focused, setFocused] = React.useState<boolean>(true);

//     // calls search on the first render so the autofocus shows results
//     React.useEffect(() => {
//         search()
//     }, []);

//     // calls search when createShoppingList changes e.g. shoppinglist potentially added
//     React.useEffect(() => {
//         search()
//     }, [createShoppingList]);

//     // filter results on query change
//     React.useEffect(() => {
//         setResults(allShoppingLists.current.filter((r) => shoppingListToString(r).toLowerCase().includes(query.trim().toLowerCase())));
//     }, [query]);

//     // calls the API to search shopping lists
//     const search = async () => {
//         try {
//             // call API
//             const response = await backend.get<listOfShoppingListSearchResult>("/shopping_lists");

//             // set allShoppingLists and results with API response
//             allShoppingLists.current = response.data.listOfShoppingLists;
//             setResults(response.data.listOfShoppingLists);

//         } catch (error) { // axios automatically throws error on 400s
//             console.error(error);
//         }
//     };

//     const handlePress = (e: React.MouseEvent<HTMLButtonElement>, shoppingList: ShoppingList) => {
//         setQuery(e.currentTarget.textContent || "");
//         setResults([]);
//         if (onSelectShoppingList) {
//             onSelectShoppingList(shoppingList);
//         }
//     }

//     return (
//         <div className="search-list">
//             <input
//                 type="text"
//                 placeholder="Search for shopping list"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 onFocus={() => { setFocused(true); }}
//                 onBlur={() => setTimeout(() => setFocused(false), 100)} // delay to let query fill input (from ChatGPT)
//                 autoFocus
//             />
//             {/* <img src="search-button-svgrepo-com.svg" alt="search icon"/> */}
//             {focused && (
//                 <ul className="shopping-list">
//                     {results.map((shoppingList) => (
//                         <li key={shoppingList.ID}>
//                             <button
//                                 id={"button-" + shoppingList.ID}
//                                 onMouseDown={(e) => handlePress(e, shoppingList)}
//                             >
//                                 {shoppingListToString(shoppingList)}
//                             </button>
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// };

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
                ID: response.data.shoppinglist.shoppingListID, // Map shoppingListID to ID
                name: response.data.shoppinglist.name,
                type: response.data.shoppinglist.type,
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
            <div className="create-shopping-list-form">
                <label htmlFor="name">Name:</label>
                <input
                    id="name"
                    type="text"
                    placeholder="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <CategoryInput setCategory={setCategory} />
                <button className="close-popup" onClick={() => setDisplayed(false)}>X</button>
                <button className="create-receipt" onClick={() => submitShoppingList()}>Submit</button>
            </div>
        </>
    );
}

// reactive input bar for categories, used by CreateShoppingListForm
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
        <div>
            <label htmlFor="category">Category:</label>
            <input
                id="category"
                type="text"
                value={query}
                onChange={handleChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 100)}
                autoFocus
                placeholder="Type or select category"
            />
            {focused && results.length > 0 && (
                <ul className="category-dropdown">
                    {results.map(cat => (
                        <li key={cat}>
                            <button
                                type="button"
                                onMouseDown={() => handleSelect(cat)}
                            >
                                {cat}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
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


    const ID = shoppingList.id;
    const name = shoppingList.name;
    const category = shoppingList.type;

    // fetch shopping list items on component mount
    React.useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const items = await getShoppingListItems(ID);
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
    }, [ID]);

    // handles adding a new item to the shopping list
    const handleAddItem = async () => {
        try {
            // check if fields are filled out
            if (!itemName || !itemCategory || itemQuantity <= 0) {
                throw new Error("Please fill out all item fields correctly.");
            }

            // call API to add item
            const newItem = await addShoppingListItem(ID, itemName, itemCategory, itemQuantity);

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
            const deletedItem = await deleteShoppingListItem(ID, itemID);

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
            <h2>Edit Shopping List</h2>
            <p>Shopping List: {name}</p>
            <p>Category: {category}</p>
            <label htmlFor="itemName">Item Name: </label>
            <div>
                <input
                    id="itemName"
                    type="text"
                    placeholder="item name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                />
                <label htmlFor="itemCategory"> Item Category: </label>
                <input
                    id="itemCategory"
                    type="text"
                    placeholder="item category"
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                />
                <label htmlFor="itemQuantity"> Item Quantity: </label>
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
            <ul>
                {shoppingListItems.map((item) => (
                    <li key={item.itemID}>
                        {item.name} - Category: {item.category} - Quantity: {item.quantity}
                        <button className="delete-item" onClick={() => handleDeleteItem(item.itemID)}>Delete</button>
                    </li>
                ))}
            </ul>
            <button className="close-popup" onClick={() => setDisplayed(false)}>X</button>
            <button className="save-changes" onClick={() => setDisplayed(false)}>Save Changes</button>
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
        const response = await backend.post(`/shopping_lists/${shoppingListID}/items/${itemID}`, {
            isDeleted: 1,
        })
        // console.log("delete response:", response.data);
        return response.data
    } catch (error) {
        console.error(error)
    }
}

