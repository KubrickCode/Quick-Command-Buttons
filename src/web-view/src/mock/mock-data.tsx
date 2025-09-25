import { type ButtonConfig } from "../types";

export const mockCommands: ButtonConfig[] = [
  {
    name: "$(testing-passed-icon) Test",
    command: "npm test",
    color: "#4CAF50",
    shortcut: "t",
    terminalName: "Test Runner"
  },
  {
    name: "$(terminal) Terminal",
    command: "workbench.action.terminal.new",
    useVsCodeApi: true,
    color: "#00BCD4",
    shortcut: "n"
  },
  {
    name: "$(git-branch) Git",
    color: "#FF9800",
    shortcut: "g",
    group: [
      {
        name: "$(arrow-down) Pull",
        command: "git pull",
        shortcut: "l"
      },
      {
        name: "$(arrow-up) Push",
        command: "git push",
        shortcut: "p"
      },
      {
        name: "$(search) Check Status",
        shortcut: "c",
        group: [
          {
            name: "$(git-commit) Status",
            command: "git status",
            shortcut: "s"
          },
          {
            name: "$(diff) Diff",
            command: "git diff",
            shortcut: "d"
          },
          {
            name: "$(history) Log",
            command: "git log --oneline -5",
            shortcut: "l"
          }
        ]
      }
    ]
  }
];

export const mockRefreshButton = {
  icon: "$(refresh)",
  color: "gray",
  enabled: true,
};
