/**
 * Icon Map — Maps icon name strings from ContentSection items to Lucide React components
 * Used by CMS-driven pages to render dynamic icons
 */

import {
  Shield,
  Droplets,
  Flame,
  Bug,
  Wrench,
  TreePine,
  Award,
  Clock,
  ThumbsUp,
  Eye,
  Target,
  Heart,
  Zap,
  Users,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Star,
  ArrowRight,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Shield,
  Droplets,
  Flame,
  Bug,
  Wrench,
  TreePine,
  Award,
  Clock,
  ThumbsUp,
  Eye,
  Target,
  Heart,
  Zap,
  Users,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Star,
  ArrowRight,
};

export function getIcon(name: string | undefined | null): LucideIcon {
  if (!name) return Shield;
  return iconMap[name] || Shield;
}

export default iconMap;
