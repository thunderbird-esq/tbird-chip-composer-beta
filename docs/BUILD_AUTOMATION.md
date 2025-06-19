# Build Automation

This document describes the build process for the Thunderbird Chiptune Composer.

## Overview

The current build process is handled by a shell script, `build.sh`. This script prepares the application for deployment by copying necessary files into a `dist/` directory.

## Build Script (`build.sh`)

The `build.sh` script performs the following actions:

1.  **Creates `dist/` directory**: If it doesn't already exist, a `dist/` directory is created to store the build output.
    ```bash
    mkdir -p dist
    ```
2.  **Copies application files**: The script copies the following files and directories into the `dist/` directory:
    -   `index.html`
    -   `assets/` (recursively)
    -   `styles/` (recursively)
    -   `src/` (recursively)
    -   `config.json`
    ```bash
    cp index.html dist/
    cp -r assets dist/
    cp -r styles dist/
    cp -r src dist/
    cp config.json dist/
    ```

## Running the Build

To execute the build process, run the following command from the project root directory:

```bash
./build.sh
```

Upon completion, the `dist/` directory will contain the application files ready for deployment.

## Package Scripts (`package.json`)

The `package.json` file defines helper scripts for development and testing:

-   **`npm start`**:
    ```json
    "start": "http-server -p 8080"
    ```
    This script uses the `http-server` development server to serve the project locally on port 8080. This is primarily used for development and testing, not for creating a production build.

-   **`npm test`**:
    ```json
    "test": "node tests/unit/audio.test.js && node tests/unit/ui.test.js"
    ```
    This script executes the unit tests for the audio and UI modules.

## Future Enhancements

The `build.sh` script currently includes a note:
`"NOTE: Minification and SHA256 validation not yet implemented."`

Potential future enhancements to the build process include:

-   **Minification**: Minifying JavaScript, CSS, and HTML files to reduce their size and improve loading times.
-   **Asset Optimization**: Optimizing images and other assets.
-   **Code Linting and Transpilation**: Integrating linters (e.g., ESLint) and potentially transpilers (e.g., Babel) if newer JavaScript features are used.
-   **Dependency Bundling**: Using a module bundler like Webpack or Rollup to bundle JavaScript modules.
-   **Automated Testing**: Integrating the `npm test` script into the build process to ensure tests pass before a build is considered successful.
-   **SHA256 Validation**: Implementing checksum validation for file integrity.
-   **Environment-specific builds**: Creating different builds for development, staging, and production environments.

For details on project dependencies and development tools, refer to `package.json`.
