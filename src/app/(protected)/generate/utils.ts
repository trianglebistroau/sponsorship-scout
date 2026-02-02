import { FileNode, FileNodeUpdate } from "./types"

export const buildFileMap = (
  nodes: FileNode[],
  acc: Record<string, FileNode> = {}
): Record<string, FileNode> => {
  nodes.forEach((node) => {
    acc[node.id] = node
    if (node.children?.length) {
      buildFileMap(node.children, acc)
    }
  })

  return acc
}

export const flattenFiles = (nodes: FileNode[]): FileNode[] => {
  return nodes.flatMap((node) => {
    if (node.type === "file") {
      return node
    }

    return node.children ? flattenFiles(node.children) : []
  })
}

export const applyFileOverrides = (
  nodes: FileNode[],
  overrides: Record<string, FileNodeUpdate>
): FileNode[] => {
  return nodes.map((node) => {
    const override = overrides[node.id]
    const nextNode: FileNode = {
      ...node,
      ...(override ?? {}),
    }

    if (node.children?.length) {
      nextNode.children = applyFileOverrides(node.children, overrides)
    }

    return nextNode
  })
}

export const escapeMarkdownHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const formatInline = (value: string) => {
  let html = escapeMarkdownHtml(value)
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")
  return html
}

export const convertMarkdownToHtml = (markdown: string) => {
  const lines = markdown.split(/\r?\n/)
  const html: string[] = []
  let inList = false
  let inCode = false
  let codeBuffer: string[] = []

  const closeList = () => {
    if (inList) {
      html.push("</ul>")
      inList = false
    }
  }

  const closeCode = () => {
    if (inCode) {
      html.push(`<pre><code>${escapeMarkdownHtml(codeBuffer.join("\n"))}</code></pre>`)
      codeBuffer = []
      inCode = false
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith("```") ) {
      if (inCode) {
        closeCode()
      } else {
        closeList()
        inCode = true
        codeBuffer = []
      }
      return
    }

    if (inCode) {
      codeBuffer.push(line)
      return
    }

    if (!trimmed) {
      closeList()
      html.push("")
      return
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      closeList()
      const level = headingMatch[1].length
      html.push(`<h${level}>${formatInline(headingMatch[2])}</h${level}>`)
      return
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      if (!inList) {
        inList = true
        html.push("<ul>")
      }
      const itemText = trimmed.replace(/^[-*+]\s+/, "")
      html.push(`<li>${formatInline(itemText)}</li>`)
      return
    }

    closeList()
    html.push(`<p>${formatInline(trimmed)}</p>`)
  })

  closeList()
  closeCode()

  return html.filter(Boolean).join("")
}
