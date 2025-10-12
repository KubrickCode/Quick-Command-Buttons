import { type ButtonConfig } from "../types";

export const mockCommands: ButtonConfig[] = [
  {
    color: "#4CAF50",
    command: "npm test",
    name: "$(testing-passed-icon) Test",
    shortcut: "t",
    terminalName: "Test Runner",
  },
  {
    color: "#00BCD4",
    command: "workbench.action.terminal.new",
    name: "$(terminal) Terminal",
    shortcut: "n",
    useVsCodeApi: true,
  },
  {
    color: "#FF9800",
    group: [
      {
        command: "git pull",
        name: "$(arrow-down) Pull",
        shortcut: "l",
      },
      {
        command: "git push",
        name: "$(arrow-up) Push",
        shortcut: "p",
      },
      {
        group: [
          {
            command: "git status",
            name: "$(git-commit) Status",
            shortcut: "s",
          },
          {
            command: "git diff",
            name: "$(diff) Diff",
            shortcut: "d",
          },
          {
            command: "git log --oneline -5",
            name: "$(history) Log",
            shortcut: "l",
          },
        ],
        name: "$(search) Check Status",
        shortcut: "c",
      },
    ],
    name: "$(git-branch) Git",
    shortcut: "g",
  },
];

export const mockRefreshButton = {
  color: "gray",
  enabled: true,
  icon: "$(refresh)",
};
