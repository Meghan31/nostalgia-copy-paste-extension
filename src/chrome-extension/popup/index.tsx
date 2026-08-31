import { useEffect, useRef, useState } from 'react';
import { Pin, Copy, Trash2, Check, Sun, Moon, X, Pencil } from 'lucide-react';
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

const BIG_NOTE_TEXT_THRESHOLD = 220;

interface NoteCardProps {
	note: Note;
	isPinned: boolean;
	isDraggable: boolean;
	isDragging: boolean;
	isCopied: boolean;
	isDragOver: boolean;
	dropPosition: 'before' | 'after' | null;
	isEditing: boolean;
	editHeading: string;
	editText: string;
	onEditHeadingChange: (value: string) => void;
	onEditTextChange: (value: string) => void;
	onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
	onDragEnd: () => void;
	onDragOver: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
	onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
	onTogglePin: (id: string) => void;
	onCopy: (text: string, id: string) => void;
	onDelete: (id: string) => void;
	onStartEdit: (note: Note) => void;
	onSaveEdit: (id: string) => void;
	onCancelEdit: () => void;
}

const NoteCard = ({
	note,
	isPinned,
	isDraggable,
	isDragging,
	isCopied,
	isDragOver,
	dropPosition,
	isEditing,
	editHeading,
	editText,
	onEditHeadingChange,
	onEditTextChange,
	onDragStart,
	onDragEnd,
	onDragOver,
	onDrop,
	onTogglePin,
	onCopy,
	onDelete,
	onStartEdit,
	onSaveEdit,
	onCancelEdit,
}: NoteCardProps) => {
	return (
		<div
			key={note.id}
			data-note-id={note.id}
			className={`copied-text ${isPinned ? 'pinned' : ''} ${
				isDragging ? 'dragging' : ''
			} ${isCopied ? 'copy-blink' : ''} ${isDragOver ? 'drag-over' : ''} ${
				isDragOver && dropPosition === 'before' ? 'drop-indicator-before' : ''
			} ${isDragOver && dropPosition === 'after' ? 'drop-indicator-after' : ''}`}
			draggable={isDraggable && !isEditing}
			onDragStart={(e) => onDragStart(e, note.id)}
			onDragEnd={onDragEnd}
			onDragOver={(e) => onDragOver(e, note.id)}
			onDrop={(e) => onDrop(e, note.id)}
		>
			<div className="copy-here">
				{isEditing ? (
					<input
						type="text"
						className="edit-heading-input"
						placeholder="Give a heading"
						value={editHeading}
						onChange={(e) => onEditHeadingChange(e.target.value)}
						autoFocus
					/>
				) : (
					<p>{note.heading}</p>
				)}
				<div className="button-group">
					{isEditing ? (
						<>
							<button
								onClick={() => onSaveEdit(note.id)}
								className="save-btn"
								title="Save changes"
							>
								<Check size={13} strokeWidth={2.5} className="icon-svg" />
							</button>
							<button
								onClick={onCancelEdit}
								className="cancel-btn"
								title="Cancel editing"
							>
								<X size={13} strokeWidth={2.5} className="icon-svg" />
							</button>
						</>
					) : (
						<>
							<button
								onClick={() => onTogglePin(note.id)}
								className={`pin-btn ${isPinned ? 'pinned' : ''}`}
								disabled={isDraggable}
								title={isPinned ? 'Unpin this note' : 'Pin this note to the top'}
							>
								<Pin size={13} strokeWidth={2.5} className="icon-svg" />
							</button>
							<button
								onClick={() => onStartEdit(note)}
								className="edit-btn"
								disabled={isDraggable}
								title="Edit this note"
							>
								<Pencil size={13} strokeWidth={2.5} className="icon-svg" />
							</button>
							<button
								onClick={() => onCopy(note.text, note.id)}
								className={`copy-btn ${isCopied ? 'copied' : ''}`}
								title="Copy note"
							>
								{isCopied ? (
									<Check size={13} strokeWidth={2.5} className="icon-svg" />
								) : (
									<Copy size={13} strokeWidth={2.5} className="icon-svg" />
								)}
							</button>
							<button
								onClick={() => onDelete(note.id)}
								className="delete-btn"
								title="Delete note"
							>
								<Trash2 size={13} strokeWidth={2.5} className="icon-svg" />
							</button>
						</>
					)}
				</div>
			</div>
			<div className="paste-input">
				{isEditing ? (
					<textarea
						rows={3}
						value={editText}
						onChange={(e) => onEditTextChange(e.target.value)}
						className="edit-text-area"
						style={{ resize: 'vertical' }}
					/>
				) : (
					<textarea
						rows={2}
						value={note.text}
						readOnly
						className={note.text.length > BIG_NOTE_TEXT_THRESHOLD ? 'big-text' : ''}
						style={{ resize: 'vertical' }}
					/>
				)}
			</div>
			{!isEditing && (
				<div className="note-footer">
					<span className="note-char-count">{note.text.length} chars</span>
				</div>
			)}
		</div>
	);
};

export const Popup = () => {
	const [copiedTexts, setCopiedTexts] = useState<Note[]>([]);
	const [newHeading, setNewHeading] = useState('');
	const [newText, setNewText] = useState('');
	const [copiedStates, setCopiedStates] = useState<CopiedState>({});
	const [noteAdd, setNoteAdd] = useState('Add Note');
	const [redColor, setRedColor] = useState('black');
	const [isAddingNote, setIsAddingNote] = useState(false);
	const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
	const [isSearchSectionOpen, setIsSearchSectionOpen] = useState(false);
	const [isDragSectionOpen, setIsDragSectionOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Drag and drop state
	const [draggedItem, setDraggedItem] = useState<string | null>(null);
	const [dragOverItem, setDragOverItem] = useState<string | null>(null);
	const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(
		null,
	);

	// Editing state
	const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
	const [editHeading, setEditHeading] = useState('');
	const [editText, setEditText] = useState('');

	// Theme state
	const [theme, setTheme] = useState<'light' | 'dark'>('light');

	// Search state
	const [searchQuery, setSearchQuery] = useState('');

	// Ref for notes container (for FLIP animation)
	const notesContainerRef = useRef<HTMLDivElement>(null);

	// Use refs to store timeouts so they can be cleared
	const addNoteTimeoutRef = useRef<number | null>(null);
	const errorTimeoutRef = useRef<number | null>(null);
	const copyTimeoutsRef = useRef<{ [key: string]: number }>({});

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
		const pinned = notes
			.filter((n) => n.pinned)
			.sort((a, b) => a.order - b.order);
		const unpinned = notes
			.filter((n) => !n.pinned)
			.sort((a, b) => a.order - b.order);

		return [...pinned, ...unpinned].map((note, index) => ({
			...note,
			order: index,
		}));
	};

	// Stack behavior for new notes: newest unpinned note appears first
	const addNoteInStackOrder = (notes: Note[], newNote: Note): Note[] => {
		const pinned = notes
			.filter((n) => n.pinned)
			.sort((a, b) => a.order - b.order);
		const unpinned = notes
			.filter((n) => !n.pinned)
			.sort((a, b) => a.order - b.order);

		return [...pinned, newNote, ...unpinned].map((note, index) => ({
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

		if (newText.trim()) {
			const newNote: Note = {
				heading: newHeading.trim() || 'No Heading',
				text: newText.trim(),
				id: generateId(),
				pinned: false,
				order: 0,
			};
			const updatedNotes = addNoteInStackOrder(copiedTexts, newNote);
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
						'Failed to clear notes: ' + chrome.runtime.lastError.message,
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
				}, 2000);
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

	// Start editing a note
	const startEdit = (note: Note) => {
		setEditingNoteId(note.id);
		setEditHeading(note.heading);
		setEditText(note.text);
	};

	// Cancel editing
	const cancelEdit = () => {
		setEditingNoteId(null);
		setEditHeading('');
		setEditText('');
	};

	// Save edited note
	const saveEdit = (id: string) => {
		if (!editText.trim()) {
			return;
		}

		const updatedNotes = copiedTexts.map((note) =>
			note.id === id
				? {
						...note,
						heading: editHeading.trim() || 'No Heading',
						text: editText.trim(),
					}
				: note,
		);
		saveNotes(updatedNotes);
		cancelEdit();
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
			note.id === id ? { ...note, pinned: !note.pinned } : note,
		);

		const sortedNotes = sortNotesByPin(updatedNotes);
		saveNotes(sortedNotes);
	};

	// Reorder notes with pin boundary protection
	const reorderNotes = (
		notes: Note[],
		draggedId: string,
		targetId: string,
		position: 'before' | 'after' | null,
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

	// Toggle the Drag & Drop panel - draggability follows this directly
	const toggleDragSection = () => {
		setIsDragSectionOpen((prev) => {
			const next = !prev;
			if (!next) {
				// Closing the panel must fully turn off dragging
				resetDragState();
			}
			return next;
		});
	};

	// Handle drag start - only works while the Drag & Drop panel is open
	const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
		if (!isDragSectionOpen) {
			e.preventDefault();
			return;
		}

		setDraggedItem(id);
		e.dataTransfer.effectAllowed = 'move';
	};

	// Handle drag end
	const handleDragEnd = () => {
		if (!isDragSectionOpen) {
			return;
		}

		resetDragState();
	};

	// Handle drag over
	const handleDragOver = (
		e: React.DragEvent<HTMLDivElement>,
		targetId: string,
	) => {
		if (!isDragSectionOpen || !draggedItem) return;

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
		if (!isDragSectionOpen) {
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
			dropPosition,
		);

		// Update state (triggers re-render)
		saveNotes(newNotes);

		// FLIP: Animate AFTER re-render
		animateReorder(oldPositions);

		resetDragState();
	};

	// Filter notes by search query
	const filteredNotes = searchQuery.trim()
		? copiedTexts.filter(
				(note) =>
					note.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
					note.text.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: copiedTexts;

	// Split notes into pinned and unpinned
	const pinnedNotes = filteredNotes.filter((note) => note.pinned);
	const unpinnedNotes = filteredNotes.filter((note) => !note.pinned);
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
								{theme === 'dark' ? (
									<Sun size={12} strokeWidth={3} className="icon-svg" />
								) : (
									<Moon size={12} strokeWidth={3} className="icon-svg" />
								)}
							</div>
						</button>
					</div>
				</div>

				{error && <div className="error-message">{error}</div>}

				<div className="section-toggle-row">
					<button
						onClick={() => setIsAddSectionOpen((prev) => !prev)}
						className="add-note-toggle-btn"
						aria-expanded={isAddSectionOpen}
						aria-controls="add-note-panel"
					>
						{isAddSectionOpen ? 'Close Add Note' : '+ Add Note'}
					</button>
					<button
						onClick={() => setIsSearchSectionOpen((prev) => !prev)}
						className="search-toggle-btn"
						aria-expanded={isSearchSectionOpen}
						aria-controls="search-panel"
					>
						{isSearchSectionOpen ? 'Close Search' : '+ Search'}
					</button>
					<button
						onClick={toggleDragSection}
						className="drag-toggle-btn"
						aria-expanded={isDragSectionOpen}
						aria-controls="drag-panel"
					>
						{isDragSectionOpen ? 'Close Drag' : '+ Drag & Drop'}
					</button>
				</div>

				{isAddSectionOpen && (
					<div className="sub-heading add-note-panel" id="add-note-panel">
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
							/>
							{newText && (
								<div className="character-count">
									{newText.length} characters
								</div>
							)}
						</div>
					</div>
				)}
				{isSearchSectionOpen && (
					<div className="sub-heading search-panel" id="search-panel">
						<div className="sub-sub">
							<h2 className="pt-margin">Previous Texts</h2>
							<button onClick={clearAll}>Clear All</button>
						</div>
						<div className="search-bar">
							<input
								type="text"
								placeholder="Search notes..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							{searchQuery && (
								<button
									className="search-clear-btn"
									onClick={() => setSearchQuery('')}
								>
									<X size={11} strokeWidth={3} className="icon-svg" />
								</button>
							)}
						</div>
					</div>
				)}

				{isDragSectionOpen && (
					<div className="drag-panel" id="drag-panel">
						<div className="drag-info">
							<span>
								{copiedTexts.length === 0
									? 'No notes to reorder yet'
									: 'Drag mode is on — drag any note to reorder it'}
							</span>
						</div>
					</div>
				)}

				{copiedTexts.length > 0 ? (
					<div className="notes-container" ref={notesContainerRef}>
						{filteredNotes.length === 0 && (
							<p className="no-results">No notes match your search.</p>
						)}

						{/* Pinned Notes Section */}
						{pinnedNotes.length > 0 && (
							<>
								<div className="notes-section-divider pinned-divider">
									<span>📌 Pinned</span>
								</div>
								{pinnedNotes.map((note) => (
									<NoteCard
										key={note.id}
										note={note}
										isPinned
										isDraggable={isDragSectionOpen}
										isDragging={draggedItem === note.id}
										isCopied={!!copiedStates[note.id]}
										isDragOver={dragOverItem === note.id}
										dropPosition={dragOverItem === note.id ? dropPosition : null}
										isEditing={editingNoteId === note.id}
										editHeading={editHeading}
										editText={editText}
										onEditHeadingChange={setEditHeading}
										onEditTextChange={setEditText}
										onDragStart={handleDragStart}
										onDragEnd={handleDragEnd}
										onDragOver={handleDragOver}
										onDrop={handleDrop}
										onTogglePin={togglePin}
										onCopy={copyToClipboard}
										onDelete={deleteNote}
										onStartEdit={startEdit}
										onSaveEdit={saveEdit}
										onCancelEdit={cancelEdit}
									/>
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
							<NoteCard
								key={note.id}
								note={note}
								isPinned={false}
								isDraggable={isDragSectionOpen}
								isDragging={draggedItem === note.id}
								isCopied={!!copiedStates[note.id]}
								isDragOver={dragOverItem === note.id}
								dropPosition={dragOverItem === note.id ? dropPosition : null}
								isEditing={editingNoteId === note.id}
								editHeading={editHeading}
								editText={editText}
								onEditHeadingChange={setEditHeading}
								onEditTextChange={setEditText}
								onDragStart={handleDragStart}
								onDragEnd={handleDragEnd}
								onDragOver={handleDragOver}
								onDrop={handleDrop}
								onTogglePin={togglePin}
								onCopy={copyToClipboard}
								onDelete={deleteNote}
								onStartEdit={startEdit}
								onSaveEdit={saveEdit}
								onCancelEdit={cancelEdit}
							/>
						))}
					</div>
				) : (
					<p>No saved texts.</p>
				)}
			</div>
		</div>
	);
};
