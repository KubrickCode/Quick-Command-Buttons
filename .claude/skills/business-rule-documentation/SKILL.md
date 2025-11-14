---
name: business-rule-documentation
description: |
  Provides standardized templates for documenting business logic and domain knowledge. Systematically captures domain overview, core concepts, business rules, process flows, decision trees, and terminology glossaries. Ensures comprehensive knowledge transfer through structured documentation following Domain-Driven Design principles. Maintains consistency between business requirements and technical implementation.
  Use when: documenting domain models and business logic, writing business rules and constraints, creating domain glossaries and ubiquitous language definitions, mapping process flows and workflows, documenting decision logic and validation rules, capturing stakeholder requirements, creating domain context diagrams, maintaining business rule repositories, or bridging communication between business and technical teams.
---

# Business Rule Documentation Guide

## Basic Principles

- Concise and clear
- With actionable examples
- Focus on the "why"

## Business Logic Documentation

**File:** `docs/domain/{domain-name}.md` or the module's `README.md`

### [Domain Name]

#### Overview

The business area covered by this domain (1-2 sentences)

#### Core Concepts

**[Concept Name]**

**Definition:** Clear definition

**Example:**

```typescript
// Actual usage example code
```

**Code Location:** `src/domain/concept.ts`

#### Business Rules

**[Rule Name]**

- **Content:** Rule description
- **Reason:** Why this rule is necessary
- **Exceptions (if any):** Exception scenarios
- **Code Location:** `src/domain/rules.ts:45-67`

#### Process Flow (Complex cases only)

**[Process Name]**

1. Step 1 → `src/service/step1.ts`
2. Step 2 → `src/service/step2.ts`
3. Step 3 → `src/service/step3.ts`

#### Cautions (if any)

- Common mistake areas
- Things to watch for when making changes

#### Glossary (if needed)

- **Term 1:** Definition
- **Term 2:** Definition

## Document Management

### Document Location

```
project-root/
├── docs/
│   ├── work/          # Work guidelines (delete after work completion)
│   └── domain/        # Business logic documentation (maintained continuously)
├── WORK_SUMMARY.md    # Work summary report (delete immediately after review)
└── README.md
```

### Lifecycle

- **Work Guidelines:** Delete after work completion
- **Work Summary Report:** Delete immediately after review
- **Business Logic Documentation:** Maintain alongside code
