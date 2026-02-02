import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { GeneratorNav } from "@/components/navigation";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() });
    console.log("ProtectedLayout session:", session);
    if (!session) {
        redirect("/auth");
    }

    return (
        <div>
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 lg:px-8">
                <GeneratorNav />
            </div>
            <>{children}</>
        </div>
    );
}
