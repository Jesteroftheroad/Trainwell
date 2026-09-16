import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { getCoachPrograms } from "@/lib/builder/queries";
import { NewProgramForm } from "@/components/builder/new-program-form";

export default async function BuilderPage() {
  const { userId, profile } = await getCurrentUserAndProfile();
  if (profile?.role !== "coach") redirect("/today");

  const programs = await getCoachPrograms(userId);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <h1 className="text-2xl font-black">Plan Builder</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Build named weekly plans from your workout library. Publish one so clients can pick it when they sign up.
      </p>

      <div className="mt-6">
        <NewProgramForm />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {programs.length === 0 && (
          <p className="text-sm text-muted-foreground">No plans yet — create your first one above.</p>
        )}
        {programs.map((program) => (
          <Link key={program.id} href={`/builder/${program.id}`}>
            <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-muted">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{program.name}</p>
                {program.description && (
                  <p className="truncate text-sm text-muted-foreground">{program.description}</p>
                )}
              </div>
              <Badge variant={program.isPublished ? "success" : "muted"}>
                {program.isPublished ? "Published" : "Draft"}
              </Badge>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
