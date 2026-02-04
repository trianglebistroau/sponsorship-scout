import { ClientProviders } from "../providers"

export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientProviders>{children}</ClientProviders>
}