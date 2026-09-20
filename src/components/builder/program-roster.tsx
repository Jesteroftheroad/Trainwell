import { Badge } from "@/components/ui/badge";
import type { RosterEntry } from "@/lib/builder/queries";

export function ProgramRoster({ roster }: { roster: RosterEntry[] }) {
  if (roster.length === 0) {
    return <p className="text-sm text-muted-foreground">No one has picked this plan yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {roster.map((entry) => (
        <div key={entry.userId} className="flex items-center justify-between rounded-xl border border-border p-3">
          <span className="font-bold">{entry.fullName ?? "Unnamed athlete"}</span>
          <Badge variant={entry.status === "active" ? "success" : "muted"}>
            {entry.status === "active" ? "Active" : "Pending"}
          </Badge>
        </div>
      ))}
    </div>
  );
}
