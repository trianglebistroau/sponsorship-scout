export type FileNode = {
  id: string
  name: string
  type: "folder" | "file"
  children?: FileNode[]
  summary?: string
  content?: string
  accentColor?: string
}

export type FileNodeUpdate = Partial<Pick<FileNode, "name" | "summary" | "content">>

export type TagCategory = "ideas" | "themes" | "strategies"

export type FeedItemTags = Record<TagCategory, string[]>

export type FeedItem = {
  id: string
  title: string
  excerpt: string
  duration: string
  body: string
  tags: FeedItemTags
}
