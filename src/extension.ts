import * as vscode from 'vscode';

// Flag to track if the selection was auto-selected after pasting
let autoSelected: boolean = false;
let manualMouseSelected: boolean = false;
let manualKeyboardSelected: boolean = false;

export function activate(context: vscode.ExtensionContext) {
    // Create an output channel for logging extension-related activities
    const outputChannel = vscode.window.createOutputChannel("AutoSelectPastedText");

    // Function to handle conditional logging based on the enableLogging setting
    const log = (message: string) => {
        const enableLogging = vscode.workspace.getConfiguration('autoSelectPastedText').get('enableLogging');
        if (enableLogging) {
            outputChannel.appendLine(message);
        }
    };

    context.subscriptions.push(vscode.commands.registerCommand('autoSelectPastedText.toggleAutoSelection', () => {
        const currentSetting = vscode.workspace.getConfiguration('autoSelectPastedText').get('enableAutoSelection');
        vscode.workspace.getConfiguration('autoSelectPastedText').update('enableAutoSelection', !currentSetting, true);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('autoSelectPastedText.toggleLogging', () => {
        const currentSetting = vscode.workspace.getConfiguration('autoSelectPastedText').get('enableLogging');
        vscode.workspace.getConfiguration('autoSelectPastedText').update('enableLogging', !currentSetting, true);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('autoSelectPastedText.toggleTypeDetection', () => {
        const currentSetting = vscode.workspace.getConfiguration('autoSelectPastedText').get('enableTypeDetection');
        vscode.workspace.getConfiguration('autoSelectPastedText').update('enableTypeDetection', !currentSetting, true);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('autoSelectPastedText.toggleManualSelection', () => {
        const currentSetting = vscode.workspace.getConfiguration('autoSelectPastedText').get('enableManualSelection');
        vscode.workspace.getConfiguration('autoSelectPastedText').update('enableManualSelection', !currentSetting, true);
    }));

    // Indicate activation in the output channel
    log('Activating autoSelectPastedText extension...');

    // Register the type command to handle the deselection behavior
    vscode.commands.registerCommand('type', (args) => {
        const editor = vscode.window.activeTextEditor;
        const enableTypeDetection = vscode.workspace.getConfiguration('autoSelectPastedText').get('enableTypeDetection');

        if (editor) {
            const currentSelection = editor.selection;

            if (enableTypeDetection && autoSelected && !currentSelection.isEmpty) {
                const currentPosition = currentSelection.end;
                editor.selection = new vscode.Selection(currentPosition, currentPosition);
            }
        }
        vscode.commands.executeCommand('default:type', args);
    });


    // Register the paste command
    let pasteCommandDisposable = vscode.commands.registerCommand('editor.action.clipboardPasteAction', async () => {
        const enableAutoSelection = vscode.workspace.getConfiguration('autoSelectPastedText').get('enableAutoSelection');
        const enableManualSelection = vscode.workspace.getConfiguration('autoSelectPastedText').get('enableManualSelection');

        if (manualMouseSelected || manualKeyboardSelected) {
            autoSelected = false;
        }

        log('Paste command executed.');

        // Read content from clipboard
        const clipboardContent = await vscode.env.clipboard.readText();

        if (clipboardContent) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                let targetSelection: vscode.Selection;

                // Determine the target for the paste: either append after the current selection or replace it
                if (autoSelected || enableManualSelection) {
                    const currentPosition = editor.selection.end;
                    targetSelection = new vscode.Selection(currentPosition, currentPosition);
                } else {
                    targetSelection = editor.selection;
                }

                // Split content by lines to calculate the selection end position later
                const linesPasted = clipboardContent.split('\n');
                const lastLineLength = linesPasted[linesPasted.length - 1].length;

                editor.edit((editBuilder) => {
                    // Replace the determined target selection with the clipboard content
                    editBuilder.replace(targetSelection, clipboardContent);
                }).then((success) => {
                    if (success) {
                        outputChannel.appendLine("Content pasted successfully.");

                        // Determine the end position for the selection post-paste
                        const endLine = targetSelection.start.line + linesPasted.length - 1;
                        const endCharacter = (linesPasted.length === 1) ? (targetSelection.start.character + lastLineLength) : lastLineLength;
                        const endPosition = new vscode.Position(endLine, endCharacter);

                        if (enableAutoSelection) {
                            // Adjust the selection to cover the pasted content
                            editor.selection = new vscode.Selection(targetSelection.start, endPosition);
                            autoSelected = true;
                        }
                        // Reveal the pasted content in the editor
                        editor.revealRange(new vscode.Range(targetSelection.start, endPosition), vscode.TextEditorRevealType.Default);
                    } else {
                        outputChannel.appendLine('Clipboard is empty.');
                    }
                });
            }
        }
        // At the end of this command, reset the manual selection flags:
        manualMouseSelected = false;
        manualKeyboardSelected = false;
    });

    // Add the paste command disposable to the extension context's subscriptions
    context.subscriptions.push(pasteCommandDisposable);

    // Debug: Log selection changes in the editor for tracking
    vscode.window.onDidChangeTextEditorSelection((event) => {
        if (event.kind === vscode.TextEditorSelectionChangeKind.Mouse) {
            manualMouseSelected = true;
        } else if (event.kind === vscode.TextEditorSelectionChangeKind.Keyboard) {
            manualKeyboardSelected = true;
        }

        if (event.textEditor.document.uri.scheme === 'file') {
            autoSelected = event.kind === 3;
            const selections = event.selections;
            if (selections && selections.length > 0) {
                const selection = selections[0];
                log(`Selection changed: Start(${selection.start.line}, ${selection.start.character}), End(${selection.end.line}, ${selection.end.character})`);
            }
        }
    });
}
