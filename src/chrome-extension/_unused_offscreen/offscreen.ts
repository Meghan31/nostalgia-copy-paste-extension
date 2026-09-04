/**
 * Nostalgia offscreen document.
 *
 * Service workers can't touch the DOM, so this hidden, tab-less document is
 * the only place the extension can call navigator.clipboard.readText(). The
 * background script creates it on demand (only when the capture shortcut is
 * pressed), messages it to fetch the clipboard text, then closes it again.
 */

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message?.type !== 'nostalgia-read-clipboard') return undefined;

	navigator.clipboard
		.readText()
		.then((text) => sendResponse({ text }))
		.catch((err) => {
			console.error('Nostalgia offscreen: clipboard read failed', err);
			sendResponse({ text: '', error: String(err) });
		});

	return true; // keep the message channel open for the async response
});
