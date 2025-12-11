"use client"
import React from "react"
import styles from "./page.module.css"
import { Store, Chain } from "./types"
import { backend } from "../../axiosClient"
import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete"
import "@geoapify/geocoder-autocomplete/styles/minimal.css"
import { SearchableList } from "../searchableList"

// Function that renders the list of chains with a search bar
function ChainsPanel({ chains, setExpandedChainId, fetchChains }: { chains: Chain[]; setExpandedChainId: (id: number | null) => void; fetchChains: () => void }) {
    const [showAddChain, setShowAddChain] = React.useState(false)
    const [newChainName, setNewChainName] = React.useState("")

    // Function to add a new chain to the backend
    const addChain = async (chainName: string) => {
        let response = null;
        try {
            response = await backend.post(`/chains`, {
                name: chainName
            });
        } catch (error) {
            console.error("Error adding chain:", error);
        }
        console.log("Chain added:", response);
        // Refresh chains list after adding new chain 
        fetchChains();
    }

    // Handler for adding a new chain
    const handleAddChain = async () => {
        if (newChainName && newChainName.trim()) {
            await addChain(newChainName.trim())
        }
        setShowAddChain(false)
        setNewChainName("")
    }

    const handleSelect = (selection: Chain) => {
        setExpandedChainId(selection.id as number)
    }

    const style = {
        display: "flex",
        justifyContent: "center",
        height: "200px",    // <-- The width &  height of SearchableList will be limited to the height 
        width: "1000px",    // of the parent component. The search results become scrollable if needed.
    }

    // Filter chains based on chainQuery
    //const filteredChains = chains.filter((c) => c.name.toLowerCase().includes(chainQuery.trim().toLowerCase()))
    return (
        <section>
            <h2>Chains</h2>
            <div style={style}>
                <SearchableList
                    placeholderText="Search chains..."
                    items={chains}
                    onSelect={handleSelect}
                />
            </div>
            <button onClick={() => { setShowAddChain(true) }}>Add a Chain</button>

            {showAddChain && (
                <div>
                    <h3>Add Chain</h3>
                    <label>Chain name</label>
                    <input onChange={(e) => setNewChainName(e.target.value)} placeholder="Enter chain name" />
                    <button
                        onClick={handleAddChain}
                        disabled={newChainName.trim() === ""}
                    >Add</button>

                    <button onClick={() => { setShowAddChain(false); setNewChainName("") }}>Close</button>
                </div>
            )}
        </section>
    )
}

// Function that renders the stores for the currently selected chain
function StoresPanel({ chains, expandedChainId }: { chains: Chain[]; expandedChainId: number | null;}) {
    const [showAddStores, setShowAddStores] = React.useState(false)
    const [stores, setStores] = React.useState<Store[]>([])
    const [selectedAddress, setSelectedAddress] = React.useState<any>(null)
    const autocompleteContainer = React.useRef<HTMLDivElement>(null)

    // Fetch stores when expandedChainId changes
    React.useEffect(() => {
        if (expandedChainId !== null) {
            fetchStores(expandedChainId);
        }
    }, [expandedChainId]);

    // Initialize Geoapify autocomplete when showAddStores opens
    React.useEffect(() => {
        if (showAddStores && autocompleteContainer.current) {

            try {
                // Clear previous autocomplete if any
                autocompleteContainer.current.innerHTML = '';

                const autocomplete = new GeocoderAutocomplete(
                    autocompleteContainer.current,
                    process.env.NEXT_PUBLIC_SHOPCOMP_GEOAPIFY_API_KEY || "", // NOTE: Make sure to set your Geoapify API key in .env file
                    {
                        placeholder: 'Enter store address',
                        lang: 'en',
                        type: 'amenity', // Filters for points of interest like stores
                        limit: 5, // Limit number of suggestions
                    }
                );

                autocomplete.on('select', (location: any) => {
                    console.log('Selected location:', location);
                    const props = location.properties;

                    // Only accept if all required fields are present
                    if (props.housenumber && props.street && props.city &&
                        props.state && props.postcode && props.country) {
                        setSelectedAddress(location);
                    } else {
                        alert('Please select a complete address with all required fields (house number, street, city, state, postal code, country)');
                        setSelectedAddress(null);
                    }
                });

                autocomplete.on('suggestions', (suggestions: any) => {
                    console.log('Suggestions:', suggestions);
                });
            } catch (error) {
                console.error('Error initializing address autocomplete:', error);
                alert('Failed to initialize address search. Limit is 3000 per day.');
            }

        }
    }, [showAddStores]);

    // Function to fetch stores from backend API endpoint
    const fetchStores = async (chainId: number) => {
        try {
            const response = await backend.get(`/chains/${chainId}/stores`);
            const fetchedStores = response.data.stores.map((store: any) => {
            return {
                ...store,
                content: `${store.address.houseNumber} ${store.address.street}, ${store.address.city}, ${store.address.state} ${store.address.postCode}, ${store.address.country}`
            }});

            setStores(fetchedStores);
            console.log("Stores fetched successfully:", fetchedStores);
        } catch (error) {
            console.error("Error fetching stores:", error);
        }
    };

    // Helper function to format store address as a single string
    const getStoreAddress = (store: Store) => {
        return `${store.address.houseNumber} ${store.address.street}, ${store.address.city}, ${store.address.state} ${store.address.postCode}, ${store.address.country}`;
    }

    // Function to add a new store to the backend
    const addStore = async (storeAddress: any) => {
        let response = null;
        try {
            response = await backend.post(`/chains/${expandedChainId}/stores`, {
                address: {
                    houseNumber: storeAddress.properties.housenumber,
                    street: storeAddress.properties.street,
                    city: storeAddress.properties.city,
                    state: storeAddress.properties.state,
                    postCode: storeAddress.properties.postcode,
                    country: storeAddress.properties.country
                }
            });
        } catch (error) {
            console.error("Error adding store:", error);
        }
        console.log("Store added:", response);
    }

    if (expandedChainId == null) {
        return null
    }

    const chain = chains.find((c) => c.id === expandedChainId)
    if (!chain) return null

    // Handler for adding a new store from selectedAddress
    const handleAddStore = async () => {
        if (selectedAddress) {

            // Call backend API to add store to database
            await addStore(selectedAddress);

            // Update local stores state to include the newly added store
            fetchStores(expandedChainId);

            // Close add store popup and reset selected address

            setShowAddStores(false);
            setSelectedAddress(null);
        }
    };

    const handleSelect = (selection: Store) => {
        console.log("Selected store: ", getStoreAddress(selection))
        // Will do more with Geoapify Places API later
    }

    const style = {
        display: "flex",
        justifyContent: "center",
        height: "200px",    // <-- The width &  height of SearchableList will be limited to the height 
        width: "1000px",    // of the parent component. The search results become scrollable if needed.
    }

    return (
        <section>
            <h2>{chain.name} — Stores</h2>

            <div>
                <div style={style}>
                    <SearchableList
                        placeholderText="Search stores..."
                        items={stores}
                        onSelect={handleSelect}
                    />
                </div>
                <button onClick={() => { setShowAddStores(true) }}>Add a Store</button>

                {showAddStores && (
                    <div>
                        <h3>Add Store to {chain.name}</h3>
                        <label>Search for store address:</label>
                        <div ref={autocompleteContainer} style={{ position: 'relative' }}></div>
                        <button
                            onClick={handleAddStore}
                            disabled={!selectedAddress}
                            style={{ marginTop: '10px' }}
                        >
                            Add
                        </button>
                        <button onClick={() => {
                            setShowAddStores(false);
                            setSelectedAddress(null);
                        }}>Close</button>
                    </div>
                )}

            </div>
        </section>
    )
}

export { ChainsPanel, StoresPanel }