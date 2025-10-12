# Deployment Pipeline Performance Investigation Context

## Problem Statement

The deployment pipeline has become significantly slow after adding images to the public folder (used in README). The affected operations include:

- `just package` - Building and packaging the extension
- `just install` (install-package) - Installing the packaged extension locally
- `just publish` - Publishing to VS Code Marketplace and Open VSX Registry

## Critical Finding: Public Folder NOT Excluded

**⚠️ MAJOR ISSUE IDENTIFIED**: The `/public` folder at the root level is NOT listed in `.vscodeignore`, meaning ALL images and files in this folder are being included in the VSIX package.

## Pipeline Architecture Overview

### 1. Package Command Flow (`just package`)

```
just package
├── clean-build (removes old build artifacts)
│   ├── rm -rf src/web-view/dist
│   ├── rm -rf src/extension/web-view-dist
│   └── rm -rf out
├── Build web-view
│   └── cd src/web-view && yarn build
│       └── tsc -b && vite build
├── Copy web-view dist
│   └── cp -r src/web-view/dist → src/extension/web-view-dist
├── Compile extension
│   └── cd src/extension && yarn compile
│       └── tsc -p ./
└── Package extension
    └── cd root && yarn package
        └── vsce package --out versions/
            └── Creates VSIX file including ALL non-ignored files
```

### 2. Install Command Flow (`just install-package`)

```
just install-package
└── cd root && yarn install-package
    └── code --install-extension versions/quick-command-buttons-$version.vsix
        └── VS Code extracts and installs the VSIX package
```

### 3. Publish Command Flow (`just publish`)

```
just publish [target]
├── VS Code Marketplace (if target = vsce or both)
│   └── yarn vsce-publish
│       └── vsce publish (uploads VSIX to marketplace)
└── Open VSX Registry (if target = ovsx or both)
    └── yarn ovsx-publish
        └── ovsx publish (uploads VSIX to registry)
```

## File Inclusion Analysis

### What Gets Included in VSIX Package

Based on `.vscodeignore` analysis:

**INCLUDED (Potential Performance Impact):**

- ✅ `/public/` folder - **NOT EXCLUDED, ALL IMAGES INCLUDED**
- ✅ `/versions/` folder - Previous VSIX files if present
- ✅ `/out/` folder - Compiled extension code
- ✅ `/src/extension/web-view-dist/` - Built web view assets
- ✅ `package.json`, `README.md`, `LICENSE`

**EXCLUDED (Properly Ignored):**

- ❌ Source TypeScript files
- ❌ Node modules from sub-projects
- ❌ Development configuration files
- ❌ Test files and coverage reports
- ❌ Git history and CI/CD configurations

## Performance Bottleneck Analysis

### 1. Image Files in Public Folder

- **Location**: `/public/` (root level)
- **Issue**: NOT in `.vscodeignore`, so ALL images are packaged
- **Impact**:
  - Increases VSIX file size dramatically
  - Slows down packaging process
  - Slows down upload to marketplaces
  - Slows down local installation

### 2. Packaging Process (`vsce package`)

The VSCE tool:

1. Reads all files not in `.vscodeignore`
2. Bundles them into a ZIP-like VSIX archive
3. Large images significantly slow this process

### 3. Publishing Process

- Large VSIX files take longer to upload to:
  - VS Code Marketplace
  - Open VSX Registry
- Network transfer time increases linearly with file size

### 4. Installation Process

- VS Code must extract larger VSIX files
- More disk I/O for larger packages
- Verification and installation take longer

## Dependency Chain Analysis

```
deps (install all dependencies)
├── deps-root (yarn install in root)
├── deps-extension (yarn install in src/extension)
└── deps-web-view (yarn install in src/web-view)

package (build everything)
├── Depends on: clean-build
├── Depends on: web-view build
├── Depends on: extension compile
└── Creates: versions/*.vsix

install-package
└── Depends on: package (VSIX must exist)

publish
└── Depends on: package (VSIX must exist)
```

## Specific Investigation Areas

### Immediate Actions Needed

1. **Check Public Folder Contents**

   ```bash
   ls -la /workspaces/quick-command-buttons/public/
   du -sh /workspaces/quick-command-buttons/public/
   find /workspaces/quick-command-buttons/public -type f -size +100k -exec ls -lh {} \;
   ```

2. **Measure VSIX File Size**

   ```bash
   ls -lh /workspaces/quick-command-buttons/versions/*.vsix
   ```

3. **Analyze VSIX Contents**
   ```bash
   # Extract and examine what's inside the VSIX
   cd /tmp && unzip -l /workspaces/quick-command-buttons/versions/*.vsix | head -50
   ```

### Root Cause Hypothesis

The `/public` folder containing images for the README is being included in the VSIX package because it's not listed in `.vscodeignore`. This causes:

1. Bloated VSIX file size
2. Slow packaging due to processing large image files
3. Slow uploads during publishing
4. Slow extraction during installation

### Recommended Solutions

#### Solution 1: Add public folder to .vscodeignore

Add to `.vscodeignore`:

```
# Public assets (not needed in extension)
public/
!public/logo.png  # Keep only the extension icon if needed
```

#### Solution 2: Move README images elsewhere

- Create a `docs/images/` folder for README images
- Update README to reference images from docs folder
- Add `docs/` to `.vscodeignore`

#### Solution 3: Use external image hosting

- Host README images on GitHub or CDN
- Reference them via URLs in README
- Remove large images from repository

### Performance Metrics to Collect

Before optimization:

```bash
# Time the package command
time just package

# Check VSIX size
ls -lh versions/*.vsix

# Time the install command
time just install-package

# Check what's in the VSIX
unzip -l versions/*.vsix | wc -l  # Count files
unzip -l versions/*.vsix | grep -E '\.(png|jpg|jpeg|gif|svg)' | wc -l  # Count images
```

After optimization:

- Re-run the same commands
- Compare file sizes and execution times

## Next Agent Actions

1. **Investigation Agent**:

   - Examine `/public` folder contents and sizes
   - Analyze current VSIX file size and contents
   - Time current operations for baseline

2. **Implementation Agent**:

   - Add appropriate entries to `.vscodeignore`
   - Potentially reorganize image assets
   - Test packaging after changes

3. **Validation Agent**:
   - Verify extension still works after optimization
   - Ensure README images still display correctly
   - Measure performance improvements

## Critical Configuration Files

- **/.vscodeignore** - Controls what gets packaged (MISSING /public exclusion)
- **/justfile** - Defines all build commands
- **/package.json** - Extension manifest and scripts
- **/src/extension/package.json** - Extension-specific build
- **/src/web-view/package.json** - Web view build configuration

## Summary

The root cause is almost certainly that the `/public` folder is not excluded in `.vscodeignore`, causing all images to be packaged into the VSIX file. This creates a cascading performance impact through the entire deployment pipeline: package → install → publish.

The solution is straightforward: exclude unnecessary files from the VSIX package by properly configuring `.vscodeignore`.
