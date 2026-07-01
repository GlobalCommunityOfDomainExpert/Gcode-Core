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
      className="fixed bottom-6 right-6 z-30 flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Icon icon={Sparkles} size="md" />
    </button>
  );
}
