"use client"
import React from "react"
import styles from "./page.module.css"
import { Store, Chain } from "./types"
import { backend } from "../../axiosClient"
import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete"
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import "@geoapify/geocoder-autocomplete/styles/minimal.css"
import { SearchableList } from "../searchableList"

// Function that renders the list of chains with a search bar
function ChainsPanel({ 
    chains, 
    setChains,
    setExpandedChainId, 
    fetchChains 
}: { 
    chains: Chain[]; 
    setChains: React.Dispatch<React.SetStateAction<Chain[]>>,
    setExpandedChainId: (id: number | null) => void; 
    fetchChains: () => void 
}) {
    const [showAddChain, setShowAddChain] = React.useState(false)
    const [newChainName, setNewChainName] = React.useState("")
    const [isAdmin, setIsAdmin] = React.useState(false)

    // Determine if user is admin in page load
    React.useEffect(() => {
      setIsAdmin(localStorage.getItem("role") === "admin")
    })

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
        setExpandedChainId(selection.id)
    }

    // Define handleDelete if the logged in user is an admin
    let handleDelete = undefined
    if (isAdmin) {
      handleDelete = (selection: Chain) => {
        const chainId = selection.id
        backend .delete(`/chains/${chainId}`)
        .then((response) => {
          const deletedId = response.data.id

          // Remove the deleted chain from the list
          setChains(prevChains => prevChains.filter(item => item.id !== deletedId))
        }).catch((error) => {
          console.log("Error deleting a chain: ", error)
        })
      }
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
                    onDelete={handleDelete}
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
    const [selectedStore, setSelectedStore] = React.useState<Store | null>(null)
    const [coords, setCoords] = React.useState<[number, number] | null>(null)
    const [listLocked, setListLocked] = React.useState(false)
    const [mapLoading, setMapLoading] = React.useState(false)
    const autocompleteContainer = React.useRef<HTMLDivElement>(null)

    const [isAdmin, setIsAdmin] = React.useState(false)

    // Determine if user is admin in page load
    React.useEffect(() => {
      setIsAdmin(localStorage.getItem("role") === "admin")
    })

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

const handleSelect = async (selection: Store) => {
    console.log("Selected store: ", getStoreAddress(selection))
    setSelectedStore(selection)
    setMapLoading(true)
    
    // Geocode the address to get coordinates
    const address = getStoreAddress(selection)
    try {
        const apiKey = process.env.NEXT_PUBLIC_SHOPCOMP_GEOAPIFY_API_KEY || ''
        const response = await fetch(
            `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${apiKey}`
        )
        const data = await response.json()
        console.log('Geocoding response data:', data)
        
        if (data.features && data.features.length > 0) {
            const coords = data.features[0].geometry.coordinates
            console.log('Geocoded coordinates:', coords)
            setCoords(coords)
        }
    } catch (error) {
        console.error('Geocoding error:', error)
    } finally {
        setMapLoading(false)
    }
}

    // Define handleDelete if the logged in user is an admin
    let handleDelete = undefined
    if (isAdmin) {
      handleDelete = (selection: Store) => {
        const chainId = expandedChainId
        const storeId = selection.id
        backend.delete(`/chains/${chainId}/stores/${storeId}`)
        .then((response) => {
          // Reset the stores list
          fetchStores(chainId)
        }).catch((error) => {
          console.log("Error deleting a store: ", error)
        })
      }
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
                        onDelete={handleDelete}
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

            {selectedStore && listLocked && (
                <section style={{ marginTop: 16 }}>
                    <h3>Selected store</h3>
                    <div>{getStoreAddress(selectedStore)}</div>
                    {mapLoading ? (
                        <div style={{ height: 400, width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
                            <p>Loading map...</p>
                        </div>
                    ) : (
                    <div style={{ height: 400, width: '100%', marginTop: 8 }}>
                        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                            <Map
                                center={{
                                    lat: coords ? coords[1] : 0,
                                    lng: coords ? coords[0] : 0
                                }}
                                zoom={15}
                                mapId='SHOPCOMP_MAP'
                                style={{ height: '100%', width: '100%' }}
                            >
                                <AdvancedMarker
                                    position={{
                                        lat: coords ? coords[1] : 0,
                                        lng: coords ? coords[0] : 0
                                    }}
                                />
                            </Map>
                        </APIProvider>
                    </div>
                    )}
                </section>
            )}
        </section>
    )
}

export { ChainsPanel, StoresPanel }
