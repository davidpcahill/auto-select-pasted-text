import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	// A flag to determine if the last action by the user was a paste action.
	let hasPastedRecently = false;

	// Monitor changes in the text document (like pasting).
	vscode.workspace.onDidChangeTextDocument(event => {
		// Only proceed if a paste action was detected previously.
		if (!hasPastedRecently) {
			return;
		}

		// Check if the auto-selection feature is enabled in settings.
		let isEnabled = vscode.workspace.getConfiguration().get('autoSelectPastedText.enabled', true);
		if (!isEnabled) {
			return;
		}

		// Get the currently active editor.
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		// Determine the range of the pasted content.
		let contentChanges = event.contentChanges;
		if (contentChanges && contentChanges.length > 0) {
			let contentChange = contentChanges[contentChanges.length - 1];
			let start = contentChange.range.start;
			let end = new vscode.Position(start.line, start.character + contentChange.text.length);

			// Highlight (select) the pasted content.
			editor.selection = new vscode.Selection(start, end);
		}

		// Reset for future paste actions.
		hasPastedRecently = false;
	});

	// Override the default paste action to set our flag and then perform the normal paste.
	vscode.commands.registerCommand('editor.action.clipboardPasteAction', async () => {
		hasPastedRecently = true;
		await vscode.commands.executeCommand('default:paste');
	});

	// Deselect text if the user changes the active editor or navigates to another file.
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			const position = editor.selection.active;
			editor.selection = new vscode.Selection(position, position);
		}
	});

	// Deselect text if all selected content is deleted.
	vscode.window.onDidChangeTextEditorSelection(event => {
		if (event.selections[0].isEmpty) {
			const position = event.selections[0].active;
			event.textEditor.selection = new vscode.Selection(position, position);
		}
	});
}

export function deactivate() { }
