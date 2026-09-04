/**
 * Nostalgia background service worker.
 *
 * Handles the three capture paths that don't go through the popup UI:
 *  - the right-click "Save selection to Nostalgia" context menu
 *  - the Cmd+Shift+U / Ctrl+Shift+E keyboard shortcut, which asks the
 *    content script in the active tab to read the clipboard (service
 *    workers have no DOM/clipboard access, and an offscreen document
 *    can't either - it never has focus, which Clipboard.readText()
 *    requires) and saves it
 *  - messages from the content script's floating "Save to Nostalgia" bubble
 *
 * All three end up here so there's exactly one place that writes notes to
 * storage outside of the popup/options pages.
 */

interface Note {
	heading: string;
	text: string;
	id: string;
	pinned: boolean;
	order: number;
}

const CONTEXT_MENU_ID = 'nostalgia-save-selection';

const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2);

// Saves a note the same way the popup does: pinned notes stay on top, the
// new note lands at the front of the unpinned section. Existing notes are
// never touched.
function saveNewNote(heading: string, rawText: string): Promise<Note> {
	return new Promise((resolve, reject) => {
		const text = rawText.trim();
		if (!text) {
			reject(new Error('Cannot save an empty note'));
			return;
		}

		chrome.storage.local.get(['notes'], (result) => {
			const stored: Array<Partial<Note>> = result.notes ?? [];
			const existing: Note[] = stored.map((note, index) => ({
				heading: note.heading ?? 'No Heading',
				text: note.text ?? '',
				id: note.id ?? generateId(),
				pinned: note.pinned ?? false,
				order: note.order ?? index,
			}));

			const newNote: Note = {
				heading: heading.trim() || 'No Heading',
				text,
				id: generateId(),
				pinned: false,
				order: 0,
			};

			const pinned = existing.filter((n) => n.pinned).sort((a, b) => a.order - b.order);
			const unpinned = existing.filter((n) => !n.pinned).sort((a, b) => a.order - b.order);
			const merged = [...pinned, newNote, ...unpinned].map((n, index) => ({ ...n, order: index }));

			chrome.storage.local.set({ notes: merged }, () => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
					return;
				}
				resolve(newNote);
			});
		});
	});
}

// Briefly flashes a badge on the toolbar icon so background saves get some
// feedback without ever putting anything on the page itself.
let badgeTimeout: ReturnType<typeof setTimeout> | undefined;
function flashBadge(text = '✓', color = '#2f8f5b'): void {
	chrome.action.setBadgeBackgroundColor({ color });
	chrome.action.setBadgeText({ text });
	if (badgeTimeout) clearTimeout(badgeTimeout);
	badgeTimeout = setTimeout(() => chrome.action.setBadgeText({ text: '' }), 1500);
}

// ---- Right-click context menu ----

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: CONTEXT_MENU_ID,
		title: 'Save selection to Nostalgia',
		contexts: ['selection'],
	});
});

chrome.contextMenus.onClicked.addListener((info) => {
	if (info.menuItemId !== CONTEXT_MENU_ID || !info.selectionText) return;
	saveNewNote('No Heading', info.selectionText)
		.then(() => flashBadge())
		.catch((err) => {
			console.error('Nostalgia: failed to save selection', err);
			flashBadge('!', '#ff4d4d');
		});
});

// ---- Keyboard shortcut: read the clipboard and save it ----
//
// An offscreen document can never call navigator.clipboard.readText() -
// Chromium throws "NotAllowedError: Document is not focused" because a
// headless offscreen document is by definition never focused, and that
// requirement isn't waived by the clipboardRead permission. The active
// tab's own document *is* focused when the shortcut is pressed (commands
// only fire while the browser itself is frontmost), so we ask its content
// script to do the read instead.

chrome.commands.onCommand.addListener(async (command) => {
	if (command !== 'add_note') return;

	try {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (!tab?.id) {
			console.error('Nostalgia: no active tab to read the clipboard from');
			flashBadge('!', '#ff4d4d');
			return;
		}

		let response: { text?: string; error?: string } | undefined;
		try {
			response = await chrome.tabs.sendMessage(tab.id, { type: 'nostalgia-read-clipboard' });
		} catch (err) {
			// Happens on chrome://, the Web Store, or a tab that loaded before
			// the extension did - there's no content script listening there.
			console.error('Nostalgia: could not reach this page to read the clipboard -', err);
			flashBadge('!', '#ff4d4d');
			return;
		}

		// Distinguish "clipboard read actually failed" (red badge - a real
		// problem, logged in full above/below) from "clipboard just has no
		// text in it right now" (amber badge - not an error, nothing to save).
		if (response?.error) {
			console.error('Nostalgia: clipboard read failed -', response.error);
			flashBadge('!', '#ff4d4d');
			return;
		}

		const text = typeof response?.text === 'string' ? response.text.trim() : '';
		if (!text) {
			console.warn('Nostalgia: clipboard had no text to save');
			flashBadge('∅', '#c99b1f');
			return;
		}

		await saveNewNote('No Heading', text);
		flashBadge();
	} catch (err) {
		console.error('Nostalgia: clipboard capture failed -', err);
		flashBadge('!', '#ff4d4d');
	}
});

// ---- Messages from the content script's floating bubble ----

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message?.type !== 'nostalgia-save-text' || typeof message.text !== 'string') {
		return undefined;
	}

	saveNewNote('No Heading', message.text)
		.then(() => {
			flashBadge();
			sendResponse({ ok: true });
		})
		.catch((err) => {
			console.error('Nostalgia: failed to save from page selection', err);
			sendResponse({ ok: false });
		});

	return true; // keep the message channel open for the async response
});
