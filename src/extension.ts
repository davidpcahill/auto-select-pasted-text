import * as vscode from 'vscode';

let lastPastedContent: string | null = null;

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel("AutoSelectPaste");

    outputChannel.appendLine('Activating AutoSelectPaste extension...');

    let pasteCommandDisposable = vscode.commands.registerCommand('editor.action.clipboardPasteAction', async () => {
        outputChannel.appendLine('Paste command executed.');

        const clipboardContent = await vscode.env.clipboard.readText();

        if (clipboardContent) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                let targetSelection: vscode.Selection;

                // If the clipboard content matches the last pasted content, append after the current selection.
                if (clipboardContent === lastPastedContent) {
                    const currentPosition = editor.selection.end;
                    targetSelection = new vscode.Selection(currentPosition, currentPosition);
                } else {
                    targetSelection = editor.selection;
                    lastPastedContent = clipboardContent;  // Update the last pasted content
                }

                const linesPasted = clipboardContent.split('\n');
                const lastLineLength = linesPasted[linesPasted.length - 1].length;

                editor.edit((editBuilder) => {
                    editBuilder.replace(targetSelection, clipboardContent);
                }).then((success) => {
                    if (success) {
                        outputChannel.appendLine("Content pasted successfully.");

                        // Calculate the end position for the selection after paste
                        const endLine = targetSelection.start.line + linesPasted.length - 1;
                        const endCharacter = (linesPasted.length === 1) ? (targetSelection.start.character + lastLineLength) : lastLineLength;
                        const endPosition = new vscode.Position(endLine, endCharacter);

                        // Create a new selection that covers the pasted content
                        editor.selection = new vscode.Selection(targetSelection.start, endPosition);
                        editor.revealRange(new vscode.Range(targetSelection.start, endPosition), vscode.TextEditorRevealType.Default);
                    } else {
                        outputChannel.appendLine("Failed to paste content.");
                    }
                });
            }
        } else {
            outputChannel.appendLine('Clipboard is empty.');
        }
    });

    context.subscriptions.push(pasteCommandDisposable);

    // Log changes to text editor selection for debugging purposes
    vscode.window.onDidChangeTextEditorSelection((event) => {
        if (event.textEditor.document.uri.scheme === 'file') {
            const selections = event.selections;
            if (selections && selections.length > 0) {
                const selection = selections[0];
                outputChannel.appendLine(`Selection changed: Start(${selection.start.line}, ${selection.start.character}), End(${selection.end.line}, ${selection.end.character})`);
            }
        }
    });
}
