import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type VerificationLevel = 'none' | 'wallet' | 'signature' | 'worldid';

interface VerifiedBadgeProps {
  level: VerificationLevel;
  className?: string;
  showText?: boolean;
}

const verificationConfig = {
  none: {
    icon: User,
    text: "Unverified",
    variant: "outline" as const,
    color: "text-gray-500"
  },
  wallet: {
    icon: Wallet,
    text: "Wallet Connected",
    variant: "outline" as const,
    color: "text-blue-600"
  },
  signature: {
    icon: CheckCircle,
    text: "Signature Verified",
    variant: "silver" as const,
    color: "text-green-600"
  },
  worldid: {
    icon: Shield,
    text: "World ID Verified",
    variant: "gold" as const,
    color: "text-purple-600"
  }
};

export function VerifiedBadge({ level, className, showText = true }: VerifiedBadgeProps) {
  const config = verificationConfig[level];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {showText && config.text}
    </Badge>
  );
}

// Helper function to get verification level from review data
export function getVerificationLevelFromReview(review: any): VerificationLevel {
  if (review.worldIdVerified) return 'worldid';
  if (review.signatureVerified) return 'signature';
  if (review.walletAddress) return 'wallet';
  return 'none';
}

// Helper function to get verification score (for trust calculations)
export function getVerificationScore(level: VerificationLevel): number {
  switch (level) {
    case 'worldid': return 1.0;
    case 'signature': return 0.8;
    case 'wallet': return 0.6;
    case 'none': return 0.3;
    default: return 0.3;
  }
}