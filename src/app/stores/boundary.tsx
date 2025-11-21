import React from "react"
import styles from "./page.module.css"
import { Chain } from "./types"

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
                    <button onClick={() => {
                        if (newChainName && newChainName.trim()) {
                            onAddChain(newChainName.trim())
                        }
                        setShowAddChain(false)
                        setNewChainName("")
                    }}>Add</button>

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
    const [newStoreName, setNewStoreName] = React.useState("")

    if (expandedChainId == null) {
        return null
    }

    const chain = chains.find((c) => c.id === expandedChainId)
    if (!chain) return null

    // Filter stores based on storeQuery
    const filteredStores = chain.stores.filter((s) => s.toLowerCase().includes(storeQuery.trim().toLowerCase()))

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
                        <label>Store name</label>
                        <input onChange={(e) => setNewStoreName(e.target.value)} placeholder="Enter store name" />
                        <button onClick={() => {
                            if (newStoreName && newStoreName.trim()) {
                                onAddStore(chain.id, newStoreName.trim())
                            }
                            setShowAddStores(false)
                            setNewStoreName("")
                        }}>Add</button>
                        <button onClick={() => { setShowAddStores(false); setNewStoreName("") }}>Close</button>
                    </div>
                )}

            </div>

            <ul>
                {filteredStores.map((s, i) => (
                    <li key={i}>
                        <span>{s}</span>
                    </li>
                ))}
            </ul>
        </section>
    )
}

export { ChainsPanel, StoresPanel }