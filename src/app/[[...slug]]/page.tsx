import { redirect } from "next/navigation";
<<<<<<< HEAD
import { ClientOnly } from './client';
=======
import React from "react";
>>>>>>> fd5dc51 (updates on generate page to have card base generation)

export async function generateStaticParams() {
  return [{ slug: [''] }]
}

<<<<<<< HEAD
export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  
  // Redirect root route ("/") to "/generate"
  if (!resolvedParams.slug || resolvedParams.slug.length === 0) {
    redirect("/conversation");
  }
=======
export default function Page({ params }: { params: Awaited<ReturnType<typeof generateStaticParams>> }) {
  // Redirect root route ("/") to "/generate"
  React.useEffect(() => {
    if (!params?.slug || params.slug.length === 0) {
      redirect("/conversation");
    }
  }, [params]);
>>>>>>> fd5dc51 (updates on generate page to have card base generation)

  return <ClientOnly />;
}