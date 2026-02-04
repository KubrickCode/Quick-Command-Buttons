---
name: ui-ux-improve
description: Research UI/UX improvements with trend analysis and generate actionable recommendations. Use when you need comprehensive UI/UX analysis and improvement suggestions.
context: fork
agent: general-purpose
---

# UI/UX Improvement Research Command

## User Input

```text
$ARGUMENTS
```

Parse user input for:

- **Focus Area**: Specific component, page, or feature to improve (optional)
- **Mode**: `research` (default) or `implement` (immediate action)
- **Scope**: `full` (entire app) or `targeted` (specific area)

If empty, analyze entire application with research mode.

---

## Overview

This command combines AI-powered UI/UX analysis with real-time trend research to generate actionable improvement recommendations.

### Key Features

- 🎨 **UI/UX Designer Agent**: Specialized analysis via ui-ux-designer agent
- 🛠️ **Tech Stack Advisor Agent**: Library/framework recommendations via tech-stack-advisor agent
- 🔍 **Trend Research**: Web search for current UI/UX trends
- 📊 **Gap Analysis**: Compare current state vs best practices
- 📝 **Actionable Report**: Generate improvement roadmap in markdown
- 🚀 **Optional Implementation**: Execute improvements on demand

---

## Execution Steps

### 1. Context Gathering

#### Analyze Project Structure

**Detect Frontend Framework**:

- Check `package.json` for: React, Next.js, Vue, Svelte, Angular
- Identify styling approach: Tailwind, CSS Modules, styled-components, CSS-in-JS
- Find component library: shadcn/ui, MUI, Chakra, Radix

**Explore UI Components**:

- Use Glob to find component files (`**/*.tsx`, `**/components/**/*`)
- Identify layout components (Header, Footer, Sidebar, Navigation)
- Map page structure and routing

**Analyze Current Design System**:

- Color palette (CSS variables, theme config)
- Typography (fonts, sizes, weights)
- Spacing and layout patterns
- Component consistency

### 2. Invoke UI/UX Designer Agent

**REQUIRED**: Use Task tool with `subagent_type: "ui-ux-designer"` to perform:

- User experience evaluation
- Accessibility assessment (WCAG guidelines)
- Information architecture review
- Component usability analysis
- Mobile responsiveness check

### 3. Invoke Tech Stack Advisor Agent

**REQUIRED**: Use Task tool with `subagent_type: "tech-stack-advisor"` when:

- Recommending new UI component libraries
- Evaluating animation/interaction libraries
- Comparing styling solutions
- Suggesting accessibility tooling
- Recommending state management for UI

### 4. Trend Research (Web Search)

**Search Queries** (use WebSearch tool):

1. `"UI/UX trends 2025" best practices`
2. `"{framework} UI design patterns 2025"`
3. `"modern web design trends" accessibility`
4. `"{component type} UX best practices"` (if specific focus area)
5. `"best {library type} library 2025"`

**Information to Gather**:

- Current design trends (micro-interactions, glassmorphism, etc.)
- Accessibility improvements
- Performance optimization patterns
- User engagement techniques
- Mobile-first strategies
- Emerging UI libraries and tools
- Bundle size optimization techniques

### 5. Gap Analysis

**Compare and Identify**:

- Current design vs trend recommendations
- Missing accessibility features
- Outdated patterns to modernize
- Quick wins vs major refactors
- Priority based on impact/effort ratio
- Library/tool upgrades or additions needed

### 6. Generate Report

**Create**: `UI-UX-IMPROVEMENTS.md` at project root

---

## Key Rules

### ✅ MUST DO

- **Always invoke ui-ux-designer agent** for expert analysis
- **Always invoke tech-stack-advisor agent** for library/tool recommendations
- **Perform web search** for current trends and library comparisons
- **Analyze actual project code** (not assumptions)
- **Provide specific file paths** in recommendations
- **Include effort estimates** for each recommendation
- **Evaluate bundle size impact** for library recommendations
- **Generate report at project root** (`UI-UX-IMPROVEMENTS.md`)
- **Consider accessibility** in all recommendations
- **Prioritize by impact/effort ratio**

### ❌ NEVER DO

- Skip ui-ux-designer or tech-stack-advisor agent invocation
- Make recommendations without code analysis
- Suggest breaking changes without migration path
- Ignore mobile/responsive considerations
- Recommend trends that conflict with project constraints
- Implement without user confirmation (in implement mode)
- Generate vague or non-actionable recommendations
- Recommend libraries without bundle size consideration
- Suggest libraries with poor stability scores (<6/10)

### 🎯 Quality Standards

Each recommendation must include:

1. **Clear Problem Statement**: What's wrong and why it matters
2. **Specific Solution**: How to fix with code examples if applicable
3. **User Impact**: How it improves user experience
4. **Effort Estimate**: Implementation complexity (Low/Medium/High)
5. **File References**: Which files need changes

---

## Completion Report

After execution, provide summary:

```markdown
## UI/UX Improvement Research Complete

### 📊 Analysis Summary

- **Components Analyzed**: {X}
- **Pages Reviewed**: {Y}
- **Trends Researched**: {Z}
- **Libraries Evaluated**: {W}

### 🎯 Recommendations

- **Critical**: {N}
- **High**: {M}
- **Medium**: {K}

### 📄 Generated Report

`UI-UX-IMPROVEMENTS.md` created at project root.

### Next Steps

{Based on mode}:

- **Research mode**: Review recommendations and run with `implement` to proceed
- **Implement mode**: {X} improvements applied, {Y} remaining
```

---

## Execute

Start the UI/UX improvement research following the guidelines above.
