class BlockEditor extends HTMLElement {
  constructor() {
    super()
    this.addEventListener("keydown", this.handleKeyDown.bind(this))
  }

  connectedCallback() {
    if (this.children.length === 0) {
      this.appendChild(new EditorBlock())
    }
  }

  handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      const currentBlock = event.target.closest("editor-block")
      const newBlock = new EditorBlock()
      currentBlock.after(newBlock)
      newBlock.focus()
    }
  }
}

class EditorBlock extends HTMLElement {
  constructor() {
    super()
    this.contentEditable = true
    this.innerHTML = "<br>" // Ensures the block has height even when empty
    this.addEventListener("input", this.handleInput.bind(this))
  }

  handleInput() {
    const content = this.textContent.trim()
    if (content.startsWith("- ") || content.startsWith("* ")) {
      const listItem = document.createElement("li")
      listItem.textContent = content.slice(2)
      const list = document.createElement("nested-list")
      list.appendChild(listItem)
      this.parentElement.replaceChild(list, this)
      listItem.focus()
    }
  }

  focus() {
    this.focus()
    // Move cursor to the end of the content
    const range = document.createRange()
    range.selectNodeContents(this)
    range.collapse(false)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

class NestedList extends HTMLElement {
  constructor() {
    super()
    this.addEventListener("keydown", this.handleKeyDown.bind(this))
  }

  handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      const currentItem = event.target.closest("li")
      if (currentItem.textContent.trim() === "") {
        // Convert empty list item back to a regular block
        const newBlock = new EditorBlock()
        this.parentElement.replaceChild(newBlock, this)
        newBlock.focus()
      } else {
        const newItem = document.createElement("li")
        newItem.contentEditable = true
        newItem.innerHTML = "<br>"
        currentItem.after(newItem)
        newItem.focus()
      }
    } else if (event.key === "Tab") {
      event.preventDefault()
      const currentItem = event.target.closest("li")
      if (event.shiftKey) {
        this.outdent(currentItem)
      } else {
        this.indent(currentItem)
      }
    }
  }

  indent(item) {
    const prevItem = item.previousElementSibling
    if (prevItem) {
      let nestedList = prevItem.querySelector("nested-list")
      if (!nestedList) {
        nestedList = document.createElement("nested-list")
        prevItem.appendChild(nestedList)
      }
      nestedList.appendChild(item)
    }
  }

  outdent(item) {
    const parentList = item.parentElement
    if (parentList.tagName === "NESTED-LIST" && parentList.parentElement.tagName === "LI") {
      parentList.parentElement.after(item)
      if (parentList.children.length === 0) {
        parentList.remove()
      }
    }
  }
}

customElements.define("block-editor", BlockEditor)
customElements.define("editor-block", EditorBlock)
customElements.define("nested-list", NestedList)

