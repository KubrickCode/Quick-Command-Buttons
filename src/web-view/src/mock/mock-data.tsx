import { type ButtonConfig } from "../types";

export const mockCommands: ButtonConfig[] = [
  {
    name: "Terminal",
    color: "#2196F3",
    command: "just terminal",
    terminalName: "Terminal",
    shortcut: "p",
  },
  {
    name: "$(git-branch) Git",
    shortcut: "g",
    color: "green",
    group: [
      {
        name: "Push",
        command: "git add . && git commit --amend --no-edit && git push -f",
        terminalName: "Forced Push",
        shortcut: "p",
      },
      {
        name: "Commit",
        command: "git add . && git commit --amend --no-edit",
        shortcut: "c",
      },
      {
        name: "Reset Soft",
        command: "git reset --soft HEAD~1",
        shortcut: "r",
      },
      {
        name: "Rebase 5",
        command: "git rebase -i HEAD~5",
        shortcut: "b",
      },
      {
        name: "Checkout main",
        command: "git checkout main",
        shortcut: "m",
      },
    ],
  },
];

export const mockRefreshButton = {
  icon: "$(refresh)",
  color: "gray",
  enabled: true,
};
