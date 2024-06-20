# AudioControls

Typescript implementation of audio recording, playback and simulated waveform display based on the MediaRecorder API.

Example:
```
        let recordButton = document.getElementById('recordButton')
        recordButton.addEventListener(
            'AudioControls.RecordingStarted',
            (event) => {
                let button = $('#recordButton')
                let text = button.text()
                if (button.text() === 'Stop Recording') {
                    return false
                }
                button.text('Stop Recording')
            }
        )
        recordButton.addEventListener(
            'AudioControls.RecordingStopped',
            (event) => {
                let button = $('#recordButton')
                let text = button.text()
                if (button.text() === 'Record') {
                    return false
                }
                button.text('Record')
                    .prop('disabled', true)

                $('#playButton').prop('disabled', false)
            }
        )

        const thing = new AudioControls(
            'recordButton',
            undefined,
            'waveform',
        );
```

## Configuration

**AudioControls** takes as configuration parameters the HTML element IDs of the elements used to start recording, stop recording, start playback, stop playback and an HTML "canvas" to potentialy display a simulated waveform of the recorded audio.  If the "stop" element IDs are undefined the "start" IDs will be used for both purposes. In addition there are parameters for the waveform fore and background colors; the maximum recording time in miliseconds; and, the recording sampole rate in Miliseconds

- @param {string} `recordStartButtonId` - **required** - DOM Element ID of the Recording Start button.
- @param {string?} `recordStopButtonId` - optional - DOM Element ID of the Recording Stop button. If not defined it will use the recordStartButtonId value.
- @param {string} `playStartButtonId` - **required** - DOM Element ID of the Play Start button. If not defined playback using this module will be disabled.
- @param {string?} `playStopButtonId` - optional - DOM Element ID of the Play Stop button. If not defined it will use the recordStartButtonId value.
- @param {string?} `waveformCanvasId` - optional - DOM Element ID of the HTML canvas used for the graphical display of the recorded audio waveform. If not defined waveform rendering will be disabled.
- @param {string?} `waveformBackgroundCSS` - optional - A valid CSS color string value for the background: "rgba(0,0,0,1)", "black", etc. Default is "black".
- @param {string?} `waveformForegroundCSS` - optional - A valid CSS color string value for the foreground color: "rgba(0,0,0,1)", "black", etc. Default is "white".
- @param {number?} `maxRecordingTimeMsec` - optional - The maximum number of milliseconds to record before forcing a stop and raising a stop event. Default is 1 minute = 1000*60 = 60000. Note: recording time directly correlates to collected data size.  
- @param {number?} `recordingSampleRateMsec` - optional - The number of milliseconds between recording data "saves". This influences how frequently the waveform display is redrawn. Default is 100 milliseconds. Note: the data used in each redraw cycle is scaled to fit within the available canvas bounds. This can suggest initially LOUD events when recording starts but the probably quiet ambient background sound will be scaled up. Subsequent redraws will "shrink" the initial arifact down to nearly nothing.

## Emited Exceptions

- @throws `NoAudioInputs` - if there are no audio inputs.
- Other events from the various other API methods can be raised.

## Emited Events

**AudioControls** will emit:

  - `AudioControls.RecordingStarted` - The recording process has started.
  - `AudioControls.RecordingStopped` - Recording has stopped.
  - `AudioControls.PlayingStarted` - Playback has started.
  - `AudioControls.PlayingStopped` - Playback has stopped
  - `AudioControls.RecordingTimeExceeded` - Recording time has exceeded the specified maximum.
