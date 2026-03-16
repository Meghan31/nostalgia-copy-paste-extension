import { useEffect, useState } from 'react';
import '../global.css';
import './options.scss';

interface Note {
	heading: string;
	text: string;
	id?: string;
}

interface CopiedState {
	[key: string]: boolean;
}

const Options = () => {
	// const [copiedTexts, setCopiedTexts] = useState([
	// 	{
	// 		heading:
	// 			'This is the headingthis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the note',
	// 		text: 'this is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the notethis is the text content in the note',
	// 	},
	// 	{
	// 		heading: 'This is the heading 2',
	// 		text: 'this is the text content in the note',
	// 	},
	// 	{
	// 		heading: 'This is the heading 3',
	// 		text: 'this is the text content in the note',
	// 	},
	// 	{
	// 		heading: 'This is the heading 4',
	// 		text: 'this is the text content in the note',
	// 	},
	// 	{
	// 		heading: 'This is the heading 5',
	// 		text: 'this is the text content in the note',
	// 	},
	// 	{
	// 		heading: 'This is the heading',
	// 		text: 'this is the text content in the note',
	// 	},
	// 	{
	// 		heading: 'This is the heading 2',
	// 		text: 'this is the text content in the note',
	// 	},
	// 	{
	// 		heading: 'This is the heading 3',
	// 		text: 'this is the text content in the note',
	// 	},
	// 	{
	// 		heading: 'This is the heading 4',
	// 		text: 'this is the text content in the note',
	// 	},
	// 	{
	// 		heading: 'This is the heading 5',
	// 		text: 'this is the text content in the note',
	// 	},
	// ]);

	const [notes, setNotes] = useState<Note[]>([]);
	const [theme, setTheme] = useState<'light' | 'dark'>('light');
	const [copiedStates, setCopiedStates] = useState<CopiedState>({});

	// Load notes
	useEffect(() => {
		chrome.storage.local.get(['notes'], (result) => {
			if (result.notes) {
				setNotes(result.notes);
			} else {
				setNotes([]);
			}
		});
	}, []);

	// Load theme preference
	useEffect(() => {
		chrome.storage.local.get(['theme'], (result) => {
			const savedTheme = result.theme || 'light';
			setTheme(savedTheme);
			document.documentElement.className =
				savedTheme === 'dark' ? 'dark-theme' : '';
		});
	}, []);

	// Toggle theme
	const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light';
		setTheme(newTheme);
		document.documentElement.className =
			newTheme === 'dark' ? 'dark-theme' : '';
		chrome.storage.local.set({ theme: newTheme });
	};

	// Function to copy text to clipboard
	const copyToClipboard = (text: string, index: number) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setCopiedStates((prev) => ({
					...prev,
					[index]: true,
				}));

				setTimeout(() => {
					setCopiedStates((prev) => ({
						...prev,
						[index]: false,
					}));
				}, 1000);
			})
			.catch((err) => {
				console.error('Failed to copy text: ', err);
				alert('Failed to copy to clipboard');
			});
	};

	// Function to delete a note
	const deleteNote = (index: number) => {
		if (window.confirm('Are you sure you want to delete this note?')) {
			const updatedNotes = notes.filter((_, i) => i !== index);
			chrome.storage.local.set({ notes: updatedNotes }, () => {
				setNotes(updatedNotes);
			});
		}
	};

	return (
		<div>
			<div className="header">
				<img src="public/192.png" alt="Nostalgia" className="icon" />
				<div className="title-container">
					<h1 className="title">Nostalgia</h1>
					<p className="subtitle">Copy-Paste Note Saver</p>
				</div>
				<div className="theme-toggle">
					<button
						onClick={toggleTheme}
						className="theme-toggle-btn"
						aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
					>
						<span className="theme-label">{theme} mode</span>
						<div className="toggle-switch">
							<div className="toggle-slider"></div>
						</div>
					</button>
				</div>
			</div>
			<div className="content">
				<p className="all-notes">All Notes</p>
				<div className="tiles">
					{notes.length > 0 ? (
						notes.map((note, index) => (
							<div key={index} className="copied-text">
								<div className="copy-here">
									<h3>{note.heading}</h3>
									<div className="btns">
										<button
											onClick={() => copyToClipboard(note.text, index)}
											className={`copy-btn ${
												copiedStates[index] ? 'copied' : ''
											}`}
										>
											{copiedStates[index] ? 'Copied!' : 'Copy'}
										</button>
										<button
											onClick={() => deleteNote(index)}
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
						))
					) : (
						<p className="no-notes">No saved notes yet. Create notes from the extension popup!</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default Options;
