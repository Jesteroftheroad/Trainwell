"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redeemCode } from "@/lib/programs/actions";

export function RedeemCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await redeemCode(code);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/today");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          placeholder="Activation code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="font-mono tracking-wider"
        />
        <Button disabled={isPending || !code.trim()} onClick={handleSubmit}>
          {isPending ? "Activating…" : "Activate"}
        </Button>
      </div>
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}
