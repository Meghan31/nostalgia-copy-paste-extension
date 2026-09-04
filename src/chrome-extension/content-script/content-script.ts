/**
 * Nostalgia content script.
 *
 * Shows a small "Save to Nostalgia" bubble next to whatever text you select
 * on a page. Everything it draws lives inside a Shadow DOM so it can never
 * be styled by (and never leaks style into) the host page, and it disappears
 * the moment you click away, scroll, or press Escape - there is nothing
 * left on screen once you're not actively using it.
 */

let bubbleEnabled = true;

chrome.storage.local.get(['floatingBubbleEnabled'], (result) => {
	bubbleEnabled = result.floatingBubbleEnabled !== false;
});

chrome.storage.onChanged.addListener((changes, area) => {
	if (area === 'local' && changes.floatingBubbleEnabled) {
		bubbleEnabled = changes.floatingBubbleEnabled.newValue !== false;
		if (!bubbleEnabled) hideBubble();
	}
});

const BUBBLE_CSS = `
	.nostalgia-bubble {
		all: initial;
		position: fixed;
		display: none;
		align-items: center;
		gap: 6px;
		top: 0;
		left: 0;
		padding: 6px 12px;
		background: #2d2d2d;
		color: #fdfbf7;
		border: none;
		border-radius: 8px;
		font: 600 12.5px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		cursor: pointer;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
		opacity: 0;
		pointer-events: none;
		transform: translateY(4px);
		transition: opacity 0.12s ease, transform 0.12s ease;
	}
	.nostalgia-bubble.visible {
		display: flex;
		opacity: 1;
		pointer-events: auto;
		transform: translateY(0);
	}
	.nostalgia-bubble:hover {
		background: #ff4d4d;
	}
`;

let shadowHost: HTMLDivElement | null = null;
let bubbleButton: HTMLButtonElement | null = null;
let lastSelectedText = '';
let saveTimeout: number | undefined;

function ensureBubble(): void {
	if (shadowHost) return;

	shadowHost = document.createElement('div');
	shadowHost.style.cssText =
		'all: initial; position: fixed; top: 0; left: 0; width: 0; height: 0; overflow: visible; z-index: 2147483647; pointer-events: none;';

	const root = shadowHost.attachShadow({ mode: 'open' });

	const style = document.createElement('style');
	style.textContent = BUBBLE_CSS;
	root.appendChild(style);

	bubbleButton = document.createElement('button');
	bubbleButton.type = 'button';
	bubbleButton.className = 'nostalgia-bubble';
	bubbleButton.textContent = '\u{1F4BE} Save to Nostalgia';
	bubbleButton.addEventListener('mousedown', (e) => e.preventDefault()); // don't collapse the selection
	bubbleButton.addEventListener('click', onBubbleClick);
	root.appendChild(bubbleButton);

	document.documentElement.appendChild(shadowHost);
}

function showBubble(rect: DOMRect, text: string): void {
	if (!bubbleEnabled) return;
	ensureBubble();
	if (!bubbleButton) return;

	lastSelectedText = text;
	bubbleButton.textContent = '\u{1F4BE} Save to Nostalgia';

	const top = Math.max(8, rect.top - 40);
	const left = Math.min(Math.max(8, rect.right - 90), window.innerWidth - 190);

	bubbleButton.style.top = `${top}px`;
	bubbleButton.style.left = `${left}px`;
	bubbleButton.classList.add('visible');
}

function hideBubble(): void {
	bubbleButton?.classList.remove('visible');
}

function onBubbleClick(): void {
	if (!lastSelectedText || !bubbleButton) return;
	bubbleButton.textContent = 'Saved ✓';

	chrome.runtime.sendMessage({ type: 'nostalgia-save-text', text: lastSelectedText }, () => {
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = window.setTimeout(hideBubble, 500);
	});
}

function handleSelection(): void {
	if (!bubbleEnabled) return;

	const selection = window.getSelection();
	const text = selection ? selection.toString().trim() : '';

	if (!selection || !text || selection.rangeCount === 0) {
		hideBubble();
		return;
	}

	const rect = selection.getRangeAt(0).getBoundingClientRect();
	if (rect.width === 0 && rect.height === 0) {
		hideBubble();
		return;
	}

	showBubble(rect, text);
}

document.addEventListener('mouseup', () => window.setTimeout(handleSelection, 0));
document.addEventListener('keyup', (e) => {
	if (e.shiftKey || e.key.startsWith('Arrow')) {
		window.setTimeout(handleSelection, 0);
	}
});
document.addEventListener('mousedown', (e) => {
	if (shadowHost && !shadowHost.contains(e.target as Node)) {
		hideBubble();
	}
});
document.addEventListener('scroll', hideBubble, true);
window.addEventListener('resize', hideBubble);
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') hideBubble();
});

// ---- Clipboard read for the background script's keyboard shortcut ----
//
// The background service worker can't read the clipboard itself, and an
// offscreen document is never focused (Clipboard.readText() requires
// focus). This page's own document *is* focused when the shortcut fires,
// so the background script asks this content script to do the read and
// relays the result back.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message?.type !== 'nostalgia-read-clipboard') return undefined;

	navigator.clipboard
		.readText()
		.then((text) => sendResponse({ text }))
		.catch((err) => {
			console.error('Nostalgia content script: clipboard read failed', err);
			sendResponse({ text: '', error: String(err) });
		});

	return true; // keep the message channel open for the async response
});
