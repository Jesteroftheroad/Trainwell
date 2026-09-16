"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProgramMeta } from "@/lib/builder/actions";

export function ProgramMetaForm({
  programId,
  initialName,
  initialDescription,
}: {
  programId: string;
  initialName: string;
  initialDescription: string | null;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateProgramMeta(programId, { name, description });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label htmlFor="program-name">Plan name</Label>
        <Input
          id="program-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="program-description">Description (optional)</Label>
        <Input
          id="program-description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setSaved(false);
          }}
          className="mt-1"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" disabled={isPending} onClick={handleSave}>
          {isPending ? "Saving…" : "Save"}
        </Button>
        {saved && <span className="text-sm font-medium text-success">Saved</span>}
        {error && <span className="text-sm font-medium text-danger">{error}</span>}
      </div>
    </div>
  );
}
