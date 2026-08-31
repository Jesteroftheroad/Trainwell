import Link from "next/link";
import { ClipboardList, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function WeeklySurveyCard() {
  return (
    <Link href="/progress">
      <Card className="transition-colors hover:bg-muted/60">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <ClipboardList className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Weekly check-in</p>
            <p className="truncate text-xs text-muted-foreground">
              Log your weight and measurements for this week
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
