# Nostalgia - Copy-Paste Note Saver

---
---

<div align="center">
  <img src="https://github.com/user-attachments/assets/e3cfd590-c757-42d8-b483-559227e2d623" alt="icon" width="300"/>
</div>

---
---

Nostalgia is a browser extension designed to simplify your workflow by saving and managing important copied texts. This project was created to address the limitation on macOS, where previously copied texts cannot be retrieved as they are overwritten in the clipboard. Nostalgia solves this by providing a platform to save and reuse copied texts at your convenience.

## Features

- **Save Important Copied Texts:** Easily save the texts you copy for later use.
- **Clipboard Integration:** Copy texts back to the clipboard with a single click.
- **Text Management:** Add, view, and delete notes as needed.
- **Persistent Storage:** Saved notes are securely stored using `chrome.storage.local`.
- **Responsive Interface:** A user-friendly interface designed for ease of use.
- **Clear All Functionality:** Quickly clear all saved notes if required.

## Why I Made This Project

On Windows, the clipboard manager allows users to view previously copied texts. However, macOS lacks this functionality, which can be inconvenient for users needing to reuse multiple copied texts. Nostalgia was created to bridge this gap, allowing users to save and manage their copied texts directly in a browser extension.

## How It Works

### Popup Page
- Add a new note with a heading and text.
- View, copy, or delete previously saved notes.
- Clear all notes with a single click.

### Options Page
- View all saved notes in a tiles-based layout.
- Copy text back to the clipboard or delete notes directly.

## Technologies Used

- **React**: For building the user interface.
- **TypeScript**: For strong typing and improved code quality.
- **SCSS**: For styling the components.
- **Chrome Storage API**: For persisting notes locally in the browser.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Meghan31/nostalgia-copy-paste-extension.git
   cd nostalgia-copy-paste-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" using the toggle in the top-right corner.
   - Click "Load unpacked" and select the `dist` directory from this project.

## Usage

1. Install the extension in Chrome using the steps above.
2. Open the extension from the browser toolbar.
3. Use the popup to add new notes or view and manage existing ones.
4. Access the options page to view and manage all saved notes in a comprehensive layout.


Feel free to customize it further if needed!
