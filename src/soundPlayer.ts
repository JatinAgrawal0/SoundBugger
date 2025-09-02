import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
const player = require('play-sound')({});
const wavPlayer = require('node-wav-player');

export class SoundPlayer {
    private extensionPath: string;
    private soundsPath: string;
    private currentProcess: any = null;

    constructor(extensionPath: string) {
        this.extensionPath = extensionPath;
        this.soundsPath = path.join(extensionPath, 'sounds');
        this.ensureSoundsFolder();
    }

    private ensureSoundsFolder(): void {
        if (!fs.existsSync(this.soundsPath)) {
            fs.mkdirSync(this.soundsPath, { recursive: true });
            this.createDefaultSounds();
        }
    }

    private createDefaultSounds(): void {
        vscode.window.showInformationMessage(
            `Add sound files to: ${this.soundsPath}\nSupported formats: .wav, .mp3, .ogg, .m4a\nAny file in this folder will be played randomly on error.\nUsing system beep as fallback.`
        );
    }

    private isAudioFile(fileName: string): boolean {
        const audioExtensions = ['.wav', '.mp3', '.ogg', '.m4a'];
        return audioExtensions.includes(path.extname(fileName).toLowerCase());
    }

    public async playErrorSound(errorType: string): Promise<void> {
        this.stopSound(); // Stop any previous sound before playing a new one
        try {
            const config = vscode.workspace.getConfiguration('errorSoundPlayer');
            if (!config.get('enabled', true)) return;
            const allFiles = fs.readdirSync(this.soundsPath);
            const audioFiles = allFiles.filter(f => this.isAudioFile(f));
            if (audioFiles.length === 0) return this.playSystemBeep();
            const randomSound = audioFiles[Math.floor(Math.random() * audioFiles.length)];
            const soundPath = path.join(this.soundsPath, randomSound);
            if (!fs.existsSync(soundPath) || fs.statSync(soundPath).size === 0) return this.playSystemBeep();
            await this.playAudioFile(soundPath);
        } catch {
            this.playSystemBeep();
        }
    }

    public stopSound(): void {
        if (this.currentProcess) {
            try {
                if (typeof this.currentProcess.kill === 'function') {
                    this.currentProcess.kill();
                } else if (typeof this.currentProcess.stop === 'function') {
                    this.currentProcess.stop();
                }
            } catch {}
            this.currentProcess = null;
        }
        if (process.platform === 'win32' && wavPlayer && typeof wavPlayer.stop === 'function') {
            try { wavPlayer.stop(); } catch {}
        }
    }

    private async playAudioFile(filePath: string): Promise<void> {
        try {
            const platform = process.platform;
            let opts: any = {};
            if (platform === 'win32') {
                try {
                    this.currentProcess = await wavPlayer.play({ path: filePath, sync: false });
                } catch {
                    this.playSystemBeep();
                }
                return;
            }
            if (platform === 'darwin') {
                opts = { afplay: ['-v', '1'] };
            } else if (platform === 'linux') {
                opts = { ffplay: ['-volume', '100', '-nodisp', '-autoexit'] };
            }
            this.currentProcess = player.play(filePath, opts, (err: Error | null) => {
                this.currentProcess = null;
                if (err) this.playSystemBeep();
            });
        } catch {
            this.playSystemBeep();
        }
    }

    private playSystemBeep(): void {
        try {
            const platform = process.platform;
            const { exec } = require('child_process');
            if (platform === 'win32') {
                exec('powershell -c "Write-Host `a"', (error: Error | null) => {
                    if (error) exec('powershell -c "[console]::beep(800,300)"');
                });
            } else if (platform === 'darwin') {
                exec('tput bel', (error: Error | null) => {
                    if (error) exec('osascript -e "beep"');
                });
            } else {
                exec('echo -e "\\a"', (error: Error | null) => {
                    if (error) exec('speaker-test -t sine -f 1000 -l 1');
                });
            }
        } catch {}
    }

    public getSoundsPath(): string {
        return this.soundsPath;
    }
}