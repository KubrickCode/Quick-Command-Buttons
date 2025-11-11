---
name: work-summary-documentation
description: |
  Standard template for work summary report. Systematically document completion content, changed files, testing method, precautions, and follow-up tasks.
  TRIGGER: Work completion report, work summary, change documentation, testing method documentation, work result report
---

# Work Summary Documentation Guide

## Basic Principles

- Concise and clear
- With actionable examples
- Focus on the "why"

## Work Summary Report

**File:** `WORK_SUMMARY.md` (project root, delete after review)

### Completed Content

- [x] Task 1
- [x] Task 2
- [ ] Pending: Reason

### Changed Files

**Added**

- `src/new/file.ts`: Description

**Modified**

- `src/existing.ts:45`: What changed

**Deleted** (if any)

- `src/old/file.ts`: Reason for deletion

### Testing Method

**Describe specific feature testing method**

**Edge Cases to Check (if any)**

- Case 1: Expected behavior
- Case 2: Expected behavior

**Precautions (if any)**

- Add environment variable: `KEY=value`
- Install dependencies: `npm install`
- Migration: `npm run migrate`

**Follow-up Tasks (if any)**

- TODO: Specific content
