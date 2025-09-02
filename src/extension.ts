import * as vscode from 'vscode';
import { ErrorDetector } from './errorDetector';
import { SoundPlayer } from './soundPlayer';

let errorDetector: ErrorDetector;
let soundPlayer: SoundPlayer;

export function activate(context: vscode.ExtensionContext) {
    soundPlayer = new SoundPlayer(context.extensionPath);
    errorDetector = new ErrorDetector(soundPlayer);

    const toggleCommand = vscode.commands.registerCommand('errorSoundPlayer.toggle', () => {
        const config = vscode.workspace.getConfiguration('errorSoundPlayer');
        const currentState = config.get('enabled', true);
        config.update('enabled', !currentState, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Error sounds ${!currentState ? 'enabled' : 'disabled'}`);
    });

    const testCommand = vscode.commands.registerCommand('errorSoundPlayer.test', () => {
        vscode.window.showInformationMessage('Testing error sound');
        soundPlayer.playErrorSound('general');
    });

    const diagnosticListener = vscode.languages.onDidChangeDiagnostics(e => {
        errorDetector.handleDiagnosticChange(e);
    });

    const configListener = vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('errorSoundPlayer')) {
            errorDetector.updateConfiguration();
        }
    });

    context.subscriptions.push(
        toggleCommand,
        testCommand,
        diagnosticListener,
        configListener
    );

    errorDetector.startMonitoring();
    vscode.window.showInformationMessage('Error Sound Player activated!');
}

export function deactivate() {
    errorDetector?.stopMonitoring();
}