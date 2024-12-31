import type { Metadata } from "next";
import "./globals.css";
import { Figtree } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@app/providers/ThemeProvider";
import EnvProvider from "@app/providers/EnvProvider";
import { Separator } from "@app/components/ui/separator";
import { cache } from "react";
import { verifySession } from "@app/lib/auth/verifySession";
import Header from "@app/components/Header";
import UserProvider from "@app/providers/UserProvider";

export const metadata: Metadata = {
    title: `Dashboard - Pangolin`,
    description: ""
};

const font = Figtree({ subsets: ["latin"] });

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    const version = process.env.APP_VERSION;

    return (
        <html suppressHydrationWarning>
            <body className={`${font.className}`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <EnvProvider
                        // it's import not to pass all of process.env here in case of secrets
                        // select only the necessary ones
                        env={{
                            NEXT_PORT: process.env.NEXT_PORT as string,
                            SERVER_EXTERNAL_PORT: process.env
                                .SERVER_EXTERNAL_PORT as string,
                            ENVIRONMENT: process.env.ENVIRONMENT as string,
                            EMAIL_ENABLED: process.env.EMAIL_ENABLED as string,
                            // optional
                            DISABLE_USER_CREATE_ORG:
                                process.env.DISABLE_USER_CREATE_ORG,
                            DISABLE_SIGNUP_WITHOUT_INVITE:
                                process.env.DISABLE_SIGNUP_WITHOUT_INVITE
                        }}
                    >
                        {children}

                        <footer className="w-full mt-12 py-3 mb-4">
                            <div className="container mx-auto flex flex-wrap justify-center items-center h-4 space-x-4 text-sm text-neutral-400 select-none">
                                <div className="whitespace-nowrap">
                                    Pangolin
                                </div>
                                <Separator orientation="vertical" />
                                <div className="whitespace-nowrap">
                                    Built by Fossorial
                                </div>
                                <Separator orientation="vertical" />
                                <a
                                    href="https://github.com/fosrl/pangolin"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="GitHub"
                                    className="flex items-center space-x-3 whitespace-nowrap"
                                >
                                    <span>Open Source</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-3 h-3"
                                    >
                                        <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.385.6.11.82-.26.82-.577v-2.17c-3.338.726-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.755-1.333-1.755-1.09-.744.082-.73.082-.73 1.205.085 1.84 1.24 1.84 1.24 1.07 1.835 2.807 1.305 3.492.997.107-.775.42-1.305.763-1.605-2.665-.305-5.467-1.335-5.467-5.93 0-1.31.468-2.382 1.236-3.22-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 013.006-.403c1.02.005 2.045.137 3.006.403 2.29-1.552 3.295-1.23 3.295-1.23.654 1.653.242 2.873.12 3.176.77.838 1.235 1.91 1.235 3.22 0 4.605-2.805 5.623-5.475 5.92.43.37.814 1.1.814 2.22v3.293c0 .32.217.693.825.576C20.565 21.795 24 17.298 24 12 24 5.373 18.627 0 12 0z" />
                                    </svg>
                                </a>
                                {version && (
                                    <>
                                        <Separator orientation="vertical" />
                                        <div className="whitespace-nowrap">
                                            v{version}
                                        </div>
                                    </>
                                )}
                            </div>
                        </footer>
                    </EnvProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
