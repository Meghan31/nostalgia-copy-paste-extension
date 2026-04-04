import { useEffect, useState } from 'react';
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

const CARD_COLORS = [
	'#FFE066',
	'#FF9F9F',
	'#A8E6CF',
	'#FFD3B6',
	'#C9B8FF',
	'#B8E4FF',
	'#FFB8D9',
	'#D4F1A0',
];

const TITLE_LETTERS = ['N', 'O', 'S', 'T', 'A', 'L', 'G', 'I', 'A'];

const Options = () => {
	const [notes, setNotes] = useState<Note[]>([]);
	const [theme, setTheme] = useState<'light' | 'dark'>('light');
	const [copiedStates, setCopiedStates] = useState<CopiedState>({});
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		chrome.storage.local.get(['notes'], (result) => {
			setNotes(result.notes ?? []);
		});
	}, []);

	useEffect(() => {
		chrome.storage.local.get(['theme'], (result) => {
			const savedTheme = result.theme || 'light';
			setTheme(savedTheme);
			document.documentElement.className = savedTheme === 'dark' ? 'dark-theme' : '';
		});
	}, []);

	const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light';
		setTheme(newTheme);
		document.documentElement.className = newTheme === 'dark' ? 'dark-theme' : '';
		chrome.storage.local.set({ theme: newTheme });
	};

	const copyToClipboard = (text: string, index: number) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setCopiedStates((prev) => ({ ...prev, [index]: true }));
				setTimeout(() => {
					setCopiedStates((prev) => ({ ...prev, [index]: false }));
				}, 1200);
			})
			.catch(() => alert('Failed to copy to clipboard'));
	};

	const deleteNote = (index: number) => {
		if (window.confirm('Are you sure you want to delete this note?')) {
			const updatedNotes = notes.filter((_, i) => i !== index);
			chrome.storage.local.set({ notes: updatedNotes }, () => setNotes(updatedNotes));
		}
	};

	const downloadAsJson = () => {
		const data = JSON.stringify(notes, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `nostalgia-notes-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const filteredNotes = searchQuery.trim()
		? notes.filter(
				(n) =>
					n.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
					n.text.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: notes;

	const pinnedCount = notes.filter((n) => n.pinned).length;

	return (
		<div className="options-page">
			{/* Decorative background blobs */}
			<div className="blob blob-1" />
			<div className="blob blob-2" />
			<div className="blob blob-3" />

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
					<p className="options-subtitle">✏️ Your cartoon clipboard, reimagined!</p>
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
							onClick={downloadAsJson}
							disabled={notes.length === 0}
							title="Download all notes as JSON"
						>
							⬇️ Export JSON
						</button>
						<div className="search-wrap">
							<span className="search-icon">🔍</span>
							<input
								type="text"
								className="options-search"
								placeholder="Search notes..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							{searchQuery && (
								<button className="search-clear" onClick={() => setSearchQuery('')}>
									✕
								</button>
							)}
						</div>
					</div>
				</div>

				{filteredNotes.length > 0 ? (
					<div className="notes-grid">
						{filteredNotes.map((note, index) => (
							<div
								key={note.id || index}
								className={`note-card note-color-${index % 8}`}
								style={
									{
										'--card-color': CARD_COLORS[index % CARD_COLORS.length],
									} as React.CSSProperties
								}
							>
								<div className="note-card-top" />
								<div className="note-card-tape" />
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
											className={`cartoon-btn copy-btn ${copiedStates[index] ? 'copied' : ''}`}
											onClick={() => copyToClipboard(note.text, index)}
										>
											{copiedStates[index] ? '✅ Copied!' : '📋 Copy'}
										</button>
										<button
											className="cartoon-btn delete-btn"
											onClick={() => deleteNote(index)}
										>
											🗑️ Delete
										</button>
									</div>
								</div>
							</div>
						))}
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
