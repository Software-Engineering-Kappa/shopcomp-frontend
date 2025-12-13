"use client"
import React from "react"
import styles from "./page.module.css"
import { Purchase } from "./types"
import { SearchableList } from "../searchableList"
import { backend } from "../../axiosClient"
import { BorderAll } from "@mui/icons-material"

// Function that renders the list of purchases with a search bar
function PurchasesPanel({ purchases, setExpandedPurchaseId, setListLocked }: { purchases: Purchase[]; setExpandedPurchaseId: (id: number | null) => void; setListLocked: (locked: boolean) => void }) {

    function handleSelect(selection: Purchase) {
        setExpandedPurchaseId(selection.purchaseId)
    }

    const handleLockChange = (locked: boolean) => {
        if (!locked) {
            setExpandedPurchaseId(null)
        }
        setListLocked(locked)
    }

  const style = {
    display: "flex",
    justifyContent: "center",
    maxHeight: "250px",    // <-- The width &  height of SearchableList will be limited to the height 
    width: "500px",    // of the parent component. The search results become scrollable if needed.
  }

    return (
        <section>
            <h1>Purchases</h1>
            <div style={style}>
                <SearchableList
                    placeholderText="Search purchases..."
                    items={purchases}
                    onSelect={handleSelect}
                    onLockChange={handleLockChange}
                />
            </div>
        </section>
    )
}

function PurchasePanel({ purchases, expandedPurchaseId }: { purchases: Purchase[]; expandedPurchaseId: number | null }) {
    const selectedPurchase = purchases.find((p) => p.purchaseId === expandedPurchaseId)
    if (selectedPurchase) {
        return (
            <section>
                <h1>Purchase Details</h1>
                <p><strong>Item Name:</strong> {selectedPurchase.itemName}</p>
                <p><strong>Item Category:</strong> {selectedPurchase.itemCategory}</p>
                <p><strong>Purchase Price:</strong> ${Number(selectedPurchase.purchasePrice).toFixed(2)}</p>
                <p><strong>Purchase Quantity:</strong> {selectedPurchase.purchaseQuantity}</p>
                <p><strong>Most Recent Price:</strong> ${Number(selectedPurchase.itemMostRecentPrice).toFixed(2)}</p>
                <p><strong>Chain Name:</strong> {selectedPurchase.chainName}</p>
                <p><strong>Store Address:</strong> {`${selectedPurchase.address.houseNumber} ${selectedPurchase.address.street}, ${selectedPurchase.address.city}, ${selectedPurchase.address.state} ${selectedPurchase.address.postCode}, ${selectedPurchase.address.country}`}</p>
                <p><strong>Purchase Date:</strong> {new Date(selectedPurchase.purchaseDate).toLocaleDateString()}</p>
            </section>
        )
    }
    return null;
}

export { PurchasesPanel, PurchasePanel }