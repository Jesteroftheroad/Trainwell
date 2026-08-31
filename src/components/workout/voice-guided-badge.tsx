import { Volume2 } from "lucide-react";

/** Every workout in the player is voice-narrated — this just surfaces that on the card. */
export function VoiceGuidedBadge() {
  return (
    <span className="inline-flex items-center" title="Voice-guided workout">
      <Volume2 className="size-3.5" aria-hidden />
      <span className="sr-only">Voice-guided</span>
    </span>
  );
}
