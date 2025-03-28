import ProfileIcon from "@app/components/ProfileIcon";
import { verifySession } from "@app/lib/auth/verifySession";
import { pullEnv } from "@app/lib/pullEnv";
import UserProvider from "@app/providers/UserProvider";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cache } from "react";

export const metadata: Metadata = {
    title: `Setup - Pangolin`,
    description: ""
};

export const dynamic = "force-dynamic";

export default async function SetupLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const getUser = cache(verifySession);
    const user = await getUser();

    const env = pullEnv();

    if (!user) {
        redirect("/?redirect=/setup");
    }

    if (
        !(!env.flags.disableUserCreateOrg || user.serverAdmin)
    ) {
        redirect("/");
    }

    return (
        <>
            <div className="p-3">
                {user && (
                    <UserProvider user={user}>
                        <div>
                            <ProfileIcon />
                        </div>
                    </UserProvider>
                )}

                <div className="w-full max-w-2xl mx-auto md:mt-32 mt-4">
                    {children}
                </div>
            </div>
        </>
    );
}
