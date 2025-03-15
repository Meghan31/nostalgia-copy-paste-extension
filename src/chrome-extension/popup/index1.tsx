// // // import { useEffect, useState } from 'react';
// // // import './popup.scss';

// // // interface Note {
// // // 	heading: string;
// // // 	text: string;
// // // }

// // // interface CopiedState {
// // // 	[key: number]: boolean;
// // // }

// // // export const Popup = () => {
// // // 	const [copiedTexts, setCopiedTexts] = useState<Note[]>([]);
// // // 	const [newHeading, setNewHeading] = useState('');
// // // 	const [newText, setNewText] = useState('');
// // // 	const [copiedStates, setCopiedStates] = useState<CopiedState>({});
// // // 	const [noteAdd, setNoteAdd] = useState('Add Note');
// // // 	const [redColor, setRedColor] = useState('black');
// // // 	const [isAddingNote, setIsAddingNote] = useState(false);

// // // 	// Load saved notes when component mounts
// // // 	useEffect(() => {
// // // 		loadSavedNotes();
// // // 	}, []);

// // // 	// Load notes from chrome.storage.local
// // // 	const loadSavedNotes = () => {
// // // 		chrome.storage.local.get(['notes'], (result) => {
// // // 			if (result.notes) {
// // // 				setCopiedTexts(result.notes);
// // // 			} else {
// // // 				// Set default example note if no saved notes exist
// // // 				const defaultNote = [
// // // 					{
// // // 						heading: 'Example Heading',
// // // 						text: 'This is the Example text format',
// // // 					},
// // // 				];
// // // 				setCopiedTexts(defaultNote);
// // // 				chrome.storage.local.set({ notes: defaultNote });
// // // 			}
// // // 		});
// // // 	};

// // // 	// Save notes to chrome.storage.local
// // // 	const saveNotes = (updatedNotes: Note[]) => {
// // // 		chrome.storage.local.set({ notes: updatedNotes }, () => {
// // // 			setCopiedTexts(updatedNotes);
// // // 		});
// // // 	};

// // // 	const addNote = () => {
// // // 		// Prevent multiple rapid clicks
// // // 		if (isAddingNote) {
// // // 			return;
// // // 		}

// // // 		setIsAddingNote(true);

// // // 		if (newText.trim()) {
// // // 			const newNote = {
// // // 				heading: newHeading.trim() || 'No Heading',
// // // 				text: newText.trim(),
// // // 			};
// // // 			const updatedNotes = [...copiedTexts, newNote];
// // // 			saveNotes(updatedNotes);
// // // 			setNoteAdd('Note Added!!! ⬇️');
// // // 			setTimeout(() => {
// // // 				setNoteAdd('Add Note');
// // // 				setIsAddingNote(false);
// // // 			}, 1000);
// // // 			setNewHeading('');
// // // 			setNewText('');
// // // 		} else {
// // // 			// Show error message without adding to notes
// // // 			setRedColor('red');
// // // 			const tempHeading = 'Please provide a heading!!!!!!';
// // // 			const tempText = 'Please provide a text!!!!!!(Mandatory)';

// // // 			// Just set the displayed values without adding a note
// // // 			setNewHeading(tempHeading);
// // // 			setNewText(tempText);

// // // 			setTimeout(() => {
// // // 				setNewHeading('');
// // // 				setNewText('');
// // // 				setRedColor('black');
// // // 				setIsAddingNote(false);
// // // 			}, 1000);
// // // 		}
// // // 	};

// // // 	const clearAll = () => {
// // // 		// Clear all notes
// // // 		if (window.confirm('Are you sure you want to delete all the notes?')) {
// // // 			chrome.storage.local.remove(['notes'], () => {
// // // 				setCopiedTexts([]);
// // // 			});
// // // 		}
// // // 	};

// // // 	const deleteNote = (index: number) => {
// // // 		if (window.confirm('Are you sure you want to delete this note?')) {
// // // 			const updatedNotes = copiedTexts.filter((_, i) => i !== index);
// // // 			saveNotes(updatedNotes);
// // // 		}
// // // 	};

// // // 	const copyToClipboard = (text: string, index: number) => {
// // // 		navigator.clipboard
// // // 			.writeText(text)
// // // 			.then(() => {
// // // 				// Update only the specific button state
// // // 				setCopiedStates((prev) => ({
// // // 					...prev,
// // // 					[index]: true,
// // // 				}));

// // // 				// Reset after 1 second
// // // 				setTimeout(() => {
// // // 					setCopiedStates((prev) => ({
// // // 						...prev,
// // // 						[index]: false,
// // // 					}));
// // // 				}, 1000);
// // // 			})
// // // 			.catch((err) => {
// // // 				console.error('Failed to copy text: ', err);
// // // 			});
// // // 	};

// // // 	return (
// // // 		<div className="popup-container">
// // // 			<div className="header">
// // // 				<div className="title">
// // // 					<img src="public/48.png" alt="Nostalgia" className="icon" />
// // // 					<div className="heading">
// // // 						<h1>Nostalgia</h1>
// // // 					</div>
// // // 				</div>
// // // 				<br />
// // // 				<div className="sub-heading">
// // // 					<div className="pastehere">
// // // 						<h2>Paste here</h2>
// // // 						<button onClick={addNote} disabled={isAddingNote}>
// // // 							{noteAdd}
// // // 						</button>
// // // 					</div>
// // // 					<div className="paste-input">
// // // 						<input
// // // 							type="text"
// // // 							placeholder="Give a heading"
// // // 							value={newHeading}
// // // 							onChange={(e) => setNewHeading(e.target.value)}
// // // 							style={{ color: redColor }}
// // // 						/>
// // // 						<textarea
// // // 							rows={3}
// // // 							placeholder="Enter text here"
// // // 							value={newText}
// // // 							onChange={(e) => setNewText(e.target.value)}
// // // 							style={{ color: redColor }}
// // // 						/>
// // // 					</div>
// // // 				</div>
// // // 				<br />
// // // 				<div className="sub-heading">
// // // 					<div className="sub-sub">
// // // 						<h2 className="pt-margin">Previous Texts</h2>
// // // 						<button onClick={clearAll}>Clear All</button>
// // // 					</div>
// // // 				</div>

// // // 				{copiedTexts.length > 0 ? (
// // // 					copiedTexts.map((text, index) => (
// // // 						<div key={index} className="copied-text">
// // // 							<div className="copy-here">
// // // 								<p>{text.heading}</p>
// // // 								<div className="button-group">
// // // 									<button
// // // 										onClick={() => copyToClipboard(text.text, index)}
// // // 										className="copy-btn"
// // // 									>
// // // 										{copiedStates[index] ? 'Copied!' : 'Copy'}
// // // 									</button>
// // // 									<button
// // // 										onClick={() => deleteNote(index)}
// // // 										className="delete-btn"
// // // 									>
// // // 										Delete
// // // 									</button>
// // // 								</div>
// // // 							</div>
// // // 							<div className="paste-input">
// // // 								<textarea rows={2} value={text.text} readOnly />
// // // 							</div>
// // // 						</div>
// // // 					))
// // // 				) : (
// // // 					<p>No saved texts.</p>
// // // 				)}
// // // 			</div>
// // // 		</div>
// // // 	);
// // // };

// // import { useEffect, useRef, useState } from 'react';
// // import './popup.scss';

// // interface Note {
// // 	heading: string;
// // 	text: string;
// // 	id: string; // Add unique ID for each note
// // }

// // interface CopiedState {
// // 	[key: string]: boolean;
// // }

// // export const Popup = () => {
// // 	const [copiedTexts, setCopiedTexts] = useState<Note[]>([]);
// // 	const [newHeading, setNewHeading] = useState('');
// // 	const [newText, setNewText] = useState('');
// // 	const [copiedStates, setCopiedStates] = useState<CopiedState>({});
// // 	const [noteAdd, setNoteAdd] = useState('Add Note');
// // 	const [redColor, setRedColor] = useState('black');
// // 	const [isAddingNote, setIsAddingNote] = useState(false);
// // 	const [error, setError] = useState<string | null>(null);

// // 	// Use refs to store timeouts so they can be cleared
// // 	const addNoteTimeoutRef = useRef<number | null>(null);
// // 	const errorTimeoutRef = useRef<number | null>(null);
// // 	const copyTimeoutsRef = useRef<{ [key: string]: number }>({});

// // 	// Constants
// // 	const MAX_TEXT_LENGTH = 5000; // Set a reasonable limit

// // 	// Clean up timeouts on unmount
// // 	useEffect(() => {
// // 		return () => {
// // 			if (addNoteTimeoutRef.current) {
// // 				clearTimeout(addNoteTimeoutRef.current);
// // 			}
// // 			if (errorTimeoutRef.current) {
// // 				clearTimeout(errorTimeoutRef.current);
// // 			}
// // 			Object.values(copyTimeoutsRef.current).forEach((timeout) => {
// // 				clearTimeout(timeout);
// // 			});
// // 		};
// // 	}, []);

// // 	// Load saved notes when component mounts
// // 	useEffect(() => {
// // 		loadSavedNotes();
// // 	}, []);

// // 	// Generate a unique ID for notes
// // 	const generateId = (): string => {
// // 		return Date.now().toString(36) + Math.random().toString(36).substr(2);
// // 	};

// // 	// Load notes from chrome.storage.local
// // 	const loadSavedNotes = () => {
// // 		chrome.storage.local.get(['notes'], (result) => {
// // 			try {
// // 				if (result.notes) {
// // 					// Ensure all notes have IDs
// // 					const notesWithIds = result.notes.map((note: any) => {
// // 						if (!note.id) {
// // 							return { ...note, id: generateId() };
// // 						}
// // 						return note;
// // 					});
// // 					setCopiedTexts(notesWithIds);

// // 					// If IDs were added, update storage
// // 					if (notesWithIds.some((_: any, i: number) => !result.notes[i].id)) {
// // 						chrome.storage.local.set({ notes: notesWithIds });
// // 					}
// // 				} else {
// // 					// Set default example note if no saved notes exist
// // 					const defaultNote = [
// // 						{
// // 							heading: 'Example Heading',
// // 							text: 'This is the Example text format',
// // 							id: generateId(),
// // 						},
// // 					];
// // 					setCopiedTexts(defaultNote);
// // 					chrome.storage.local.set({ notes: defaultNote });
// // 				}
// // 			} catch (err) {
// // 				setError('Failed to load notes');
// // 				console.error('Error loading notes:', err);
// // 			}
// // 		});
// // 	};

// // 	// Save notes to chrome.storage.local
// // 	const saveNotes = (updatedNotes: Note[]) => {
// // 		chrome.storage.local.set({ notes: updatedNotes }, () => {
// // 			if (chrome.runtime.lastError) {
// // 				setError('Failed to save notes: ' + chrome.runtime.lastError.message);
// // 				console.error('Error saving notes:', chrome.runtime.lastError);
// // 				return;
// // 			}
// // 			setCopiedTexts(updatedNotes);
// // 			setError(null);
// // 		});
// // 	};

// // 	const addNote = () => {
// // 		// Prevent multiple rapid clicks
// // 		if (isAddingNote) {
// // 			return;
// // 		}

// // 		setIsAddingNote(true);

// // 		// Validate text length
// // 		if (newText.trim().length > MAX_TEXT_LENGTH) {
// // 			setError(`Text is too long (max ${MAX_TEXT_LENGTH} characters)`);
// // 			setRedColor('red');

// // 			// Reset after timeout
// // 			errorTimeoutRef.current = window.setTimeout(() => {
// // 				setError(null);
// // 				setRedColor('black');
// // 				setIsAddingNote(false);
// // 			}, 1500);
// // 			return;
// // 		}

// // 		if (newText.trim()) {
// // 			const newNote = {
// // 				heading: newHeading.trim() || 'No Heading',
// // 				text: newText.trim(),
// // 				id: generateId(),
// // 			};
// // 			const updatedNotes = [...copiedTexts, newNote];
// // 			saveNotes(updatedNotes);
// // 			setNoteAdd('Note Added!!! ⬇️');
// // 			addNoteTimeoutRef.current = window.setTimeout(() => {
// // 				setNoteAdd('Add Note');
// // 				setIsAddingNote(false);
// // 			}, 1000);
// // 			setNewHeading('');
// // 			setNewText('');
// // 		} else {
// // 			// Show error message without adding to notes
// // 			setRedColor('red');
// // 			const tempHeading = 'Please provide a heading!!!!!!';
// // 			const tempText = 'Please provide a text!!!!!!(Mandatory)';

// // 			// Just set the displayed values without adding a note
// // 			setNewHeading(tempHeading);
// // 			setNewText(tempText);

// // 			errorTimeoutRef.current = window.setTimeout(() => {
// // 				setNewHeading('');
// // 				setNewText('');
// // 				setRedColor('black');
// // 				setIsAddingNote(false);
// // 			}, 1000);
// // 		}
// // 	};

// // 	const clearAll = () => {
// // 		// Clear all notes
// // 		if (window.confirm('Are you sure you want to delete all the notes?')) {
// // 			chrome.storage.local.remove(['notes'], () => {
// // 				if (chrome.runtime.lastError) {
// // 					setError(
// // 						'Failed to clear notes: ' + chrome.runtime.lastError.message
// // 					);
// // 					return;
// // 				}
// // 				setCopiedTexts([]);
// // 				setError(null);
// // 			});
// // 		}
// // 	};

// // 	const deleteNote = (id: string) => {
// // 		if (window.confirm('Are you sure you want to delete this note?')) {
// // 			const updatedNotes = copiedTexts.filter((note) => note.id !== id);
// // 			saveNotes(updatedNotes);
// // 		}
// // 	};

// // 	const copyToClipboard = (text: string, id: string) => {
// // 		// Clear any existing timeout for this ID
// // 		if (copyTimeoutsRef.current[id]) {
// // 			clearTimeout(copyTimeoutsRef.current[id]);
// // 		}

// // 		navigator.clipboard
// // 			.writeText(text)
// // 			.then(() => {
// // 				// Update only the specific button state
// // 				setCopiedStates((prev) => ({
// // 					...prev,
// // 					[id]: true,
// // 				}));

// // 				// Store and set timeout
// // 				copyTimeoutsRef.current[id] = window.setTimeout(() => {
// // 					setCopiedStates((prev) => ({
// // 						...prev,
// // 						[id]: false,
// // 					}));
// // 					// Clean up the timeout reference
// // 					delete copyTimeoutsRef.current[id];
// // 				}, 1000);
// // 			})
// // 			.catch((err) => {
// // 				console.error('Failed to copy text: ', err);
// // 				setError('Failed to copy to clipboard');

// // 				// Clear error after a delay
// // 				errorTimeoutRef.current = window.setTimeout(() => {
// // 					setError(null);
// // 				}, 1500);
// // 			});
// // 	};

// // 	return (
// // 		<div className="popup-container">
// // 			<div className="header">
// // 				<div className="title">
// // 					<img src="public/48.png" alt="Nostalgia" className="icon" />
// // 					<div className="heading">
// // 						<h1>Nostalgia</h1>
// // 					</div>
// // 				</div>

// // 				{error && (
// // 					<div
// // 						className="error-message"
// // 						style={{ color: 'red', padding: '5px', margin: '5px 0' }}
// // 					>
// // 						{error}
// // 					</div>
// // 				)}

// // 				<br />
// // 				<div className="sub-heading">
// // 					<div className="pastehere">
// // 						<h2>Paste here</h2>
// // 						<button onClick={addNote} disabled={isAddingNote}>
// // 							{noteAdd}
// // 						</button>
// // 					</div>
// // 					<div className="paste-input">
// // 						<input
// // 							type="text"
// // 							placeholder="Give a heading"
// // 							value={newHeading}
// // 							onChange={(e) => setNewHeading(e.target.value)}
// // 							style={{ color: redColor }}
// // 							maxLength={100} // Reasonable limit for headings
// // 						/>
// // 						<textarea
// // 							rows={3}
// // 							placeholder="Enter text here"
// // 							value={newText}
// // 							onChange={(e) => setNewText(e.target.value)}
// // 							style={{ color: redColor }}
// // 							maxLength={MAX_TEXT_LENGTH}
// // 						/>
// // 						{newText && (
// // 							<div
// // 								className="character-count"
// // 								style={{ fontSize: '0.8rem', textAlign: 'right' }}
// // 							>
// // 								{newText.length}/{MAX_TEXT_LENGTH}
// // 							</div>
// // 						)}
// // 					</div>
// // 				</div>
// // 				<br />
// // 				<div className="sub-heading">
// // 					<div className="sub-sub">
// // 						<h2 className="pt-margin">Previous Texts</h2>
// // 						<button onClick={clearAll}>Clear All</button>
// // 					</div>
// // 				</div>

// // 				{copiedTexts.length > 0 ? (
// // 					copiedTexts.map((note) => (
// // 						<div key={note.id} className="copied-text">
// // 							<div className="copy-here">
// // 								<p>{note.heading}</p>
// // 								<div className="button-group">
// // 									<button
// // 										onClick={() => copyToClipboard(note.text, note.id)}
// // 										className={`copy-btn ${
// // 											copiedStates[note.id] ? 'copied' : ''
// // 										}`}
// // 									>
// // 										{copiedStates[note.id] ? 'Copied!' : 'Copy'}
// // 									</button>
// // 									<button
// // 										onClick={() => deleteNote(note.id)}
// // 										className="delete-btn"
// // 									>
// // 										Delete
// // 									</button>
// // 								</div>
// // 							</div>
// // 							<div className="paste-input">
// // 								<textarea rows={2} value={note.text} readOnly />
// // 							</div>
// // 						</div>
// // 					))
// // 				) : (
// // 					<p>No saved texts.</p>
// // 				)}
// // 			</div>
// // 		</div>
// // 	);
// // };

// import { useEffect, useRef, useState } from 'react';
// import './popup.scss';

// interface Note {
// 	heading: string;
// 	text: string;
// 	id: string; // Unique ID for each note
// }

// interface CopiedState {
// 	[key: string]: boolean;
// }

// export const Popup = () => {
// 	const [copiedTexts, setCopiedTexts] = useState<Note[]>([]);
// 	const [newHeading, setNewHeading] = useState('');
// 	const [newText, setNewText] = useState('');
// 	const [copiedStates, setCopiedStates] = useState<CopiedState>({});
// 	const [noteAdd, setNoteAdd] = useState('Add Note');
// 	const [redColor, setRedColor] = useState('black');
// 	const [isAddingNote, setIsAddingNote] = useState(false);
// 	const [error, setError] = useState<string | null>(null);

// 	// Drag and drop state
// 	const [draggedItem, setDraggedItem] = useState<string | null>(null);

// 	// Use refs to store timeouts so they can be cleared
// 	const addNoteTimeoutRef = useRef<number | null>(null);
// 	const errorTimeoutRef = useRef<number | null>(null);
// 	const copyTimeoutsRef = useRef<{ [key: string]: number }>({});

// 	// Constants
// 	const MAX_TEXT_LENGTH = 5000; // Set a reasonable limit

// 	// Clean up timeouts on unmount
// 	useEffect(() => {
// 		return () => {
// 			if (addNoteTimeoutRef.current) {
// 				clearTimeout(addNoteTimeoutRef.current);
// 			}
// 			if (errorTimeoutRef.current) {
// 				clearTimeout(errorTimeoutRef.current);
// 			}
// 			Object.values(copyTimeoutsRef.current).forEach((timeout) => {
// 				clearTimeout(timeout);
// 			});
// 		};
// 	}, []);

// 	// Load saved notes when component mounts
// 	useEffect(() => {
// 		loadSavedNotes();
// 	}, []);

// 	// Generate a unique ID for notes
// 	const generateId = (): string => {
// 		return Date.now().toString(36) + Math.random().toString(36).substr(2);
// 	};

// 	// Load notes from chrome.storage.local
// 	const loadSavedNotes = () => {
// 		chrome.storage.local.get(['notes'], (result) => {
// 			try {
// 				if (result.notes) {
// 					// Ensure all notes have IDs
// 					const notesWithIds = result.notes.map((note: any) => {
// 						if (!note.id) {
// 							return { ...note, id: generateId() };
// 						}
// 						return note;
// 					});
// 					setCopiedTexts(notesWithIds);

// 					// If IDs were added, update storage
// 					if (notesWithIds.some((_: any, i: number) => !result.notes[i].id)) {
// 						chrome.storage.local.set({ notes: notesWithIds });
// 					}
// 				} else {
// 					// Set default example note if no saved notes exist
// 					const defaultNote = [
// 						{
// 							heading: 'Example Heading',
// 							text: 'This is the Example text format',
// 							id: generateId(),
// 						},
// 					];
// 					setCopiedTexts(defaultNote);
// 					chrome.storage.local.set({ notes: defaultNote });
// 				}
// 			} catch (err) {
// 				setError('Failed to load notes');
// 				console.error('Error loading notes:', err);
// 			}
// 		});
// 	};

// 	// Save notes to chrome.storage.local
// 	const saveNotes = (updatedNotes: Note[]) => {
// 		chrome.storage.local.set({ notes: updatedNotes }, () => {
// 			if (chrome.runtime.lastError) {
// 				setError('Failed to save notes: ' + chrome.runtime.lastError.message);
// 				console.error('Error saving notes:', chrome.runtime.lastError);
// 				return;
// 			}
// 			setCopiedTexts(updatedNotes);
// 			setError(null);
// 		});
// 	};

// 	const addNote = () => {
// 		// Prevent multiple rapid clicks
// 		if (isAddingNote) {
// 			return;
// 		}

// 		setIsAddingNote(true);

// 		// Validate text length
// 		if (newText.trim().length > MAX_TEXT_LENGTH) {
// 			setError(`Text is too long (max ${MAX_TEXT_LENGTH} characters)`);
// 			setRedColor('red');

// 			// Reset after timeout
// 			errorTimeoutRef.current = window.setTimeout(() => {
// 				setError(null);
// 				setRedColor('black');
// 				setIsAddingNote(false);
// 			}, 1500);
// 			return;
// 		}

// 		if (newText.trim()) {
// 			const newNote = {
// 				heading: newHeading.trim() || 'No Heading',
// 				text: newText.trim(),
// 				id: generateId(),
// 			};
// 			const updatedNotes = [...copiedTexts, newNote];
// 			saveNotes(updatedNotes);
// 			setNoteAdd('Note Added!!! ⬇️');
// 			addNoteTimeoutRef.current = window.setTimeout(() => {
// 				setNoteAdd('Add Note');
// 				setIsAddingNote(false);
// 			}, 1000);
// 			setNewHeading('');
// 			setNewText('');
// 		} else {
// 			// Show error message without adding to notes
// 			setRedColor('red');
// 			const tempHeading = 'Please provide a heading!!!!!!';
// 			const tempText = 'Please provide a text!!!!!!(Mandatory)';

// 			// Just set the displayed values without adding a note
// 			setNewHeading(tempHeading);
// 			setNewText(tempText);

// 			errorTimeoutRef.current = window.setTimeout(() => {
// 				setNewHeading('');
// 				setNewText('');
// 				setRedColor('black');
// 				setIsAddingNote(false);
// 			}, 1000);
// 		}
// 	};

// 	const clearAll = () => {
// 		// Clear all notes
// 		if (window.confirm('Are you sure you want to delete all the notes?')) {
// 			chrome.storage.local.remove(['notes'], () => {
// 				if (chrome.runtime.lastError) {
// 					setError(
// 						'Failed to clear notes: ' + chrome.runtime.lastError.message
// 					);
// 					return;
// 				}
// 				setCopiedTexts([]);
// 				setError(null);
// 			});
// 		}
// 	};

// 	const deleteNote = (id: string) => {
// 		if (window.confirm('Are you sure you want to delete this note?')) {
// 			const updatedNotes = copiedTexts.filter((note) => note.id !== id);
// 			saveNotes(updatedNotes);
// 		}
// 	};

// 	const copyToClipboard = (text: string, id: string) => {
// 		// Clear any existing timeout for this ID
// 		if (copyTimeoutsRef.current[id]) {
// 			clearTimeout(copyTimeoutsRef.current[id]);
// 		}

// 		navigator.clipboard
// 			.writeText(text)
// 			.then(() => {
// 				// Update only the specific button state
// 				setCopiedStates((prev) => ({
// 					...prev,
// 					[id]: true,
// 				}));

// 				// Store and set timeout
// 				copyTimeoutsRef.current[id] = window.setTimeout(() => {
// 					setCopiedStates((prev) => ({
// 						...prev,
// 						[id]: false,
// 					}));
// 					// Clean up the timeout reference
// 					delete copyTimeoutsRef.current[id];
// 				}, 1000);
// 			})
// 			.catch((err) => {
// 				console.error('Failed to copy text: ', err);
// 				setError('Failed to copy to clipboard');

// 				// Clear error after a delay
// 				errorTimeoutRef.current = window.setTimeout(() => {
// 					setError(null);
// 				}, 1500);
// 			});
// 	};

// 	// Handle drag start
// 	const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
// 		setDraggedItem(id);
// 		// Make drag image transparent
// 		if (e.dataTransfer.setDragImage) {
// 			const dragImage = new Image();
// 			dragImage.src =
// 				'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
// 			e.dataTransfer.setDragImage(dragImage, 0, 0);
// 		}

// 		// Set the dragged element's styling
// 		const element = e.currentTarget;
// 		element.style.opacity = '0.6';
// 		e.dataTransfer.effectAllowed = 'move';
// 	};

// 	// Handle drag end
// 	const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
// 		e.currentTarget.style.opacity = '1';
// 		setDraggedItem(null);
// 	};

// 	// Handle drag over
// 	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
// 		e.preventDefault();
// 		e.dataTransfer.dropEffect = 'move';
// 	};

// 	// Handle drop
// 	const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
// 		e.preventDefault();

// 		if (!draggedItem || draggedItem === targetId) {
// 			return;
// 		}

// 		// Reorder notes
// 		const draggedIndex = copiedTexts.findIndex(
// 			(note) => note.id === draggedItem
// 		);
// 		const targetIndex = copiedTexts.findIndex((note) => note.id === targetId);

// 		if (draggedIndex === -1 || targetIndex === -1) {
// 			return;
// 		}

// 		const newNotes = [...copiedTexts];
// 		const [draggedNote] = newNotes.splice(draggedIndex, 1);
// 		newNotes.splice(targetIndex, 0, draggedNote);

// 		// Save the reordered notes
// 		saveNotes(newNotes);
// 	};

// 	return (
// 		<div className="popup-container">
// 			<div className="header">
// 				<div className="title">
// 					<img src="public/48.png" alt="Nostalgia" className="icon" />
// 					<div className="heading">
// 						<h1>Nostalgia</h1>
// 					</div>
// 				</div>

// 				{error && (
// 					<div
// 						className="error-message"
// 						style={{ color: 'red', padding: '5px', margin: '5px 0' }}
// 					>
// 						{error}
// 					</div>
// 				)}

// 				<br />
// 				<div className="sub-heading">
// 					<div className="pastehere">
// 						<h2>Paste here</h2>
// 						<button onClick={addNote} disabled={isAddingNote}>
// 							{noteAdd}
// 						</button>
// 					</div>
// 					<div className="paste-input">
// 						<input
// 							type="text"
// 							placeholder="Give a heading"
// 							value={newHeading}
// 							onChange={(e) => setNewHeading(e.target.value)}
// 							style={{ color: redColor }}
// 							maxLength={100} // Reasonable limit for headings
// 						/>
// 						<textarea
// 							rows={3}
// 							placeholder="Enter text here"
// 							value={newText}
// 							onChange={(e) => setNewText(e.target.value)}
// 							style={{ color: redColor }}
// 							maxLength={MAX_TEXT_LENGTH}
// 						/>
// 						{newText && (
// 							<div
// 								className="character-count"
// 								style={{ fontSize: '0.8rem', textAlign: 'right' }}
// 							>
// 								{newText.length}/{MAX_TEXT_LENGTH}
// 							</div>
// 						)}
// 					</div>
// 				</div>
// 				<br />
// 				<div className="sub-heading">
// 					<div className="sub-sub">
// 						<h2 className="pt-margin">Previous Texts</h2>
// 						<button onClick={clearAll}>Clear All</button>
// 					</div>
// 				</div>

// 				{copiedTexts.length > 0 ? (
// 					<div className="notes-container">
// 						<div className="drag-div">
// 							<div className="checkbox-container">
// 								<label
// 									style={{
// 										display: 'flex',
// 										flexDirection: 'row',
// 										justifyContent: 'space-around',
// 										alignItems: 'center',
// 									}}
// 								>
// 									<input type="checkbox" />
// 									<p
// 										className="drag-instructions"
// 										style={{
// 											fontSize: '0.8rem',
// 											fontStyle: 'italic',
// 											margin: '10px',
// 										}}
// 									>
// 										Drag and drop notes to reorder them
// 									</p>
// 								</label>
// 							</div>
// 						</div>
// 						{copiedTexts.map((note) => (
// 							<div
// 								key={note.id}
// 								className="copied-text"
// 								draggable={true}
// 								onDragStart={(e) => handleDragStart(e, note.id)}
// 								onDragEnd={handleDragEnd}
// 								onDragOver={handleDragOver}
// 								onDrop={(e) => handleDrop(e, note.id)}
// 								style={{
// 									cursor: 'move',
// 									borderLeft:
// 										draggedItem === note.id ? '3px solid #4a90e2' : 'none',
// 									background: draggedItem === note.id ? 'grey' : '#f8f9fa',
// 								}}
// 							>
// 								<div className="copy-here">
// 									<p>{note.heading}</p>
// 									<div className="button-group">
// 										<button
// 											onClick={() => copyToClipboard(note.text, note.id)}
// 											className={`copy-btn ${
// 												copiedStates[note.id] ? 'copied' : ''
// 											}`}
// 										>
// 											{copiedStates[note.id] ? 'Copied!' : 'Copy'}
// 										</button>
// 										<button
// 											onClick={() => deleteNote(note.id)}
// 											className="delete-btn"
// 										>
// 											Delete
// 										</button>
// 									</div>
// 								</div>
// 								<div className="paste-input">
// 									<textarea rows={2} value={note.text} readOnly />
// 								</div>
// 							</div>
// 						))}
// 					</div>
// 				) : (
// 					<p>No saved texts.</p>
// 				)}
// 			</div>
// 		</div>
// 	);
// };
