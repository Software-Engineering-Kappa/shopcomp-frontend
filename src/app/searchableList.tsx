"use client"

import styles from "./searchableList.module.css"
import React from "react"
import SearchIcon from "@mui/icons-material/Search"

/**
 * 
 */
export interface SearchItem {
  content: string
  id: number | string
}

/**
 * An element for searching, selecting, and deleting items in a list of `items`.
 *
 * @param placeholderText - Placeholder text for the search input
 * @param items - Items to search through
 * @param onSelection - Callback function to handle selection logic
 * @param onDelete - If defined, search results will be delete-able, and this callback function will
 * handle the deletion logic
 */
export function SearchableList<T extends SearchItem>({
  placeholderText,
  items,
  onSelect,
  onDelete,
}: {
  placeholderText: string,
  items: T[],
  onSelect: (selection: T) => void,
  onDelete?: (selection: T) => void,
}) {
  const [searchResults, setSearchResults] = React.useState<T[]>([])
  const [isLocked, setIsLocked] = React.useState(false)

  // Triggered when the user enters a search query
  function handleSearch(query: string) {
    // Filter items to those that contain `query` (case insensitively)
    const matches = items
      .filter((item) => item.content.toLowerCase().includes(query.toLowerCase()))

    setSearchResults(matches)
  }

  // Triggered when the user selects a search result
  function handleSelect(selection: T | null) {
    if (selection !== null) {
      setIsLocked(true)
      onSelect(selection)
    } else {
      setIsLocked(false)
    }
  }

  // Triggered when user clicks delete on a search element. Only defined if `onDelete` is defined
  const handleDelete = onDelete ? ((selection: T) => {
    setIsLocked(false)
    onDelete(selection)
  }) : undefined

  // Render list of items when component loads
  React.useEffect(() => handleSearch(""), [items])

  return (
    <div className={styles.searchPanelContainer}>
      <SearchInput
        placeholderText={placeholderText}
        onSearch={handleSearch}
        isLocked={isLocked}
      />
      <SearchResults
        results={searchResults}
        onSelect={handleSelect}
        onDelete={handleDelete}
      />
    </div>
  )
}

/**
 * @param placeholderText - Placeholder for the input text
 * @param triggerSearch - Function which is triggered when a query is entered
 */
function SearchInput({
  placeholderText,
  onSearch,
  isLocked,
}: {
  placeholderText: string,
  onSearch: (query: string) => void,
  isLocked: boolean,
}) {
  // Stores input text
  const [query, setQuery] = React.useState("")

  // Function called when form is submitted by with submit button
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch(query)
  }

  // Function called when text in input changes
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    setQuery(e.target.value)
    onSearch(e.target.value)
  }

  return (
    <form className={styles.searchInputContainer} onSubmit={handleSubmit}>
      <input
        className={styles.searchInputText}
        type="text"
        placeholder={placeholderText}
        onChange={handleFormChange}
        disabled={isLocked}
      />
      <button
        className={styles.searchInputButton}
        type="submit"
        disabled={isLocked}>
        <SearchIcon fontSize="inherit" />
      </button>
    </form>
  )
}

function SearchResults<T extends SearchItem>({
  results,
  onSelect,
  onDelete,
}: {
  results: T[]
  onSelect: (item: T | null) => void,
  onDelete?: (item: T) => void,
}) {
  const [selectedItem, setSelectedItem] = React.useState<T | null>(null)

  // Function called when a child SearchResultElement is clicked
  function handleClick(item: T) {
    // If this is the selected item, unselect it. 
    if (item.id === selectedItem?.id) {
      setSelectedItem(null)
      onSelect(null)
    }

    // Allow selecting a different element if unlocked
    else {
      setSelectedItem(item)
      onSelect(item)
    }
  }

  // Wrap search results in SearchResultElement tags
  const elements = results.map((item, index) =>
    <SearchResultElement
      key={index}
      item={item}
      handleClick={handleClick}
      isSelected={item.id === selectedItem?.id}
      onDelete={onDelete}
    />
  )

  return (
    <div className={styles.searchResultsContainer}>
      {elements}
    </div>
  )
}

function SearchResultElement<T extends SearchItem>({
  item,
  handleClick,
  isSelected,
  onDelete,
}: {
  item: T,
  handleClick: (item: T) => void,
  isSelected: boolean,
  onDelete?: (item: T) => void,
}) {
  const style = isSelected ? styles.searchResultElementSelected : styles.searchResultElement
  const isDeletable = onDelete !== undefined

  // Apply custom styling to this element if it is selected
  return (
    <div className={style}>
      <div style={{ width: "100%" }} onClick={() => handleClick(item)}>
        {item.content}
      </div>
      {isSelected && isDeletable &&
        <button
          className={styles.searchResultElementDeleteButton}
          onClick={() => onDelete(item)}>
          X
        </button>
      }
    </div>
  )
}

