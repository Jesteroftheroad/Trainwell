import { getCurrentUserAndProfile } from "@/lib/profile/queries";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const { profile } = await getCurrentUserAndProfile();

  return (
    <OnboardingForm
      initialName={profile?.full_name ?? ""}
      initialGoal={profile?.goal_text ?? ""}
    />
  );
}
