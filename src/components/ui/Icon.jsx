import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Atom,
  Ban,
  Blocks,
  Boxes,
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Code2,
  CodeXml,
  Copy,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  FileUp,
  Gauge,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  Hexagon,
  Inbox,
  Info,
  Key,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Menu,
  MonitorSmartphone,
  Moon,
  Network,
  Paintbrush,
  Palette,
  PenTool,
  Play,
  QrCode,
  RefreshCw,
  Rocket,
  Route,
  Search,
  Send,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  SquareTerminal,
  Star,
  Sun,
  TableProperties,
  Terminal,
  TestTube2,
  Timer,
  Triangle,
  UserCog,
  Users,
  Wind,
  Workflow,
  X,
  Zap,
  // Admin / Control-Center icons
  Activity,
  Bell,
  Command,
  Edit3,
  Filter,
  Globe,
  GripVertical,
  Image,
  KeySquare,
  MessageSquare,
  MoreHorizontal,
  PanelLeft,
  PieChart,
  Plus,
  Save,
  Settings,
  TrendingUp,
  Trash2,
  Unplug,
  Upload,
} from 'lucide-react'

import { SiPython, SiFlask, SiGithub } from 'react-icons/si';
/**
 * Icon registry.
 *
 * Data files reference icons by token so they stay free of React imports, and
 * every icon in the UI resolves through this one map.
 *
 * Technologies use semantic icons rather than brand logos — a wall of logos is
 * the thing this portfolio is deliberately not.
 */
const registry = {
  // Technologies
  react: Atom,
  javascript: Braces,
  html: CodeXml,
  css: Paintbrush,
  tailwind: Wind,
  framer: Zap,
  nodejs: Hexagon,
  express: Route,
  rest: Network,
  sqlite: Database,
  sql: TableProperties,
  dbdesign: Blocks,
  vercel: Triangle,
  vscode: SquareTerminal,
  git: GitBranch,
  python: SiPython,
  flask: SiFlask,

  // Security
  jwt: KeyRound,
  bcrypt: Lock,
  rbac: UserCog,
  csrf: ShieldAlert,
  ratelimit: Gauge,

  // Concepts & sections
  monitor: MonitorSmartphone,
  server: Server,
  database: Database,
  network: Network,
  shield: Shield,
  shieldCheck: ShieldCheck,
  key: Key,
  workflow: Workflow,
  terminal: Terminal,
  rocket: Rocket,
  code: Code2,
  penTool: PenTool,
  lightbulb: Lightbulb,
  testTube: TestTube2,
  search: Search,
  clipboard: ClipboardList,
  dashboard: LayoutDashboard,
  smartphone: Smartphone,
  users: Users,
  palette: Palette,
  qrCode: QrCode,
  fileUp: FileUp,
  timer: Timer,
  layers: Layers,
  boxes: Boxes,
  zap: Zap,
  sparkles: Sparkles,
  checkCircle: CheckCircle2,

  // Interface chrome
  menu: Menu,
  close: X,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  arrowUpRight: ArrowUpRight,
  external: ExternalLink,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  copy: Copy,
  check: Check,
  sun: Sun,
  moon: Moon,
  mail: Mail,
  resume: FileText,
  download: Download,
  eye: Eye,
  send: Send,
  location: MapPin,
  star: Star,
  fork: GitFork,
  commit: GitCommitHorizontal,
  clock: Clock,
  spinner: Loader2,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  empty: Inbox,
  blocked: Ban,
  retry: RefreshCw,
  play: Play,

  // Admin / Control-Center
  activity: Activity,
  bell: Bell,
  command: Command,
  edit: Edit3,
  filter: Filter,
  github: SiGithub,
  globe: Globe,
  drag: GripVertical,
  image: Image,
  keySquare: KeySquare,
  message: MessageSquare,
  more: MoreHorizontal,
  panelLeft: PanelLeft,
  chart: PieChart,
  plus: Plus,
  save: Save,
  settings: Settings,
  trends: TrendingUp,
  trash: Trash2,
  unplug: Unplug,
  upload: Upload,
}

/**
 * Resolves an icon token to a component.
 *
 * Returns a neutral fallback rather than throwing, so a typo in a data file
 * degrades to a visible placeholder instead of a blank screen.
 */
export function getIcon(token) {
  return registry[token] ?? Boxes
}

/**
 * Renders a registered icon.
 *
 * Decorative by default (`aria-hidden`); pass a `label` to expose it to
 * assistive technology.
 */
export function Icon({ name, label, className = 'size-4', strokeWidth = 1.75, ...rest }) {
  const Component = getIcon(name)

  return (
    <Component
      className={className}
      strokeWidth={strokeWidth}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      {...rest}
    />
  )
}

export default Icon
