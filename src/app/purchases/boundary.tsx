"use client"
import React from "react"
import styles from "./page.module.css"
import { Purchase } from "./types"
import { backend } from "../../axiosClient"

// Function that renders the list of purchases with a search bar
function PurchasesPanel({ purchases, expandedPurchaseId, setExpandedPurchaseId }: { purchases: Purchase[]; expandedPurchaseId: number | null; setExpandedPurchaseId: (id: number | null) => void; }) {
    const [purchaseQuery, setPurchaseQuery] = React.useState("")

    // Filter purchases based on purchaseQuery
    const filteredPurchases = purchases.filter((p) => `${p.itemName} - ${p.chainName} (${p.date})`.toLowerCase().includes(purchaseQuery.trim().toLowerCase()))
    return (
        <section>
            <h2>Purchases</h2>
            <input
                placeholder="Search purchases..."
                onChange={(e) => setPurchaseQuery(e.target.value)}
            />

            <ul>
                {filteredPurchases.map((p) => (
                    <PurchaseItem key={p.id} purchase={p} expandedPurchaseId={expandedPurchaseId} setExpandedPurchaseId={setExpandedPurchaseId} />
                ))}
            </ul>
        </section>
    )
}

// Function that renders a single purchase (A purchase in the list)
function PurchaseItem({ purchase, expandedPurchaseId, setExpandedPurchaseId }: { purchase: Purchase; expandedPurchaseId: number | null; setExpandedPurchaseId: (id: number | null) => void }) {
    const isSelected = expandedPurchaseId === purchase.id
    return (
        <li onClick={() => setExpandedPurchaseId(isSelected ? null : purchase.id)}>
            <span>{purchase.itemName} - {purchase.chainName} ({purchase.date})</span>
            <span>{isSelected ? " (selected)" : ""}</span> 
        </li>
    )
}

function PurchasePanel({ purchases, expandedPurchaseId }: { purchases: Purchase[]; expandedPurchaseId: number | null }) {
    const selectedPurchase = purchases.find((p) => p.id === expandedPurchaseId)

    if (selectedPurchase) {
        return (
            <section>
                <h2>Purchase Details</h2>
                <p><strong>Item Name:</strong> {selectedPurchase.itemName}</p>
                <p><strong>Price:</strong> ${selectedPurchase.price.toFixed(2)}</p>
                <p><strong>Chain Name:</strong> {selectedPurchase.chainName}</p>
                <p><strong>Store Address:</strong> {`${selectedPurchase.storeAddress.houseNumber} ${selectedPurchase.storeAddress.street}, ${selectedPurchase.storeAddress.city}, ${selectedPurchase.storeAddress.state} ${selectedPurchase.storeAddress.postCode}, ${selectedPurchase.storeAddress.country}`}</p>
                <p><strong>Date:</strong> {selectedPurchase.date}</p>
            </section>
        )
    }
}

export { PurchasesPanel, PurchasePanel }