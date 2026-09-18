"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ExerciseLibraryItem } from "@/lib/builder/queries";

export function ExerciseLibraryList({ exercises }: { exercises: ExerciseLibraryItem[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? exercises.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.category.toLowerCase().includes(q) ||
          ex.primaryMuscles.some((m) => m.includes(q)),
      )
    : exercises;

  return (
    <div>
      <Input placeholder="Search exercises…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="mt-4 flex flex-col gap-2">
        {filtered.map((ex) => (
          <Link key={ex.id} href={`/builder/exercises/${ex.id}`}>
            <Card className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-muted">
              <div className="min-w-0">
                <p className="font-bold">{ex.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {ex.category} · {ex.primaryMuscles.join(", ")}
                </p>
              </div>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No exercises found.</p>}
      </div>
    </div>
  );
}
