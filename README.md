# Quick Command Buttons

<p align="center">
  <strong>Customizable command buttons with intelligent grouping for VS Code status bar</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/VS%20Code-Extension-blue?style=for-the-badge&logo=visual-studio-code" alt="VS Code Extension">
  <img src="https://img.shields.io/badge/TypeScript-Powered-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
</p>

---

A powerful VS Code extension that adds customizable command buttons to your status bar with intelligent grouping capabilities. Perfect for developers who want quick access to frequently used commands without cluttering the status bar.

## Features

### Smart Status Bar Integration
- **Quick command access**: Execute frequently used commands with a single click
- **Space-efficient grouping**: Group related commands to save precious status bar space
- **Color customization**: Distinguish your buttons with custom colors

### Comprehensive Tree View
- **Visual overview**: See all your commands organized in a dedicated sidebar panel
- **Hierarchical display**: Navigate through individual commands and grouped commands
- **One-click execution**: Run any command directly from the tree view

### Intelligent Terminal Management
- **Dedicated terminals**: Each command type gets its own terminal instance
- **Custom terminal names**: Configure meaningful names for your terminal sessions
- **Smart reuse**: Efficiently manages terminal instances to avoid clutter

### Flexible Command Support
- **Terminal commands**: Execute shell commands, build scripts, git operations
- **VS Code API**: Run native VS Code commands and extensions
- **Mixed workflows**: Combine both types seamlessly in your button configuration

## Getting Started

1. **Install the extension** from VS Code Marketplace
2. **Configure your commands** in VS Code settings
3. **Access via status bar**: Click buttons for direct execution or group menus
4. **Use tree view**: Open "Quick Commands" panel for comprehensive management

## Configuration

Add commands to your VS Code settings (`settings.json`):

```json
{
  "quickCommandButtons.buttons": [
    {
      "name": "Build",
      "command": "npm run build",
      "color": "#4CAF50",
      "terminalName": "Build Process"
    },
    {
      "name": "Git Tools",
      "color": "#FF9800",
      "group": [
        {
          "name": "Status",
          "command": "git status",
          "shortcut": "s",
          "terminalName": "Git Status"
        },
        {
          "name": "Push",
          "command": "git push",
          "shortcut": "p",
          "terminalName": "Git Push"
        },
        {
          "name": "Pull",
          "command": "git pull",
          "shortcut": "l",
          "terminalName": "Git Pull"
        }
      ]
    },
    {
      "name": "Format",
      "command": "editor.action.formatDocument",
      "useVsCodeApi": true,
      "color": "#2196F3"
    }
  ]
}
```

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `name` | string | Button display name |
| `command` | string | Command to execute (required for single buttons) |
| `useVsCodeApi` | boolean | Execute as VS Code command instead of terminal command |
| `color` | string | Button color (hex, rgb, or CSS color names) |
| `terminalName` | string | Custom name for the terminal session |
| `group` | array | Array of sub-commands for grouped buttons |
| `shortcut` | string | Quick selection key for group items (single character) |

## Usage Patterns

### Individual Commands
Perfect for frequently used single commands like builds, tests, or formatting.

### Grouped Commands
Ideal for related commands like Git operations, Docker commands, or project-specific scripts.

### Mixed Workflows
Combine terminal commands (builds, tests) with VS Code API commands (formatting, extensions) seamlessly.

## Commands

| Command | Description |
|---------|-------------|
| `quickCommandButtons.refreshTree` | Refresh the tree view panel |
| `quickCommandButtons.executeFromTree` | Execute command from tree view |

## Tree View Actions

- **Command buttons**: Click to execute individual commands
- **Group expansion**: Expand/collapse grouped commands
- **Direct execution**: Run commands without opening status bar menus

## Use Cases

**Perfect for:**
- **Build automation**: Quick access to build, test, and deploy scripts
- **Git workflows**: Organized access to git commands with shortcuts
- **Development tools**: Format code, lint, and run project-specific commands
- **Docker operations**: Container management and deployment commands
- **Custom workflows**: Any combination of terminal and VS Code commands

## Technical Details

- **Lightweight**: Minimal performance impact on VS Code startup and operation
- **Terminal management**: Efficient reuse and naming of terminal instances
- **Configuration driven**: No hardcoded commands, fully customizable via settings
- **Cross-platform**: Works on Windows, macOS, and Linux

## Development

```bash
# Install dependencies
just deps

# Package extension
just package

# Publish to marketplace
just publish
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have feature requests:
- **Bug reports**: [GitHub Issues](https://github.com/KubrickCode/quick-command-buttons/issues)
- **Feature requests**: [GitHub Discussions](https://github.com/KubrickCode/quick-command-buttons/discussions)
- **Rate the extension**: Help others discover Quick Command Buttons by rating it on the marketplace

---

**Made with ❤️ by KubrickCode**

*Streamline your workflow, one button at a time!*
