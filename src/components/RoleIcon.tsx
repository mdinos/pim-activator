import {
  Globe,
  Database,
  HardDrive,
  KeyRound,
  Network,
  Server,
  BarChart2,
  Box,
  MessageSquare,
  type LucideProps,
} from 'lucide-react';
import type { FC } from 'react';

const iconMap: Record<string, FC<LucideProps>> = {
  Globe,
  Database,
  HardDrive,
  KeyRound,
  Network,
  Server,
  BarChart2,
  Box,
  MessageSquare,
};

interface Props {
  name: string;
  className?: string;
}

export default function RoleIcon({ name, className = 'w-5 h-5' }: Props) {
  const Icon = iconMap[name] ?? Globe;
  return <Icon className={className} aria-hidden="true" />;
}
