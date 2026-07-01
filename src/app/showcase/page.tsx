import { Bell, Search, Settings } from "lucide-react";
import {
  Avatar,
  Badge,
  Blurred,
  BookingRef,
  Button,
  Checkbox,
  Divider,
  Icon,
  Input,
  Label,
  Link,
  Progress,
  QrPlaceholder,
  Radio,
  SectionLabel,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Textarea,
  Tooltip,
  type BadgeTone,
  type BadgeVariant,
  type ButtonVariant,
} from "@/components/atoms";

const buttonVariants: ButtonVariant[] = [
  "primary",
  "secondary",
  "outline",
  "ghost",
  "accent",
  "success",
  "warning",
  "danger",
  "danger-ghost",
];

const badgeVariants: BadgeVariant[] = ["solid", "outline", "muted"];
const badgeTones: BadgeTone[] = ["neutral", "primary", "success", "warning", "danger"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-b border-border-light pb-8">
      <h2 className="text-heading font-extrabold text-text-primary">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function ShowcasePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header className="space-y-1">
        <p className="text-small font-semibold uppercase tracking-wide text-text-secondary">
          GCODE Design System
        </p>
        <h1 className="text-display font-extrabold text-text-primary">Atom Showcase</h1>
      </header>

      <Section title="Button">
        <div className="flex flex-wrap gap-2">
          {buttonVariants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="xs">XS</Button>
          <Button size="sm">SM</Button>
          <Button size="md">MD</Button>
          <Button size="lg">LG</Button>
          <Button size="xl">XL</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Input">
        <div className="flex max-w-sm flex-col gap-2">
          <Input placeholder="Small" size="sm" />
          <Input placeholder="Medium" size="md" />
          <Input placeholder="Large" size="lg" />
          <Input placeholder="Error state" error />
          <Input placeholder="Disabled" disabled />
        </div>
      </Section>

      <Section title="Textarea">
        <div className="flex max-w-sm flex-col gap-2">
          <Textarea placeholder="Default" variant="default" />
          <Textarea placeholder="Filled" variant="filled" />
          <Textarea placeholder="Outline" variant="outline" />
          <Textarea placeholder="Error state" error />
        </div>
      </Section>

      <Section title="Label">
        <div className="flex flex-wrap items-center gap-6">
          <Label htmlFor="label-demo">Default label</Label>
          <Label htmlFor="label-demo" required>
            Required label
          </Label>
          <Label htmlFor="label-demo" error>
            Error label
          </Label>
          <Label htmlFor="label-demo" disabled>
            Disabled label
          </Label>
        </div>
      </Section>

      <Section title="Badge">
        <div className="space-y-2">
          {badgeVariants.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-2">
              <span className="w-16 text-small text-text-secondary">{variant}</span>
              {badgeTones.map((tone) => (
                <Badge key={tone} variant={variant} tone={tone}>
                  {tone}
                </Badge>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Avatar">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar alt="Ada Lovelace" initials="AL" size="sm" />
          <Avatar alt="Ada Lovelace" initials="AL" size="md" />
          <Avatar alt="Ada Lovelace" initials="AL" size="lg" status="online" />
          <Avatar alt="Grace Hopper" initials="GH" variant="square" size="lg" status="away" />
        </div>
      </Section>

      <Section title="Checkbox & Radio">
        <div className="flex flex-wrap gap-6">
          <Checkbox id="cb-1" label="Unchecked" />
          <Checkbox id="cb-2" label="Checked" defaultChecked />
          <Checkbox id="cb-3" label="Disabled" disabled />
        </div>
        <div className="flex flex-wrap gap-6">
          <Radio id="r-1" name="radio-demo" label="Option A" defaultChecked />
          <Radio id="r-2" name="radio-demo" label="Option B" />
          <Radio id="r-3" name="radio-demo" label="Disabled" disabled />
        </div>
      </Section>

      <Section title="Switch">
        <div className="flex flex-wrap gap-6">
          <Switch id="sw-1" label="Unchecked" />
          <Switch id="sw-2" label="Checked" defaultChecked />
          <Switch id="sw-3" label="Disabled" disabled />
        </div>
      </Section>

      <Section title="Select">
        <Select className="max-w-sm" defaultValue="">
          <option value="" disabled>
            Choose an option
          </option>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Select>
      </Section>

      <Section title="Spinner">
        <div className="flex flex-wrap items-center gap-6 text-primary">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner variant="dots" size="md" />
        </div>
      </Section>

      <Section title="Progress">
        <div className="flex max-w-sm flex-col gap-3">
          <Progress value={30} />
          <Progress value={60} tone="success" />
          <Progress value={80} tone="warning" />
          <Progress value={95} tone="danger" />
        </div>
      </Section>

      <Section title="Skeleton">
        <div className="flex max-w-sm flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-10" variant="base" />
        </div>
      </Section>

      <Section title="Tooltip">
        <div className="flex gap-6 py-6">
          <Tooltip content="Saves your changes">
            <Button variant="secondary">Hover me</Button>
          </Tooltip>
          <Tooltip content="Bottom placement" position="bottom">
            <Button variant="secondary">Bottom</Button>
          </Tooltip>
        </div>
      </Section>

      <Section title="Divider">
        <Divider />
        <div className="flex h-8 items-center gap-4">
          <span className="text-small text-text-secondary">Left</span>
          <Divider orientation="vertical" />
          <span className="text-small text-text-secondary">Right</span>
        </div>
      </Section>

      <Section title="Link">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="#">Primary link</Link>
          <Link href="#" variant="secondary">
            Secondary link
          </Link>
          <Link href="#" size="sm">
            Small link
          </Link>
        </div>
      </Section>

      <Section title="Icon">
        <div className="flex flex-wrap items-center gap-4 text-text-primary">
          <Icon icon={Search} size="sm" label="Search" />
          <Icon icon={Bell} size="md" label="Notifications" />
          <Icon icon={Settings} size="lg" label="Settings" />
        </div>
      </Section>

      <Section title="Section Label">
        <SectionLabel>Event Details</SectionLabel>
      </Section>

      <Section title="Booking Ref">
        <BookingRef>GCODE-2026-48291</BookingRef>
      </Section>

      <Section title="QR Placeholder">
        <div className="flex flex-wrap gap-4">
          <QrPlaceholder />
          <QrPlaceholder loading />
        </div>
      </Section>

      <Section title="Blurred">
        <p className="text-body text-text-primary">
          Attendee: <Blurred label="Attendee name hidden">Shashwat Singh</Blurred>
        </p>
      </Section>
    </main>
  );
}
