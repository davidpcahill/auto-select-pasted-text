// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.onDidChangeTextDocument(async (event) => {
        let isEnabled = vscode.workspace.getConfiguration().get('autoSelectPastedText.enabled', true);

        if (!isEnabled) {
            // If the extension is disabled, just run the default paste command
            await vscode.commands.executeCommand('default:paste');
            return;
        }

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // Check for the latest content change
        let contentChanges = event.contentChanges;
        if (contentChanges && contentChanges.length > 0) {
            let contentChange = contentChanges[contentChanges.length - 1]; // Get the last change

            let start = contentChange.range.start;
            let end = new vscode.Position(start.line, start.character + contentChange.text.length);
            
            // Set the new selection
            editor.selection = new vscode.Selection(start, end);
        }
    });
}

// This method is called when your extension is deactivated
export function deactivate() {}
