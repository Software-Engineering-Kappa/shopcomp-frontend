import React, { useState, useEffect } from "react";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { backend } from "../../axiosClient";
import { SearchableList, SearchItem } from "../searchableList"
import { create } from "domain";
import styles from './page.module.css';
import { Padding } from "@mui/icons-material";
import { getOffsetLeft } from "@mui/material";

export interface ShoppingList extends SearchItem {
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
        alignItems: "center",
        flextDirection: "column",
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

    // Old return
    // return (
    //     <div>
    //         <label htmlFor="category">Category:</label>
    //         <input
    //             id="category"
    //             type="text"
    //             value={query}
    //             onChange={handleChange}
    //             onFocus={() => setFocused(true)}
    //             onBlur={() => setTimeout(() => setFocused(false), 100)}
    //             autoFocus
    //             placeholder="Type or select category"
    //         />
    //         {focused && results.length > 0 && (
    //             <ul className="category-dropdown">
    //                 {results.map(cat => (
    //                     <li key={cat}>
    //                         <button
    //                             type="button"
    //                             onMouseDown={() => handleSelect(cat)}
    //                         >
    //                             {cat}
    //                         </button>
    //                     </li>
    //                 ))}
    //             </ul>
    //         )}
    //     </div>
    // )

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

            if (newItem && newItem.item && newItem.item.name && newItem.item.category && newItem.item.quantity) {
                setShoppingListItems((prevItems) => [...prevItems, newItem.item]);
                // clear input fields
                setItemName("");
                setItemCategory("");
                setItemQuantity(0);
            } else {
                console.error("Invalid item data:", newItem);
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
            <h2>Edit Shopping List</h2>
            <p>Shopping List: {name}</p>
            <p>Category: {category}</p>
            <div>
                <label htmlFor="itemName">Item Name: </label>
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
                {shoppingListItems
                    .filter((item) => item && item.name) // Ensure item and item.name exist
                    .map((item) => (
                    <li key={item.itemID}>
                        {item.name} - Category: {item.category} - Quantity: {item.quantity}
                        <button className="delete-item" onClick={() => handleDeleteItem(item.itemID)}>Delete</button>
                    </li>
                ))}
            </ul>
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
        console.log("add item response:", response.data);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

async function deleteShoppingListItem(shoppingListID: number, itemID: number) {
    try {
        console.log("Deleting item:", { shoppingListID, itemID });
        const response = await backend.delete(`/shopping_lists/${shoppingListID}/items/${itemID}`)
        console.log("delete response:", response.data);
        return response.data;
    } catch (error) {
        console.error(error)
    }
}

