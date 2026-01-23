import { ClientOnly } from './client'
import { redirect } from "next/navigation";
import React from "react";

export async function generateStaticParams() {
  return [{ slug: [''] }]
}

export default function Page({ params }: { params: Awaited<ReturnType<typeof generateStaticParams>> }) {
  // Redirect root route ("/") to "/generate"
  React.useEffect(() => {
    if (!params?.slug || params.slug.length === 0) {
      redirect("/conversation");
    }
  }, [params]);

  return <ClientOnly />;
}