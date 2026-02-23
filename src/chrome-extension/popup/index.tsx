import { useEffect, useRef, useState } from 'react';
import './popup.scss';

interface Note {
	heading: string;
	text: string;
	id: string; // Unique ID for each note
	pinned: boolean; // Pin state for keeping notes at top
	order: number; // Explicit ordering within pinned/unpinned sections
}

interface CopiedState {
	[key: string]: boolean;
}

export const Popup = () => {
	const [copiedTexts, setCopiedTexts] = useState<Note[]>([]);
	const [newHeading, setNewHeading] = useState('');
	const [newText, setNewText] = useState('');
	const [copiedStates, setCopiedStates] = useState<CopiedState>({});
	const [noteAdd, setNoteAdd] = useState('Add Note');
	const [redColor, setRedColor] = useState('black');
	const [isAddingNote, setIsAddingNote] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Drag and drop state
	const [draggedItem, setDraggedItem] = useState<string | null>(null);
	const [isDragEnabled, setIsDragEnabled] = useState(false);
	const [dragOverItem, setDragOverItem] = useState<string | null>(null);
	const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(
		null
	);

	// Theme state
	const [theme, setTheme] = useState<'light' | 'dark'>('light');

	// Ref for notes container (for FLIP animation)
	const notesContainerRef = useRef<HTMLDivElement>(null);

	// Use refs to store timeouts so they can be cleared
	const addNoteTimeoutRef = useRef<number | null>(null);
	const errorTimeoutRef = useRef<number | null>(null);
	const copyTimeoutsRef = useRef<{ [key: string]: number }>({});

	// Constants
	const MAX_TEXT_LENGTH = 5000; // Set a reasonable limit

	// Clean up timeouts on unmount
	useEffect(() => {
		return () => {
			if (addNoteTimeoutRef.current) {
				clearTimeout(addNoteTimeoutRef.current);
			}
			if (errorTimeoutRef.current) {
				clearTimeout(errorTimeoutRef.current);
			}
			Object.values(copyTimeoutsRef.current).forEach((timeout) => {
				clearTimeout(timeout);
			});
		};
	}, []);

	// Load saved notes when component mounts
	useEffect(() => {
		loadSavedNotes();
	}, []);

	// Load theme preference when component mounts
	useEffect(() => {
		chrome.storage.local.get(['theme'], (result) => {
			const savedTheme = result.theme || 'light';
			setTheme(savedTheme);
			document.documentElement.className =
				savedTheme === 'dark' ? 'dark-theme' : '';
		});
	}, []);

	// Generate a unique ID for notes
	const generateId = (): string => {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	};

	// Migrate notes to add pinned and order fields
	const migrateNotes = (notes: any[]): Note[] => {
		return notes.map((note, index) => ({
			...note,
			id: note.id || generateId(),
			pinned: note.pinned ?? false,
			order: note.order ?? index,
		}));
	};

	// Sort notes: pinned first, then unpinned
	const sortNotesByPin = (notes: Note[]): Note[] => {
		const pinned = notes.filter((n) => n.pinned).sort((a, b) => a.order - b.order);
		const unpinned = notes
			.filter((n) => !n.pinned)
			.sort((a, b) => a.order - b.order);

		return [...pinned, ...unpinned].map((note, index) => ({
			...note,
			order: index,
		}));
	};

	// Load notes from chrome.storage.local
	const loadSavedNotes = () => {
		chrome.storage.local.get(['notes'], (result) => {
			try {
				if (result.notes) {
					// Migrate notes to add pinned and order fields
					let migratedNotes = migrateNotes(result.notes);

					// Sort: pinned first, then unpinned
					const sortedNotes = sortNotesByPin(migratedNotes);

					setCopiedTexts(sortedNotes);

					// Update storage with migrated and sorted notes
					chrome.storage.local.set({ notes: sortedNotes });
				} else {
					// Set default example note if no saved notes exist
					const defaultNote: Note[] = [
						{
							heading: 'Example Heading',
							text: 'This is the Example text format',
							id: generateId(),
							pinned: false,
							order: 0,
						},
					];
					setCopiedTexts(defaultNote);
					chrome.storage.local.set({ notes: defaultNote });
				}
			} catch (err) {
				setError('Failed to load notes');
				console.error('Error loading notes:', err);
			}
		});
	};

	// Save notes to chrome.storage.local
	const saveNotes = (updatedNotes: Note[]) => {
		chrome.storage.local.set({ notes: updatedNotes }, () => {
			if (chrome.runtime.lastError) {
				setError('Failed to save notes: ' + chrome.runtime.lastError.message);
				console.error('Error saving notes:', chrome.runtime.lastError);
				return;
			}
			setCopiedTexts(updatedNotes);
			setError(null);
		});
	};

	const addNote = () => {
		// Prevent multiple rapid clicks
		if (isAddingNote) {
			return;
		}

		setIsAddingNote(true);

		// Validate text length
		if (newText.trim().length > MAX_TEXT_LENGTH) {
			setError(`Text is too long (max ${MAX_TEXT_LENGTH} characters)`);
			setRedColor('red');

			// Reset after timeout
			errorTimeoutRef.current = window.setTimeout(() => {
				setError(null);
				setRedColor('black');
				setIsAddingNote(false);
			}, 1500);
			return;
		}

		if (newText.trim()) {
			const newNote: Note = {
				heading: newHeading.trim() || 'No Heading',
				text: newText.trim(),
				id: generateId(),
				pinned: false,
				order: copiedTexts.length,
			};
			const updatedNotes = sortNotesByPin([...copiedTexts, newNote]);
			saveNotes(updatedNotes);
			setNoteAdd('Note Added!!! ⬇️');
			addNoteTimeoutRef.current = window.setTimeout(() => {
				setNoteAdd('Add Note');
				setIsAddingNote(false);
			}, 1000);
			setNewHeading('');
			setNewText('');
		} else {
			// Show error message without adding to notes
			setRedColor('red');
			const tempHeading = 'Please provide a heading!!!!!!';
			const tempText = 'Please provide a text!!!!!!(Mandatory)';

			// Just set the displayed values without adding a note
			setNewHeading(tempHeading);
			setNewText(tempText);

			errorTimeoutRef.current = window.setTimeout(() => {
				setNewHeading('');
				setNewText('');
				setRedColor('black');
				setIsAddingNote(false);
			}, 1000);
		}
	};

	const clearAll = () => {
		// Clear all notes
		if (window.confirm('Are you sure you want to delete all the notes?')) {
			chrome.storage.local.remove(['notes'], () => {
				if (chrome.runtime.lastError) {
					setError(
						'Failed to clear notes: ' + chrome.runtime.lastError.message
					);
					return;
				}
				setCopiedTexts([]);
				setError(null);
			});
		}
	};

	const deleteNote = (id: string) => {
		if (window.confirm('Are you sure you want to delete this note?')) {
			const updatedNotes = copiedTexts.filter((note) => note.id !== id);
			saveNotes(updatedNotes);
		}
	};

	const copyToClipboard = (text: string, id: string) => {
		// Clear any existing timeout for this ID
		if (copyTimeoutsRef.current[id]) {
			clearTimeout(copyTimeoutsRef.current[id]);
		}

		navigator.clipboard
			.writeText(text)
			.then(() => {
				// Update only the specific button state
				setCopiedStates((prev) => ({
					...prev,
					[id]: true,
				}));

				// Store and set timeout
				copyTimeoutsRef.current[id] = window.setTimeout(() => {
					setCopiedStates((prev) => ({
						...prev,
						[id]: false,
					}));
					// Clean up the timeout reference
					delete copyTimeoutsRef.current[id];
				}, 1000);
			})
			.catch((err) => {
				console.error('Failed to copy text: ', err);
				setError('Failed to copy to clipboard');

				// Clear error after a delay
				errorTimeoutRef.current = window.setTimeout(() => {
					setError(null);
				}, 1500);
			});
	};

	// Toggle drag functionality
	const toggleDragMode = (e: React.ChangeEvent<HTMLInputElement>) => {
		setIsDragEnabled(e.target.checked);

		// If turning off drag mode, clear any active drag
		if (!e.target.checked) {
			setDraggedItem(null);
		}
	};

	// Toggle theme
	const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light';
		setTheme(newTheme);
		document.documentElement.className =
			newTheme === 'dark' ? 'dark-theme' : '';
		chrome.storage.local.set({ theme: newTheme });
	};

	// Toggle pin on a note
	const togglePin = (id: string) => {
		const updatedNotes = copiedTexts.map((note) =>
			note.id === id ? { ...note, pinned: !note.pinned } : note
		);

		const sortedNotes = sortNotesByPin(updatedNotes);
		saveNotes(sortedNotes);
	};

	// Reorder notes with pin boundary protection
	const reorderNotes = (
		notes: Note[],
		draggedId: string,
		targetId: string,
		position: 'before' | 'after' | null
	): Note[] => {
		const draggedNote = notes.find((n) => n.id === draggedId);
		const targetNote = notes.find((n) => n.id === targetId);

		if (!draggedNote || !targetNote) return notes;

		// Prevent dragging across pin boundary
		if (draggedNote.pinned !== targetNote.pinned) {
			return notes;
		}

		const newNotes = notes.filter((n) => n.id !== draggedId);
		const targetIndex = newNotes.findIndex((n) => n.id === targetId);
		const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;

		newNotes.splice(insertIndex, 0, draggedNote);

		return newNotes.map((note, index) => ({ ...note, order: index }));
	};

	// Capture positions for FLIP animation
	const capturePositions = () => {
		const positions = new Map<string, DOMRect>();
		notesContainerRef.current
			?.querySelectorAll('[data-note-id]')
			.forEach((el) => {
				const id = el.getAttribute('data-note-id');
				if (id) positions.set(id, el.getBoundingClientRect());
			});
		return positions;
	};

	// Apply FLIP animation
	const animateReorder = (oldPositions: Map<string, DOMRect>) => {
		requestAnimationFrame(() => {
			notesContainerRef.current
				?.querySelectorAll('[data-note-id]')
				.forEach((el) => {
					const id = el.getAttribute('data-note-id');
					if (!id) return;

					const oldPos = oldPositions.get(id);
					const newPos = el.getBoundingClientRect();

					if (oldPos && oldPos.top !== newPos.top) {
						const deltaY = oldPos.top - newPos.top;

						// Invert
						(el as HTMLElement).style.transform = `translateY(${deltaY}px)`;
						(el as HTMLElement).style.transition = 'none';

						// Force reflow
						el.getBoundingClientRect();

						// Play
						(el as HTMLElement).style.transform = '';
						(el as HTMLElement).style.transition =
							'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
					}
				});
		});
	};

	// Reset drag state
	const resetDragState = () => {
		setDraggedItem(null);
		setDragOverItem(null);
		setDropPosition(null);
	};

	// Handle drag start - only works when drag is enabled
	const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
		if (!isDragEnabled) {
			e.preventDefault();
			return;
		}

		setDraggedItem(id);
		e.dataTransfer.effectAllowed = 'move';
	};

	// Handle drag end
	const handleDragEnd = () => {
		if (!isDragEnabled) {
			return;
		}

		resetDragState();
	};

	// Handle drag over
	const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
		if (!isDragEnabled || !draggedItem) return;

		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';

		// Calculate drop position based on mouse Y
		const rect = e.currentTarget.getBoundingClientRect();
		const mouseY = e.clientY;
		const threshold = rect.top + rect.height / 2;

		setDragOverItem(targetId);
		setDropPosition(mouseY < threshold ? 'before' : 'after');
	};

	// Handle drop
	const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
		if (!isDragEnabled) {
			return;
		}

		e.preventDefault();

		if (!draggedItem || draggedItem === targetId) {
			resetDragState();
			return;
		}

		// FLIP: Capture positions BEFORE state update
		const oldPositions = capturePositions();

		// Reorder with pin boundary protection
		const newNotes = reorderNotes(
			copiedTexts,
			draggedItem,
			targetId,
			dropPosition
		);

		// Update state (triggers re-render)
		saveNotes(newNotes);

		// FLIP: Animate AFTER re-render
		animateReorder(oldPositions);

		resetDragState();
	};

	// Split notes into pinned and unpinned
	const pinnedNotes = copiedTexts.filter((note) => note.pinned);
	const unpinnedNotes = copiedTexts.filter((note) => !note.pinned);

	return (
		<div className="popup-container">
			<div className="header">
				<div className="title">
					<div className="heading">
						<img src="public/48.png" alt="Nostalgia" className="icon" />
						<h1>Nostalgia</h1>
					</div>
					<div className="theme-toggle">
						<button
							onClick={toggleTheme}
							className="theme-toggle-btn"
							aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
						>
							<span className="theme-label">{theme}</span>
							<div className="toggle-switch">
								<div className="toggle-slider"></div>
							</div>
						</button>
					</div>
				</div>

				{error && <div className="error-message">{error}</div>}

				<br />
				<div className="sub-heading">
					<div className="pastehere">
						<h2>Paste here</h2>
						<button onClick={addNote} disabled={isAddingNote}>
							{noteAdd}
						</button>
					</div>
					<div className="paste-input">
						<input
							type="text"
							placeholder="Give a heading"
							value={newHeading}
							onChange={(e) => setNewHeading(e.target.value)}
							className={redColor === 'red' ? 'error' : ''}
							maxLength={100} // Reasonable limit for headings
						/>
						<textarea
							rows={3}
							placeholder="Enter text here"
							value={newText}
							onChange={(e) => setNewText(e.target.value)}
							className={redColor === 'red' ? 'error' : ''}
							maxLength={MAX_TEXT_LENGTH}
						/>
						{newText && (
							<div className="character-count">
								{newText.length}/{MAX_TEXT_LENGTH}
							</div>
						)}
					</div>
				</div>
				<br />
				<div className="sub-heading">
					<div className="sub-sub">
						<h2 className="pt-margin">Previous Texts</h2>
						<button onClick={clearAll}>Clear All</button>
					</div>
				</div>

				{copiedTexts.length > 0 ? (
					<div className="notes-container" ref={notesContainerRef}>
						<div className="drag-mode-toggle">
							<input
								type="checkbox"
								id="drag-mode"
								checked={isDragEnabled}
								onChange={toggleDragMode}
							/>
							<label htmlFor="drag-mode">
								{isDragEnabled
									? 'Drag mode enabled - Reorder by dragging'
									: 'Enable drag mode to reorder notes'}
							</label>
						</div>

						{/* Pinned Notes Section */}
						{pinnedNotes.length > 0 && (
							<>
								{pinnedNotes.map((note) => (
									<div
										key={note.id}
										data-note-id={note.id}
										className={`copied-text pinned ${
											draggedItem === note.id ? 'dragging' : ''
										} ${dragOverItem === note.id ? 'drag-over' : ''} ${
											dragOverItem === note.id && dropPosition === 'before'
												? 'drop-indicator-before'
												: ''
										} ${
											dragOverItem === note.id && dropPosition === 'after'
												? 'drop-indicator-after'
												: ''
										}`}
										draggable={isDragEnabled}
										onDragStart={(e) => handleDragStart(e, note.id)}
										onDragEnd={handleDragEnd}
										onDragOver={(e) => handleDragOver(e, note.id)}
										onDrop={(e) => handleDrop(e, note.id)}
									>
										<div className="copy-here">
											<span className="pin-icon" role="img" aria-label="Pinned">
												📌
											</span>
											<p>{note.heading}</p>
											<div className="button-group">
												<button
													onClick={() => togglePin(note.id)}
													className="pin-btn pinned"
													disabled={isDragEnabled}
													title="Unpin this note"
												>
													UNPIN
												</button>
												<button
													onClick={() => copyToClipboard(note.text, note.id)}
													className={`copy-btn ${
														copiedStates[note.id] ? 'copied' : ''
													}`}
												>
													{copiedStates[note.id] ? 'Copied!' : 'Copy'}
												</button>
												<button
													onClick={() => deleteNote(note.id)}
													className="delete-btn"
												>
													Delete
												</button>
											</div>
										</div>
										<div className="paste-input">
											<textarea rows={2} value={note.text} readOnly />
										</div>
									</div>
								))}

								{unpinnedNotes.length > 0 && (
									<div className="notes-section-divider">
										<span>Other Notes</span>
									</div>
								)}
							</>
						)}

						{/* Unpinned Notes Section */}
						{unpinnedNotes.map((note) => (
							<div
								key={note.id}
								data-note-id={note.id}
								className={`copied-text ${
									draggedItem === note.id ? 'dragging' : ''
								} ${dragOverItem === note.id ? 'drag-over' : ''} ${
									dragOverItem === note.id && dropPosition === 'before'
										? 'drop-indicator-before'
										: ''
								} ${
									dragOverItem === note.id && dropPosition === 'after'
										? 'drop-indicator-after'
										: ''
								}`}
								draggable={isDragEnabled}
								onDragStart={(e) => handleDragStart(e, note.id)}
								onDragEnd={handleDragEnd}
								onDragOver={(e) => handleDragOver(e, note.id)}
								onDrop={(e) => handleDrop(e, note.id)}
							>
								<div className="copy-here">
									<p>{note.heading}</p>
									<div className="button-group">
										<button
											onClick={() => togglePin(note.id)}
											className="pin-btn"
											disabled={isDragEnabled}
											title="Pin this note to the top"
										>
											PIN
										</button>
										<button
											onClick={() => copyToClipboard(note.text, note.id)}
											className={`copy-btn ${
												copiedStates[note.id] ? 'copied' : ''
											}`}
										>
											{copiedStates[note.id] ? 'Copied!' : 'Copy'}
										</button>
										<button
											onClick={() => deleteNote(note.id)}
											className="delete-btn"
										>
											Delete
										</button>
									</div>
								</div>
								<div className="paste-input">
									<textarea rows={2} value={note.text} readOnly />
								</div>
							</div>
						))}
					</div>
				) : (
					<p>No saved texts.</p>
				)}
			</div>
		</div>
	);
};
