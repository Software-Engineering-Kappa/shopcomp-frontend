"use client"
import React from "react"
import styles from "./page.module.css"
import { Chain, Store } from "./types"
import { backend } from "../../axiosClient"
import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete"
import "@geoapify/geocoder-autocomplete/styles/minimal.css"

// Function that renders the list of chains with a search bar
function ChainsPanel({ chains, expandedChainId, setExpandedChainId, onAddChain }: { chains: Chain[]; expandedChainId: number | null; setExpandedChainId: (id: number | null) => void; onAddChain: (name: string) => void }) {
    const [chainQuery, setChainQuery] = React.useState("")
    const [showAddChain, setShowAddChain] = React.useState(false)
    const [newChainName, setNewChainName] = React.useState("")

    // Filter chains based on chainQuery
    const filteredChains = chains.filter((c) => c.name.toLowerCase().includes(chainQuery.trim().toLowerCase()))
    return (
        <section>
            <h2>Chains</h2>
            <input
                placeholder="Search chains..."
                onChange={(e) => setChainQuery(e.target.value)}
            />
            <button onClick={() => setShowAddChain(true)}>Add Chain Popup</button>

            {showAddChain && (
                <div>
                    <h3>Add Chain</h3>
                    <label>Chain name</label>
                    <input onChange={(e) => setNewChainName(e.target.value)} placeholder="Enter chain name" />
                    <button
                        onClick={() => {
                            if (newChainName && newChainName.trim()) {
                                onAddChain(newChainName.trim())
                            }
                            setShowAddChain(false)
                            setNewChainName("")
                        }}
                        disabled={newChainName.trim() === ""}
                    >Add</button>

                    <button onClick={() => { setShowAddChain(false); setNewChainName("") }}>Close</button>
                </div>
            )}

            <ul>
                {filteredChains.map((c) => (
                    <ChainItem key={c.id} chain={c} expandedChainId={expandedChainId} setExpandedChainId={setExpandedChainId} />
                ))}
            </ul>
        </section>
    )
}

// Function that renders a single chain item (A chain in the list)
function ChainItem({ chain, expandedChainId, setExpandedChainId }: { chain: Chain; expandedChainId: number | null; setExpandedChainId: (id: number | null) => void }) {
    const isSelected = expandedChainId === chain.id
    return (
        <li onClick={() => setExpandedChainId(isSelected ? null : chain.id)}>
            <span>{chain.name}</span>
            <span>{isSelected ? " (selected)" : ""}</span>
        </li>
    )
}

// Function that renders the stores for the currently selected chain
function StoresPanel({ chains, expandedChainId, onAddStore }: { chains: Chain[]; expandedChainId: number | null; onAddStore: (chainId: number, storeName: string) => void }) {
    const [storeQuery, setStoreQuery] = React.useState("")
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
            const fetchedStores: Store[] = response.data.stores.map((store: any) => ({
                id: store.ID,
                address: {
                    houseNumber: store.address.houseNumber,
                    street: store.address.street,
                    city: store.address.city,
                    state: store.address.state,
                    postCode: store.address.postCode,
                    country: store.address.country
                }
            }));
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

    if (expandedChainId == null) {
        return null
    }

    const chain = chains.find((c) => c.id === expandedChainId)
    if (!chain) return null

    // Filter stores based on storeQuery
    const filteredStores = stores.filter((s) => getStoreAddress(s).toLowerCase().includes(storeQuery.trim().toLowerCase()))

    // Handler for adding a new store from selectedAddress
    const handleAddStore = () => {
        if (selectedAddress) {
            const properties = selectedAddress.properties;

            const newStore: Store = {
                id: Date.now(), // Temporary ID until backend assigns one
                address: {
                    houseNumber: properties.housenumber || '',
                    street: properties.street || '',
                    city: properties.city || '',
                    state: properties.state || '',
                    postCode: properties.postcode || '',
                    country: properties.country || ''
                }
            };

            setStores([...stores, newStore]); // TODO: Call backend API to add store to database
            setShowAddStores(false);
            setSelectedAddress(null);
        }
    };

    return (
        <section>
            <h2>{chain.name} — Stores</h2>

            <div>
                <input
                    placeholder={`Search ${chain.name} stores...`}
                    onChange={(e) => setStoreQuery(e.target.value)}
                />
                <button onClick={() => { setShowAddStores(true) }}>Add Stores Popup</button>

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

            <ul>
                {filteredStores.map((s, i) => (
                    <li key={i}>
                        <span>{getStoreAddress(s)}</span>
                    </li>
                ))}
            </ul>
        </section>
    )
}

export { ChainsPanel, StoresPanel }