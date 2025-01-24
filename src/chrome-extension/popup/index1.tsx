// import { useState } from 'react';
// import './popup.scss';

// export const Popup = () => {
// 	const [copiedTexts, setCopiedTexts] = useState([
// 		{ heading: 'Example Heading', text: 'This is the Example text format' },
// 	]);

// 	const [newHeading, setNewHeading] = useState('');
// 	const [newText, setNewText] = useState('');

// 	const addNote = () => {
// 		if (newText.trim()) {
// 			setCopiedTexts([
// 				...copiedTexts,
// 				{ heading: 'No Heading', text: newText },
// 			]);
// 			setNewHeading('');
// 			setNewText('');
// 		} else if (newHeading.trim() && newText.trim()) {
// 			setCopiedTexts([...copiedTexts, { heading: newHeading, text: newText }]);
// 			setNewHeading('');
// 			setNewText('');
// 		} else {
// 			alert('Please provide a text.');
// 		}
// 	};

// 	const clearAll = () => {
// 		setCopiedTexts([]);
// 	};

// 	const copyToClipboard = (text: string) => {
// 		navigator.clipboard
// 			.writeText(text)
// 			.then(() => {
// 				alert('Text copied to clipboard!');
// 			})
// 			.catch((err) => {
// 				console.error('Failed to copy text: ', err);
// 			});
// 	};

// 	return (
// 		<div className="popup-container">
// 			<div className="header">
// 				<div className="heading">
// 					<h1>Nostalgia</h1>
// 				</div>
// 				<br />
// 				<div className="sub-heading">
// 					<div className="pastehere">
// 						<h2>Paste here</h2>
// 						<button onClick={addNote}>Add Note</button>
// 					</div>
// 					<div className="paste-input">
// 						<input
// 							type="text"
// 							placeholder="Give a heading"
// 							value={newHeading}
// 							onChange={(e) => setNewHeading(e.target.value)}
// 						/>
// 						<textarea
// 							rows={3}
// 							placeholder="Enter text here"
// 							value={newText}
// 							onChange={(e) => setNewText(e.target.value)}
// 						/>
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
// 					copiedTexts.map((text, index) => (
// 						<div key={index} className="copied-text">
// 							<div className="copy-here">
// 								<h3>{text.heading}</h3>
// 								<button onClick={() => copyToClipboard(text.text)}>Copy</button>
// 							</div>
// 							<div className="paste-input">
// 								<textarea rows={2} value={text.text} readOnly />
// 							</div>
// 						</div>
// 					))
// 				) : (
// 					<p>No saved texts.</p>
// 				)}
// 			</div>
// 		</div>
// 	);
// };

import { useEffect, useState } from 'react';
import './popup.scss';

interface Note {
	heading: string;
	text: string;
}

// Simple storage wrapper that works with both Chrome and Brave
const storageAPI = {
	async getItem(key: string) {
		if (chrome.storage) {
			return new Promise((resolve) => {
				chrome.storage.local.get([key], (result) => {
					resolve(result[key]);
				});
			});
		}
		return null;
	},

	async setItem(key: string, value: any) {
		if (chrome.storage) {
			return new Promise<void>((resolve) => {
				chrome.storage.local.set({ [key]: value }, () => {
					resolve();
				});
			});
		}
	},

	async removeItem(key: string) {
		if (chrome.storage) {
			return new Promise<void>((resolve) => {
				chrome.storage.local.remove([key], () => {
					resolve();
				});
			});
		}
	},
};

export const Popup = () => {
	const [copiedTexts, setCopiedTexts] = useState<Note[]>([]);
	const [newHeading, setNewHeading] = useState('');
	const [newText, setNewText] = useState('');

	// Load saved notes when component mounts
	useEffect(() => {
		loadSavedNotes();
	}, []);

	// Load notes from storage
	const loadSavedNotes = async () => {
		try {
			const savedNotes = await storageAPI.getItem('notes');
			const defaultNote = [
				{
					heading: 'Example Heading',
					text: 'This is the Example text format',
				},
			];

			if (savedNotes && Array.isArray(savedNotes)) {
				setCopiedTexts(savedNotes);
			} else {
				setCopiedTexts(defaultNote);
				await storageAPI.setItem('notes', defaultNote);
			}
		} catch (error) {
			console.error('Error loading notes:', error);
		}
	};

	// Save notes to storage
	const saveNotes = async (updatedNotes: Note[]) => {
		try {
			await storageAPI.setItem('notes', updatedNotes);
			setCopiedTexts(updatedNotes);
		} catch (error) {
			console.error('Error saving notes:', error);
		}
	};

	const addNote = () => {
		if (newText.trim()) {
			const newNote = {
				heading: newHeading.trim() || 'No Heading',
				text: newText.trim(),
			};
			const updatedNotes = [...copiedTexts, newNote];
			saveNotes(updatedNotes);
			setNewHeading('');
			setNewText('');
		} else {
			alert('Please provide a text.');
		}
	};

	const clearAll = async () => {
		try {
			await storageAPI.removeItem('notes');
			setCopiedTexts([]);
		} catch (error) {
			console.error('Error clearing notes:', error);
		}
	};

	const deleteNote = (index: number) => {
		const updatedNotes = copiedTexts.filter((_, i) => i !== index);
		saveNotes(updatedNotes);
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				alert('Text copied to clipboard!');
			})
			.catch((err) => {
				console.error('Failed to copy text: ', err);
			});
	};

	return (
		<div className="popup-container">
			<div className="header">
				<div className="heading">
					<h1>Nostalgia</h1>
				</div>
				<br />
				<div className="sub-heading">
					<div className="pastehere">
						<h2>Paste here</h2>
						<button onClick={addNote}>Add Note</button>
					</div>
					<div className="paste-input">
						<input
							type="text"
							placeholder="Give a heading"
							value={newHeading}
							onChange={(e) => setNewHeading(e.target.value)}
						/>
						<textarea
							rows={3}
							placeholder="Enter text here"
							value={newText}
							onChange={(e) => setNewText(e.target.value)}
						/>
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
					copiedTexts.map((text, index) => (
						<div key={index} className="copied-text">
							<div className="copy-here">
								<h3>{text.heading}</h3>
								<div className="button-group">
									<button onClick={() => copyToClipboard(text.text)}>
										Copy
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
								<textarea rows={2} value={text.text} readOnly />
							</div>
						</div>
					))
				) : (
					<p>No saved texts.</p>
				)}
			</div>
		</div>
	);
};
