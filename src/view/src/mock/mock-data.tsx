import { type ButtonConfig } from "../types";

export const mockCommands: ButtonConfig[] = [
  {
    color: "#4CAF50",
    command: "npm test",
    id: "mock-test-command",
    name: "$(testing-passed-icon) Test",
    shortcut: "t",
    terminalName: "Test Runner",
  },
  {
    color: "#00BCD4",
    command: "workbench.action.terminal.new",
    id: "mock-terminal-command",
    name: "$(terminal) Terminal",
    shortcut: "n",
    useVsCodeApi: true,
  },
  {
    color: "#FF9800",
    group: [
      {
        command: "git pull",
        id: "mock-git-pull",
        name: "$(arrow-down) Pull",
        shortcut: "l",
      },
      {
        command: "git push",
        id: "mock-git-push",
        name: "$(arrow-up) Push",
        shortcut: "p",
      },
      {
        group: [
          {
            command: "git status",
            id: "mock-git-status",
            name: "$(git-commit) Status",
            shortcut: "s",
          },
          {
            command: "git diff",
            id: "mock-git-diff",
            name: "$(diff) Diff",
            shortcut: "d",
          },
          {
            command: "git log --oneline -5",
            id: "mock-git-log",
            name: "$(history) Log",
            shortcut: "l",
          },
        ],
        id: "mock-git-check-status",
        name: "$(search) Check Status",
        shortcut: "c",
      },
    ],
    id: "mock-git-group",
    name: "$(git-branch) Git",
    shortcut: "g",
  },
];

export const mockRefreshButton = {
  color: "gray",
  enabled: true,
  icon: "$(refresh)",
};
