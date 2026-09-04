import { useEffect, useRef, useState } from 'react';
import { Copy, Trash2, Check, Search, X, Download, Upload, CheckSquare } from 'lucide-react';
import '../global.css';
import './options.scss';

interface Note {
	heading: string;
	text: string;
	id?: string;
	pinned?: boolean;
}

interface CopiedState {
	[key: string]: boolean;
}

const TITLE_LETTERS = ['N', 'O', 'S', 'T', 'A', 'L', 'G', 'I', 'A'];

// Generate a unique ID for notes (mirrors the popup's generator)
const generateId = (): string => {
	return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

// Build a key used to detect duplicate notes on import (same heading + text)
const duplicateKey = (heading: string | undefined, text: string): string =>
	`${(heading ?? '').trim().toLowerCase()}|${text.trim().toLowerCase()}`;

const Options = () => {
	const [notes, setNotes] = useState<Note[]>([]);
	const [theme, setTheme] = useState<'light' | 'dark'>('light');
	const [copiedStates, setCopiedStates] = useState<CopiedState>({});
	const [searchQuery, setSearchQuery] = useState('');

	// Selective export state
	const [selectionMode, setSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	// Import feedback
	const [importMessage, setImportMessage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		chrome.storage.local.get(['notes'], (result) => {
			const loaded: Note[] = result.notes ?? [];
			// Backfill IDs for any legacy notes so selection/copy/delete stay stable
			let needsResave = false;
			const withIds = loaded.map((note) => {
				if (note.id) return note;
				needsResave = true;
				return { ...note, id: generateId() };
			});
			setNotes(withIds);
			if (needsResave) {
				chrome.storage.local.set({ notes: withIds });
			}
		});
	}, []);

	useEffect(() => {
		chrome.storage.local.get(['theme'], (result) => {
			const savedTheme = result.theme || 'light';
			setTheme(savedTheme);
			document.documentElement.className = savedTheme === 'dark' ? 'dark-theme' : '';
		});
	}, []);

	// Auto-dismiss the import summary after a few seconds
	useEffect(() => {
		if (!importMessage) return;
		const timeout = setTimeout(() => setImportMessage(null), 6000);
		return () => clearTimeout(timeout);
	}, [importMessage]);

	const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light';
		setTheme(newTheme);
		document.documentElement.className = newTheme === 'dark' ? 'dark-theme' : '';
		chrome.storage.local.set({ theme: newTheme });
	};

	const copyToClipboard = (text: string, id: string) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setCopiedStates((prev) => ({ ...prev, [id]: true }));
				setTimeout(() => {
					setCopiedStates((prev) => ({ ...prev, [id]: false }));
				}, 1200);
			})
			.catch(() => alert('Failed to copy to clipboard'));
	};

	const deleteNote = (id: string) => {
		if (window.confirm('Are you sure you want to delete this note?')) {
			const updatedNotes = notes.filter((note) => note.id !== id);
			chrome.storage.local.set({ notes: updatedNotes }, () => {
				setNotes(updatedNotes);
				setSelectedIds((prev) => {
					if (!prev.has(id)) return prev;
					const next = new Set(prev);
					next.delete(id);
					return next;
				});
			});
		}
	};

	const exportNotesAsJson = (notesToExport: Note[], label: string) => {
		const data = JSON.stringify(notesToExport, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `nostalgia-notes-${label}-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const exportAll = () => exportNotesAsJson(notes, 'all');

	const exportSelected = () => {
		const selected = notes.filter((note) => note.id && selectedIds.has(note.id));
		exportNotesAsJson(selected, 'selected');
	};

	// Merge an imported list of notes into what's already saved, additively.
	// Existing notes are never removed; exact heading+text duplicates are skipped.
	const handleImportFile = (file: File) => {
		const reader = new FileReader();

		reader.onload = () => {
			let parsed: unknown;
			try {
				parsed = JSON.parse(String(reader.result));
			} catch {
				setImportMessage('Import failed: that file is not valid JSON.');
				return;
			}

			const incoming: unknown[] | null = Array.isArray(parsed)
				? parsed
				: Array.isArray((parsed as { notes?: unknown[] })?.notes)
					? (parsed as { notes: unknown[] }).notes
					: null;

			if (!incoming) {
				setImportMessage('Import failed: not a recognized Nostalgia notes export.');
				return;
			}

			const existingKeys = new Set(notes.map((note) => duplicateKey(note.heading, note.text)));
			const newNotes: Note[] = [];
			let skippedDuplicates = 0;
			let skippedInvalid = 0;

			incoming.forEach((raw) => {
				const candidate = raw as Partial<Note>;
				if (typeof candidate?.text !== 'string' || !candidate.text.trim()) {
					skippedInvalid += 1;
					return;
				}

				const note: Note = {
					id: generateId(),
					heading: (candidate.heading ?? '').trim() || 'No Heading',
					text: candidate.text.trim(),
					pinned: Boolean(candidate.pinned),
				};

				const key = duplicateKey(note.heading, note.text);
				if (existingKeys.has(key)) {
					skippedDuplicates += 1;
					return;
				}

				existingKeys.add(key);
				newNotes.push(note);
			});

			if (newNotes.length === 0) {
				setImportMessage(
					skippedDuplicates > 0
						? `Nothing new to import - all ${skippedDuplicates} note(s) already exist.`
						: 'No valid notes were found in that file.',
				);
				return;
			}

			const mergedNotes = [...notes, ...newNotes];
			chrome.storage.local.set({ notes: mergedNotes }, () => {
				if (chrome.runtime.lastError) {
					setImportMessage('Import failed: ' + chrome.runtime.lastError.message);
					return;
				}
				setNotes(mergedNotes);
				const parts = [`Imported ${newNotes.length} note${newNotes.length === 1 ? '' : 's'}`];
				if (skippedDuplicates > 0) {
					parts.push(`skipped ${skippedDuplicates} duplicate${skippedDuplicates === 1 ? '' : 's'}`);
				}
				if (skippedInvalid > 0) {
					parts.push(`skipped ${skippedInvalid} invalid entr${skippedInvalid === 1 ? 'y' : 'ies'}`);
				}
				setImportMessage(parts.join(' · ') + '.');
			});
		};

		reader.onerror = () => setImportMessage('Import failed: could not read that file.');
		reader.readAsText(file);
	};

	const toggleSelectionMode = () => {
		setSelectionMode((prev) => {
			const next = !prev;
			if (!next) setSelectedIds(new Set());
			return next;
		});
	};

	const toggleNoteSelected = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const filteredNotes = searchQuery.trim()
		? notes.filter(
				(n) =>
					n.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
					n.text.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: notes;

	const selectAllVisible = () => {
		setSelectedIds(new Set(filteredNotes.map((n) => n.id).filter((id): id is string => Boolean(id))));
	};

	const clearSelection = () => setSelectedIds(new Set());

	const pinnedCount = notes.filter((n) => n.pinned).length;

	return (
		<div className="options-page">
			{/* Header */}
			<header className="options-header">
				<div className="header-deco header-deco-1">⭐</div>
				<div className="header-deco header-deco-2">✨</div>
				<div className="header-deco header-deco-3">🌟</div>
				<div className="header-deco header-deco-4">💫</div>

				<div className="header-logo-wrap">
					<img src="public/192.png" alt="Nostalgia" className="header-logo" />
					<div className="logo-badge">{notes.length}</div>
				</div>

				<div className="header-text">
					<h1 className="options-title">
						{TITLE_LETTERS.map((letter, i) => (
							<span
								key={i}
								style={{ animationDelay: `${i * 0.09}s` }}
							>
								{letter}
							</span>
						))}
					</h1>
					<p className="options-subtitle">✏️ Your sketchbook clipboard, reimagined!</p>
				</div>

				<button
					className="theme-toggle-pill"
					onClick={toggleTheme}
					aria-label="Toggle theme"
				>
					{theme === 'light' ? '🌙 Dark' : '☀️ Light'}
				</button>
			</header>

			{/* Stats bar */}
			<div className="stats-bar">
				<div className="stat-chip stat-chip-yellow">
					<span className="stat-emoji">📝</span>
					<span className="stat-value">{notes.length}</span>
					<span className="stat-label">Total Notes</span>
				</div>
				<div className="stat-chip stat-chip-blue">
					<span className="stat-emoji">📌</span>
					<span className="stat-value">{pinnedCount}</span>
					<span className="stat-label">Pinned</span>
				</div>
				<div className="stat-chip stat-chip-green">
					<span className="stat-emoji">📦</span>
					<span className="stat-value">{notes.length - pinnedCount}</span>
					<span className="stat-label">Unpinned</span>
				</div>
			</div>

			{/* Content */}
			<main className="options-content">
				<div className="section-header">
					<div className="section-title-wrap">
						<span className="section-badge">📋</span>
						<h2 className="section-title">All Your Notes</h2>
					</div>
					<div className="section-actions">
						<button
							className="cartoon-btn download-btn"
							onClick={exportAll}
							disabled={notes.length === 0}
							title="Download all notes as JSON"
						>
							<Download size={14} strokeWidth={2.5} /> Export All
						</button>

						<button
							className="cartoon-btn import-btn"
							onClick={() => fileInputRef.current?.click()}
							title="Import notes from a JSON file - adds to what you already have, never wipes it"
						>
							<Upload size={14} strokeWidth={2.5} /> Import JSON
						</button>
						<input
							ref={fileInputRef}
							type="file"
							accept="application/json,.json"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleImportFile(file);
								e.target.value = '';
							}}
							style={{ display: 'none' }}
						/>

						<button
							className={`cartoon-btn select-toggle-btn ${selectionMode ? 'active' : ''}`}
							onClick={toggleSelectionMode}
							disabled={notes.length === 0}
							title="Select specific notes to share as JSON"
						>
							<CheckSquare size={14} strokeWidth={2.5} />{' '}
							{selectionMode ? 'Cancel Select' : 'Select Notes'}
						</button>

						<div className="search-wrap">
							<span className="search-icon">
								<Search size={14} strokeWidth={2.5} />
							</span>
							<input
								type="text"
								className="options-search"
								placeholder="Search notes..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							{searchQuery && (
								<button className="search-clear" onClick={() => setSearchQuery('')}>
									<X size={11} strokeWidth={3} />
								</button>
							)}
						</div>
					</div>

					{selectionMode && (
						<div className="selection-bar">
							<span className="selection-count">{selectedIds.size} selected</span>
							<button className="cartoon-btn" onClick={selectAllVisible}>
								Select All
							</button>
							<button className="cartoon-btn" onClick={clearSelection} disabled={selectedIds.size === 0}>
								Clear
							</button>
							<button
								className="cartoon-btn export-selected-btn"
								onClick={exportSelected}
								disabled={selectedIds.size === 0}
							>
								<Download size={14} strokeWidth={2.5} /> Export Selected ({selectedIds.size})
							</button>
						</div>
					)}

					{importMessage && (
						<div className="import-message">
							<span>{importMessage}</span>
							<button className="import-message-close" onClick={() => setImportMessage(null)}>
								<X size={12} strokeWidth={3} />
							</button>
						</div>
					)}
				</div>

				{filteredNotes.length > 0 ? (
					<div className="notes-grid">
						{filteredNotes.map((note, index) => {
							const noteId = note.id as string;
							const isSelected = selectedIds.has(noteId);
							const isCopied = !!copiedStates[noteId];
							return (
								<div
									key={noteId || index}
									className={`note-card ${note.pinned ? 'pinned' : ''} ${
										selectionMode ? 'selectable' : ''
									} ${isSelected ? 'selected' : ''}`}
								>
									{note.pinned ? (
										<div className="note-card-tack" />
									) : (
										<div className="note-card-tape" />
									)}
									{selectionMode && (
										<label className="note-select-checkbox" title="Select this note">
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => toggleNoteSelected(noteId)}
											/>
										</label>
									)}
									<div className="note-body">
										<h3 className="note-heading">{note.heading}</h3>
										<textarea
											className="note-text"
											rows={4}
											value={note.text}
											readOnly
										/>
										<div className="note-actions">
											<button
												className={`cartoon-btn copy-btn ${isCopied ? 'copied' : ''}`}
												onClick={() => copyToClipboard(note.text, noteId)}
											>
												{isCopied ? (
													<>
														<Check size={14} strokeWidth={2.5} /> Copied!
													</>
												) : (
													<>
														<Copy size={14} strokeWidth={2.5} /> Copy
													</>
												)}
											</button>
											<button
												className="cartoon-btn delete-btn"
												onClick={() => deleteNote(noteId)}
											>
												<Trash2 size={14} strokeWidth={2.5} /> Delete
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="empty-state">
						<div className="empty-emoji">🗒️</div>
						<h3 className="empty-title">
							{searchQuery ? 'No notes match your search!' : 'No notes yet!'}
						</h3>
						<p className="empty-sub">
							{searchQuery
								? 'Try a different search term 🔎'
								: "Create notes from the popup and they'll magically appear here! ✨"}
						</p>
					</div>
				)}
			</main>

			<footer className="options-footer">
				<p>Made with ❤️ &nbsp;·&nbsp; Nostalgia Extension &nbsp;·&nbsp; Your notes, your magic 🌟</p>
			</footer>
		</div>
	);
};

export default Options;
