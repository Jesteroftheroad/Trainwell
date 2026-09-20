"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateActivationCode, revokeActivationCode } from "@/lib/builder/actions";
import type { ActivationCodeSummary } from "@/lib/builder/queries";

export function ActivationCodesPanel({
  programId,
  codes,
}: {
  programId: string;
  codes: ActivationCodeSummary[];
}) {
  const router = useRouter();
  const [justCreated, setJustCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    setCopied(false);
    startTransition(async () => {
      const result = await generateActivationCode(programId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setJustCreated(result.code);
      router.refresh();
    });
  }

  function handleCopy() {
    if (!justCreated) return;
    navigator.clipboard?.writeText(justCreated).then(() => setCopied(true));
  }

  function handleRevoke(codeId: string) {
    if (!confirm("Revoke this code? It can no longer be redeemed.")) return;
    setError(null);
    startTransition(async () => {
      const result = await revokeActivationCode(programId, codeId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <Button size="sm" className="gap-1.5" disabled={isPending} onClick={handleGenerate}>
        <Plus className="size-4" />
        {isPending ? "Generating…" : "Generate code"}
      </Button>

      {error && <p className="mt-2 text-sm font-medium text-danger">{error}</p>}

      {justCreated && (
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-primary-soft p-3">
          <span className="font-mono text-lg font-bold tracking-widest text-accent-foreground">{justCreated}</span>
          <Button variant="ghost" size="icon" aria-label="Copy code" onClick={handleCopy}>
            <Copy className="size-4" />
          </Button>
          {copied && <span className="text-xs font-medium text-success">Copied</span>}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {codes.length === 0 && <p className="text-sm text-muted-foreground">No codes yet.</p>}
        {codes.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-border p-3">
            <span className="font-mono font-bold tracking-wider">{c.code}</span>
            <div className="flex items-center gap-2">
              <Badge variant={c.redeemed ? "success" : "muted"}>{c.redeemed ? "Redeemed" : "Unused"}</Badge>
              {!c.redeemed && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Revoke code"
                  className="text-danger"
                  disabled={isPending}
                  onClick={() => handleRevoke(c.id)}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
