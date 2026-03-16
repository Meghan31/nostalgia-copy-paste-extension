import { useEffect, useState } from 'react';
import '../global.css';
import './options.scss';

interface Note {
	heading: string;
	text: string;
}

// Function to copy text to clipboard
const copyToClipboard = (text: string) => {
	navigator.clipboard
		.writeText(text)
		.then(() => {
			alert('Text copied to clipboard');
		})
		.catch((err) => {
			console.error('Failed to copy text: ', err);
		});
};

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

	useEffect(() => {
		chrome.storage.local.get(['notes'], (result) => {
			if (result.notes) {
				setNotes(result.notes);
			} else {
				setNotes([]);
			}
		});
	}, []);

	// Function to delete a note
	const deleteNote = (index: number) => {
		const updatedNotes = notes.filter((_, i) => i !== index);
		chrome.storage.local.set({ notes: updatedNotes }, () => {
			setNotes(updatedNotes);
		});
	};

	return (
		<div>
			<div className="header">
				<img src="public/192.png" alt="Nostalgia" className="icon" />
				<div className="title">Nostalgia Copy-Paste Note Saver</div>
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
											onClick={() => copyToClipboard(note.text)}
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
									<textarea rows={2} value={note.text} readOnly />
								</div>
							</div>
						))
					) : (
						<p>No saved texts.</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default Options;
