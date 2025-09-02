import * as vscode from 'vscode';
import { SoundPlayer } from './soundPlayer';

export class ErrorDetector {
    private soundPlayer: SoundPlayer;
    private lastErrorCount: Map<string, number> = new Map();
    private debounceTimer?: NodeJS.Timeout;
    private config: vscode.WorkspaceConfiguration;
    private lastNotification: Thenable<string | undefined> | null = null;

    constructor(soundPlayer: SoundPlayer) {
        this.soundPlayer = soundPlayer;
        this.config = vscode.workspace.getConfiguration('errorSoundPlayer');
    }

    public updateConfiguration(): void {
        this.config = vscode.workspace.getConfiguration('errorSoundPlayer');
    }

    public startMonitoring(): void {
        this.scanExistingDiagnostics();
    }

    public stopMonitoring(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }

    public handleDiagnosticChange(event: vscode.DiagnosticChangeEvent): void {
        if (!this.config.get('enabled', true)) {
            return;
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.processDiagnosticChanges(event.uris);
        }, 50);
    }

    private scanExistingDiagnostics(): void {
        const diagnostics = vscode.languages.getDiagnostics();
        for (const [uri, diags] of diagnostics) {
            const errorCount = this.countErrors(diags);
            this.lastErrorCount.set(uri.toString(), errorCount);
        }
    }

    private processDiagnosticChanges(uris: readonly vscode.Uri[]): void {
        for (const uri of uris) {
            const diagnostics = vscode.languages.getDiagnostics(uri);
            const currentErrorCount = this.countErrors(diagnostics);
            const previousErrorCount = this.lastErrorCount.get(uri.toString()) || 0;
            if (currentErrorCount > previousErrorCount) {
                this.handleNewErrors(uri, diagnostics);
            }
            this.lastErrorCount.set(uri.toString(), currentErrorCount);
        }
    }

    private countErrors(diagnostics: readonly vscode.Diagnostic[]): number {
        return diagnostics.filter(diag => diag.severity === vscode.DiagnosticSeverity.Error).length;
    }

    private handleNewErrors(uri: vscode.Uri, diagnostics: readonly vscode.Diagnostic[]): void {
        const errors = diagnostics.filter(diag => diag.severity === vscode.DiagnosticSeverity.Error);
        if (errors.length === 0) return;
        const errorType = this.categorizeError(errors[0]);
        const delay = this.config.get('soundDelay', 500);
        setTimeout(() => {
            this.soundPlayer.playErrorSound(errorType);
            // Show notification popup with error message and Dismiss button
            if (this.lastNotification) {
                // No API to programmatically close, but this prevents stacking
                this.lastNotification = null;
            }
            this.lastNotification = vscode.window.showInformationMessage(errors[0].message, 'Dismiss');
        }, delay);
    }

    private categorizeError(diagnostic: vscode.Diagnostic): string {
        const message = diagnostic.message.toLowerCase();
        if (message.includes('syntax') || message.includes('parse')) return 'syntax';
        if (message.includes('type') || message.includes('cannot find')) return 'type';
        if (message.includes('reference') || message.includes('undefined')) return 'reference';
        if (message.includes('import') || message.includes('module')) return 'import';
        return 'general';
    }
}