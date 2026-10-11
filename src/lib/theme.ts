import {
  Atom,
  BookOpen,
  Droplets,
  FlaskConical,
  Gem,
  Layers,
  LayoutGrid,
  Link2,
  Palette,
  TestTube,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import type { ModuleColor, ModuleIcon } from '../types/chemistry';

export interface ModuleTheme {
  /** Cor de fundo sólida. */
  bg: string;
  /** Cor da borda inferior (efeito 3D). */
  border: string;
  text: string;
  /** Fundo translúcido para superfícies suaves. */
  soft: string;
  ring: string;
  hex: string;
}

export const moduleThemes: Record<ModuleColor, ModuleTheme> = {
  green: { bg: 'bg-[#58cc02]', border: 'border-[#58a700]', text: 'text-[#58cc02]', soft: 'bg-[#58cc02]/15', ring: 'ring-[#58cc02]/40', hex: '#58cc02' },
  blue: { bg: 'bg-[#1cb0f6]', border: 'border-[#1899d6]', text: 'text-[#1cb0f6]', soft: 'bg-[#1cb0f6]/15', ring: 'ring-[#1cb0f6]/40', hex: '#1cb0f6' },
  purple: { bg: 'bg-[#ce82ff]', border: 'border-[#a568cc]', text: 'text-[#ce82ff]', soft: 'bg-[#ce82ff]/15', ring: 'ring-[#ce82ff]/40', hex: '#ce82ff' },
  orange: { bg: 'bg-[#ff9600]', border: 'border-[#cc7a00]', text: 'text-[#ff9600]', soft: 'bg-[#ff9600]/15', ring: 'ring-[#ff9600]/40', hex: '#ff9600' },
  pink: { bg: 'bg-[#ff86d0]', border: 'border-[#d66aae]', text: 'text-[#ff86d0]', soft: 'bg-[#ff86d0]/15', ring: 'ring-[#ff86d0]/40', hex: '#ff86d0' },
  teal: { bg: 'bg-[#00cd9c]', border: 'border-[#00a57d]', text: 'text-[#00cd9c]', soft: 'bg-[#00cd9c]/15', ring: 'ring-[#00cd9c]/40', hex: '#00cd9c' },
  indigo: { bg: 'bg-[#7c83fd]', border: 'border-[#5a61d6]', text: 'text-[#7c83fd]', soft: 'bg-[#7c83fd]/15', ring: 'ring-[#7c83fd]/40', hex: '#7c83fd' },
  sky: { bg: 'bg-[#2bc4e8]', border: 'border-[#1a9bbc]', text: 'text-[#2bc4e8]', soft: 'bg-[#2bc4e8]/15', ring: 'ring-[#2bc4e8]/40', hex: '#2bc4e8' },
  amber: { bg: 'bg-[#ffc800]', border: 'border-[#d9a800]', text: 'text-[#ffc800]', soft: 'bg-[#ffc800]/15', ring: 'ring-[#ffc800]/40', hex: '#ffc800' },
  rose: { bg: 'bg-[#ff6b8b]', border: 'border-[#d9506f]', text: 'text-[#ff6b8b]', soft: 'bg-[#ff6b8b]/15', ring: 'ring-[#ff6b8b]/40', hex: '#ff6b8b' },
  lime: { bg: 'bg-[#89e219]', border: 'border-[#6bb312]', text: 'text-[#89e219]', soft: 'bg-[#89e219]/15', ring: 'ring-[#89e219]/40', hex: '#89e219' },
};

export const moduleIcons: Record<ModuleIcon, LucideIcon> = {
  flask: FlaskConical,
  atom: Atom,
  layers: Layers,
  grid: LayoutGrid,
  link: Link2,
  droplet: Droplets,
  book: BookOpen,
  'test-tube': TestTube,
  gem: Gem,
  wind: Wind,
  palette: Palette,
};
