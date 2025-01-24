import { useEffect, useState } from 'react';
import './popup.scss';

interface Note {
	heading: string;
	text: string;
}

export const Popup = () => {
	const [copiedTexts, setCopiedTexts] = useState<Note[]>([]);
	const [newHeading, setNewHeading] = useState('');
	const [newText, setNewText] = useState('');

	// Load saved notes when component mounts
	useEffect(() => {
		loadSavedNotes();
	}, []);

	// Load notes from chrome.storage.local
	const loadSavedNotes = () => {
		chrome.storage.local.get(['notes'], (result) => {
			if (result.notes) {
				setCopiedTexts(result.notes);
			} else {
				// Set default example note if no saved notes exist
				const defaultNote = [
					{
						heading: 'Example Heading',
						text: 'This is the Example text format',
					},
				];
				setCopiedTexts(defaultNote);
				chrome.storage.local.set({ notes: defaultNote });
			}
		});
	};

	// Save notes to chrome.storage.local
	const saveNotes = (updatedNotes: Note[]) => {
		chrome.storage.local.set({ notes: updatedNotes }, () => {
			setCopiedTexts(updatedNotes);
		});
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

	const clearAll = () => {
		chrome.storage.local.remove(['notes'], () => {
			setCopiedTexts([]);
		});
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
				<div className="title">
					<img src="public/48.png" alt="Nostalgia" className="icon" />
					<div className="heading">
						<h1>Nostalgia</h1>
					</div>
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
									<button
										onClick={() => copyToClipboard(text.text)}
										className="copy-btn"
									>
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
