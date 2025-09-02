# Error Sound Player

A VS Code extension that plays customizable audio alerts when compiler errors are detected. Get instant audio feedback when your code has errors, helping you catch issues faster while coding.

## Features

- **🔊 Audio Error Alerts**: Plays sounds when new compiler errors are detected
- **🎵 Custom Sounds**: Use your own `.wav`, `.mp3`, `.ogg`, or `.m4a` files
- **🌍 Cross-Platform**: Works on Windows, macOS, and Linux
- **⚙️ Configurable**: Adjustable volume, delay, and enable/disable options
- **📢 Visual Notifications**: Shows error messages in popups with dismiss option
- **🎯 Language Support**: Works with any language that provides VS Code diagnostics (TypeScript, JavaScript, Python, C++, Java, C#, Go, Rust, PHP, Ruby, and more)
- **🔇 Easy Toggle**: Quick command to enable/disable sounds
- **🧪 Test Function**: Test your sounds with a simple command

## Installation

1. Install from the VS Code Marketplace
2. Reload VS Code
3. The extension will create a `sounds` folder in its directory
4. Add your custom sound files to this folder (optional - uses system beep as fallback)

## Usage

The extension automatically detects compiler errors and plays sounds. No configuration required!

**Commands:**
- `Error Sound Player: Toggle Error Sounds` - Enable/disable the extension
- `Error Sound Player: Test Error Sound` - Test your current sound setup

## Extension Settings

This extension contributes the following settings:

- `errorSoundPlayer.enabled`: Enable/disable error sounds (default: `true`)
- `errorSoundPlayer.volume`: Volume level for error sounds (default: `0.5`)
- `errorSoundPlayer.soundDelay`: Delay between sounds in milliseconds (default: `500`)

## Custom Sounds

To use custom sounds:

1. Navigate to the extension's sounds folder (path shown in the welcome message)
2. Add your audio files (`.wav`, `.mp3`, `.ogg`, `.m4a`)
3. The extension will randomly select from available files
4. If no custom sounds are found, it uses the system beep

## Supported File Formats

- `.wav` - Best compatibility and performance
- `.mp3` - Good compression and compatibility
- `.ogg` - Open source format
- `.m4a` - High quality, smaller files

## Requirements

- VS Code 1.74.0 or higher
- Audio output capability on your system

## Known Issues

- Deprecation warnings may appear from audio dependencies (these don't affect functionality)
- Volume control is limited by system audio backends

## Release Notes

### 0.0.1

Initial release featuring:
- Basic error sound detection
- Custom sound file support
- Cross-platform audio playback
- Visual error notifications
- Configurable settings
- Toggle and test commands

---

## Support

If you encounter any issues or have feature requests, please create an issue on the project repository.

**Enjoy coding with audio feedback!**
