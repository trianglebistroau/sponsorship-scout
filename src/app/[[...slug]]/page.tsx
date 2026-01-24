import { ClientOnly } from './client'
import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [{ slug: [''] }]
}

export default function Page({ params }: { params: { slug?: string[] } }) {
  // Redirect root route ("/") to "/generate"
  if (!params.slug || params.slug.length === 0) {
    redirect("/conversation");
  }

  return <ClientOnly />;
}