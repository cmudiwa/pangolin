"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon, LinkIcon, CheckIcon, CopyIcon } from "lucide-react";
import { useOrgContext } from "@app/hooks/useOrgContext";
import { useResourceContext } from "@app/hooks/useResourceContext";

type ResourceInfoBoxType = {};

export default function ResourceInfoBox({}: ResourceInfoBoxType) {
    const [copied, setCopied] = useState(false);

    const { org } = useOrgContext();
    const { resource } = useResourceContext();

    const fullUrl = `${resource.ssl ? "https" : "http"}://${
        resource.subdomain
    }.${org.org.domain}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <Card>
            <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle className="font-semibold">
                    Resource Information
                </AlertTitle>
                <AlertDescription className="mt-3">
                    <p className="mb-2">
                        The current full URL for this resource is:
                    </p>
                    <div className="flex items-center space-x-2 bg-muted p-2 rounded-md">
                        <LinkIcon className="h-4 w-4" />
                        <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono flex-grow hover:underline"
                        >
                            {fullUrl}
                        </a>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                            className="ml-2"
                            type="button"
                        >
                            {copied ? (
                                <CheckIcon className="h-4 w-4 text-green-500" />
                            ) : (
                                <CopyIcon className="h-4 w-4" />
                            )}
                            <span className="ml-2">
                                {copied ? "Copied!" : "Copy"}
                            </span>
                        </Button>
                    </div>
                    {/* <ul className="mt-3 space-y-1 text-sm list-disc list-inside">
                        <li>
                            Protocol:{" "}
                            <span className="font-semibold">{protocol}</span>
                        </li>
                        <li>
                            Subdomain:{" "}
                            <span className="font-semibold">{subdomain}</span>
                        </li>
                        <li>
                            Domain:{" "}
                            <span className="font-semibold">{domain}</span>
                        </li>
                    </ul> */}
                </AlertDescription>
            </Alert>
        </Card>
    );
}
