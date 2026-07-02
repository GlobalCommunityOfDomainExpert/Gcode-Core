import { Sparkles } from "lucide-react";
import { Icon } from "@/components/atoms";

export interface AskAiButtonProps {
  onClick?: () => void;
}

export function AskAiButton({ onClick }: AskAiButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ask GCODE AI"
      title="Ask GCODE AI"
      className="bg-primary hover:bg-primary-hover focus-visible:ring-primary fixed right-6 bottom-6 z-30 flex size-12 items-center justify-center rounded-full text-white shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <Icon icon={Sparkles} size="md" />
    </button>
  );
}
