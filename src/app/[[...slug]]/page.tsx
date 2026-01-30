import { redirect } from "next/navigation";
import { ClientOnly } from './client';

export function generateStaticParams() {
  return [{ slug: [''] }]
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  
  // Redirect root route ("/") to landing page
  if (!resolvedParams.slug || resolvedParams.slug.length === 0) {
    redirect("/landing");
  }

  return <ClientOnly />;
}