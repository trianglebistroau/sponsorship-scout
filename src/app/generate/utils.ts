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
