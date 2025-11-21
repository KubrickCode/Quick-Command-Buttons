/**
 * Parses VS Code icon syntax from a string and provides icon rendering.
 *
 * VS Code status bar supports icon syntax like `$(icon-name)` or `$(icon-name~spin)`.
 * Uses @vscode/codicons for actual icon rendering.
 *
 * @example
 * parseVSCodeIconName("$(terminal) Test") // { displayText: "Test", iconName: "terminal" }
 * parseVSCodeIconName("$(gear~spin) Loading") // { displayText: "Loading", iconName: "gear", spin: true }
 */

type ParseResult = {
  displayText: string;
  iconName: string | undefined;
  spin: boolean;
};

const VSCODE_ICON_PATTERN = /^\$\(([^)]+)\)\s*/;

export const parseVSCodeIconName = (text: string): ParseResult => {
  const match = text.match(VSCODE_ICON_PATTERN);

  if (match) {
    const rawIconName = match[1];
    const spin = rawIconName.includes("~spin");
    const iconName = rawIconName.replace("~spin", "");

    return {
      displayText: text.slice(match[0].length).trim() || iconName,
      iconName,
      spin,
    };
  }

  return {
    displayText: text,
    iconName: undefined,
    spin: false,
  };
};

type VSCodeIconProps = {
  className?: string;
  name: string;
  spin?: boolean;
};

export const VSCodeIcon = ({ className, name, spin }: VSCodeIconProps) => (
  <i
    aria-hidden="true"
    className={`codicon codicon-${name}${spin ? " codicon-spin" : ""}${className ? ` ${className}` : ""}`}
  />
);
