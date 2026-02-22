import { useEffect, useRef, useState } from 'react';
import './popup.scss';

interface Note {
	heading: string;
	text: string;
	id: string; // Unique ID for each note
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

	// Theme state
	const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

	// Load notes from chrome.storage.local
	const loadSavedNotes = () => {
		chrome.storage.local.get(['notes'], (result) => {
			try {
				if (result.notes) {
					// Ensure all notes have IDs
					const notesWithIds = result.notes.map((note: any) => {
						if (!note.id) {
							return { ...note, id: generateId() };
						}
						return note;
					});
					setCopiedTexts(notesWithIds);

					// If IDs were added, update storage
					if (notesWithIds.some((_: any, i: number) => !result.notes[i].id)) {
						chrome.storage.local.set({ notes: notesWithIds });
					}
				} else {
					// Set default example note if no saved notes exist
					const defaultNote = [
						{
							heading: 'Example Heading',
							text: 'This is the Example text format',
							id: generateId(),
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
			const newNote = {
				heading: newHeading.trim() || 'No Heading',
				text: newText.trim(),
				id: generateId(),
			};
			const updatedNotes = [...copiedTexts, newNote];
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

	// Handle drag start - only works when drag is enabled
	const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
		if (!isDragEnabled) {
			e.preventDefault();
			return;
		}

		setDraggedItem(id);
		// Make drag image transparent
		if (e.dataTransfer.setDragImage) {
			const dragImage = new Image();
			dragImage.src =
				'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
			e.dataTransfer.setDragImage(dragImage, 0, 0);
		}

		// Set the dragged element's styling
		const element = e.currentTarget;
		element.style.opacity = '0.6';
		e.dataTransfer.effectAllowed = 'move';
	};

	// Handle drag end
	const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
		if (!isDragEnabled) {
			return;
		}

		e.currentTarget.style.opacity = '1';
		setDraggedItem(null);
	};

	// Handle drag over
	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		if (!isDragEnabled) {
			return;
		}

		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	};

	// Handle drop
	const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
		if (!isDragEnabled) {
			return;
		}

		e.preventDefault();

		if (!draggedItem || draggedItem === targetId) {
			return;
		}

		// Reorder notes
		const draggedIndex = copiedTexts.findIndex(
			(note) => note.id === draggedItem
		);
		const targetIndex = copiedTexts.findIndex((note) => note.id === targetId);

		if (draggedIndex === -1 || targetIndex === -1) {
			return;
		}

		const newNotes = [...copiedTexts];
		const [draggedNote] = newNotes.splice(draggedIndex, 1);
		newNotes.splice(targetIndex, 0, draggedNote);

		// Save the reordered notes
		saveNotes(newNotes);
	};

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
					<div className="notes-container">
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
						{copiedTexts.map((note) => (
							<div
								key={note.id}
								className={`copied-text ${
									draggedItem === note.id ? 'dragging' : ''
								}`}
								draggable={isDragEnabled}
								onDragStart={(e) => handleDragStart(e, note.id)}
								onDragEnd={handleDragEnd}
								onDragOver={handleDragOver}
								onDrop={(e) => handleDrop(e, note.id)}
							>
								<div className="copy-here">
									<p>{note.heading}</p>
									<div className="button-group">
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
