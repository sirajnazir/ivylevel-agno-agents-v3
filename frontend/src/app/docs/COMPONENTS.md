# IvyLevel Component Guide

**Version:** MVP 1.0.3
**Last Updated:** January 21, 2026 @ 20:15 PST

---

## Component Hierarchy

```
/components/
├── frames/              # Assessment frames
│   ├── Frame0.tsx       # Entry frame
│   ├── Frame1.tsx       # Personal info
│   ├── Frame2.tsx       # Academic interests
│   ├── Frame3.tsx       # Activities
│   ├── Frame4.tsx       # Goals
│   ├── Frame5.tsx       # Superpowers
│   └── Frame6.tsx       # Results
├── dashboard/           # Dashboard tabs
│   ├── OverviewTab.tsx
│   ├── AssessmentTab.tsx
│   ├── GamePlanTab.tsx
│   ├── ExecutionTab.tsx
│   └── MultiAgentTab.tsx
├── ui/                  # shadcn/ui primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
└── shared/              # Shared components
    ├── Header.tsx
    ├── Sidebar.tsx
    └── AgentChat.tsx
```

---

## UI Primitives (shadcn/ui)

We use [shadcn/ui](https://ui.shadcn.com/) for base components.

### Available Components

| Component | Import |
|-----------|--------|
| Button | `@/components/ui/button` |
| Card | `@/components/ui/card` |
| Input | `@/components/ui/input` |
| Select | `@/components/ui/select` |
| Dialog | `@/components/ui/dialog` |
| Tabs | `@/components/ui/tabs` |
| Badge | `@/components/ui/badge` |
| Progress | `@/components/ui/progress` |

### Usage Example

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export function MyComponent() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardContent>
        <Button variant="default">Click me</Button>
      </CardContent>
    </Card>
  )
}
```

---

## Brand Styling

### Colors (Use BRAND_COLORS)

```tsx
import { BRAND_COLORS } from '@/lib/constants/brand'

// In component styles
<div style={{
  color: BRAND_COLORS.textHeading,      // #641432
  backgroundColor: BRAND_COLORS.bgPrimary
}}>
```

### DO NOT Use Dark Mode Classes

These are **wrong** for Frame components:
- ❌ `text-text-primary` (white text)
- ❌ `bg-background-primary` (dark background)

Use brand constants instead:
- ✅ `style={{ color: BRAND_COLORS.textHeading }}`

---

## Dashboard Tab Components

### OverviewTab

Shows student profile summary, recent activity, quick stats.

### AssessmentTab

Displays assessment completion status, allows re-taking frames.

### GamePlanTab

Shows 4-year strategic plan, project cards, timeline view.

### ExecutionTab

Weekly planning interface with:
- EDS (Execution Distress Score)
- Weekly plan cards
- Task management
- Jenny chat

### MultiAgentTab

6-card layout for different agent conversations:
- Assessment Agent
- Game Plan Agent
- Awards Agent
- Programs Agent
- EC Agent
- Execution Agent

---

## Agent Chat Component

```tsx
import { AgentChat } from '@/components/shared/AgentChat'

<AgentChat
  agentType="execution"
  profileId={profileId}
  onMessage={(msg) => console.log(msg)}
/>
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| agentType | string | Agent to chat with |
| profileId | string | Current profile |
| conversationId | string? | Resume conversation |
| onMessage | function | Message callback |

---

## Creating New Components

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Hooks: `useCamelCase.ts`

### Component Template

```tsx
'use client'

import { useState } from 'react'
import { BRAND_COLORS } from '@/lib/constants/brand'

interface MyComponentProps {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState(false)

  return (
    <div style={{ color: BRAND_COLORS.textPrimary }}>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  )
}
```

### Export from Index

```tsx
// components/myfeature/index.ts
export { MyComponent } from './MyComponent'
```
