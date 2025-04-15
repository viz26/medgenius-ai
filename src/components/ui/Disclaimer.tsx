import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface DisclaimerProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function Disclaimer({ className = '', variant = 'default' }: DisclaimerProps) {
  if (variant === 'compact') {
    return (
      <Alert className={`bg-yellow-50 border-yellow-200 ${className}`}>
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-sm text-yellow-800">
          MedGenius AI provides AI-generated medical insights. Always consult healthcare professionals for medical advice.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`bg-yellow-50 border-yellow-200 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800 font-medium">MedGenius AI Disclaimer</AlertTitle>
      <AlertDescription className="text-yellow-800 mt-2">
        <p>MedGenius AI is designed to assist with medical insights, education, and research.</p>
        <p className="mt-2">While we strive to provide accurate and helpful information, the results are AI-generated and may not always be fully reliable or personalized.</p>
        <p className="mt-2">Use this platform as a reference — not as a replacement for professional medical advice.</p>
        <p className="mt-2 font-medium">Always consult a qualified healthcare provider for diagnosis or treatment decisions.</p>
      </AlertDescription>
    </Alert>
  );
} 