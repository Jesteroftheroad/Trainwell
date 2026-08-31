import { CalendarDays, LineChart, MessageCircle, Sun } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/workouts", label: "Workouts", icon: CalendarDays },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/chat", label: "Chat", icon: MessageCircle },
] as const;
