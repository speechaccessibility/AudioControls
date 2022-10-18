/*
 MIT License

 Copyright (c) 2022 The Speech Accessibility Project,
 The Beckman Institute,
 University of Illinois, Urbana-Champaign

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

export class AudioControls {
	private chunks: Blob[] = [];
	private mediaRecorder?: MediaRecorder;
	private stream?: MediaStream;
	private unsavedAudio: Blob = new Blob();

	// constructor params
	private readonly playStartButtonId: string;
	private readonly playStopButtonId: string;
	private readonly recordStartButtonId: string;
	private readonly recordStopButtonId: string;

	private readonly waveformCanvasId: string;
	private readonly waveformBackgroundCSS: string = 'black'
	private readonly waveformForegroundCSS: string = 'white'

	private readonly maxRecordingTimeMsec: number = 60000
	private readonly recordingSampleRateMsec: number = 100

	availableInputDevices: MediaDeviceInfo[] = [];

	private recordingTimeExceededId: NodeJS.Timeout;
	private isRecording: boolean = false
	private isPlaying: boolean = false

	//
	// Events
	public eventStartedRecording = new CustomEvent(
		'AudioControls.RecordingStarted'
	)
	public eventStopRecording = new CustomEvent(
		'AudioControls.RecordingStopped'
	)
	public eventStartPlaying = new CustomEvent(
		'AudioControls.PlayingStarted'
	)
	public eventStopPlaying = new CustomEvent(
		'AudioControls.PlayingStopped'
	)
	public recordingTimeExceeded = new CustomEvent(
		'AudioControls.RecordingTimeExceeded'
	)

	/**
	 *  Setup basic audio recording in the browser.
	 *
	 *  @constructor
	 *  @param {string} recordStartButtonId - required - DOM Element ID of the
	 *                  Recording Start button.
	 *  @param {string?} recordStopButtonId - optional - DOM Element ID of the
	 *                  Recording Stop button. If not defined it will use the
	 *                  recordStartButtonId value.
	 *  @param {string} playStartButtonId - required - DOM Element ID of the
	 *                  Play Start button. If not defined playback using
	 *                  this module will be disabled.
	 *  @param {string?} playStopButtonId - optional - DOM Element ID of the
	 *                  Play Stop button. If not defined it will use the
	 *                  recordStartButtonId value.
	 *  @param {string?} waveformCanvasId - optional - DOM Element ID of the
	 *                  HTML canvas used for the graphical display of the
	 *                  recorded audio waveform. If not defined waveform
	 *                  rendering will be disabled.
	 *  @param {string?} waveformBackgroundCSS - optional - A valid CSS color
	 *                  string value for the background: "rgba(0,0,0,1)",
	 *                  "black", etc. Default is "black".
	 *  @param {string?} waveformForegroundCSS - optional - A valid CSS color
	 *                  string value for the foreground color: "rgba(0,0,0,1)",
	 *                  "black", etc. Default is "white".
	 *  @param {number?} maxRecordingTimeMsec - optional - The maximum
	 *                  number of milliseconds to record before forcing a
	 *                  stop and raising a stop event. A value of zero
	 *                  means unlimited recording time -- which often means
	 *                  that a browser tab can run out of memory, FYI. Default
	 *                  is 1 minute = 1000*60 = 60000.
	 *  @param {number?} recordingSampleRateMsec - optional - The number of
	 *                  milliseconds between recording data "saves". This
	 *                  influences how frequently the waveform display is
	 *                  redrawn. Default is 100 milliseconds.
	 *
	 * @throws NoAudioInputs - if there are no audio inputs found.
	 */
	constructor(recordStartButtonId: string,
	            recordStopButtonId: string | undefined = undefined,
	            playStartButtonId: string | undefined  = undefined,
	            playStopButtonId: string | undefined   = undefined,
	            waveformCanvasId: string | undefined   = undefined,
	            waveformBackgroundCSS: string          = "black",
	            waveformForegroundCSS: string          = "white",
	            maxRecordingTimeMsec: number           = 60000,
	            recordingSampleRateMsec: number        = 100) {
		// RECORD START/STOP BUTTONS
		// recordStartButtonId is REQUIRED
		if (typeof recordStartButtonId != 'string') {
			throw new Error(`recordStartButtonId should be a string.`)
		}
		if (!(recordStartButtonId && recordStartButtonId.trim())) {
			throw new Error(`recordStartButtonId is required.`)
		}
		if (!document.getElementById(recordStartButtonId)) {
			throw new Error(
				`recordStartButtonId value "${recordStartButtonId}" does not `
				+ `exist in the DOM.`
			)
		}
		this.recordStartButtonId = recordStartButtonId
		// if recordStopButtonId is undefined make this.recordStopButtonId
		// the same as this.recordStartButtonId
		let tmpType = typeof recordStopButtonId
		if (tmpType != 'string' && tmpType != 'undefined') {
			throw new Error(
				`recordStopButtonId should be a string or undefined.`
			)
		}
		this.recordStopButtonId = recordStopButtonId
		if (!recordStopButtonId) {
			this.recordStopButtonId = this.recordStartButtonId
		}

		// PLAYBACK BUTTONS
		if (playStartButtonId) {
			if (typeof playStartButtonId != 'string') {
				throw new Error(`playStartButtonId should be a string.`)
			}
			if (!document.getElementById(playStartButtonId)) {
				throw new Error(
					`playStartButtonId value "${playStartButtonId}" does not `
					+ `exist in the DOM.`
				)
			}
			this.playStartButtonId = playStartButtonId
			// if options['playStopButtonId'] is undefined make
			// this.playStopButtonId the same as this.playStartButtonId
			this.playStopButtonId = playStopButtonId
			if (!playStopButtonId) {
				this.playStopButtonId = this.playStartButtonId
			}
		}

		// WAVEFORM CANVAS
		if (waveformCanvasId) {
			if (typeof waveformCanvasId != 'string') {
				throw new Error(`waveformCanvasId should be a string.`)
			}
			if (!document.getElementById(waveformCanvasId)) {
				throw new Error(
					`waveformCanvasId value "${waveformCanvasId}" does not `
					+ `exist in the DOM.`
				)
			}
			this.waveformCanvasId = waveformCanvasId

			if (waveformBackgroundCSS) {
				if (typeof waveformBackgroundCSS != 'string') {
					throw new Error(`waveformBackgroundCSS should be a string.`)
				}
				this.waveformBackgroundCSS = waveformBackgroundCSS
			}
			if (waveformForegroundCSS) {
				if (typeof waveformForegroundCSS != 'string') {
					throw new Error(`waveformForegroundCSS should be a string.`)
				}
				this.waveformForegroundCSS = waveformForegroundCSS
			}
		}

		// MAX RECORDING TIME
		if (typeof maxRecordingTimeMsec != 'number') {
			throw new Error(
				`maxRecordingTimeMsec should be a number in `
				+ `milliseconds.`
			)
		}
		this.maxRecordingTimeMsec = Math.trunc(maxRecordingTimeMsec)

		if (typeof recordingSampleRateMsec != 'number') {
			throw new Error(
				`recordingSampleRateMsec should be a number in `
				+ `milliseconds.`
			)
		}
		if (recordingSampleRateMsec) {
			this.recordingSampleRateMsec = Math.trunc(recordingSampleRateMsec)
			if (this.recordingSampleRateMsec === 0) {
				throw new Error("Recording Sample Rate value is zero.")
			}
		}

		//
		// get list of available input devices. The "list" is probably not
		// useful but the number of potential devices is.
		navigator.mediaDevices.enumerateDevices().then(devices => {
			this.availableInputDevices = devices.filter(
				(d) => d.kind === 'audioinput'
			)

			if (!this.availableInputDevices.length) {
				throw new NoAudioInputs("No input devices found.")
			}
		})

		this.initializeRecording().catch(
			reason => {
				throw new Error(reason);
			}
		);
	}

	/**
	 * If there is at least one input device potentially signal the user to
	 * grant access.
	 *
	 * @throws Exceptions are possible from navigator.mediaDevices.getUserMedia
	 */
	private async initializeRecording() {
		//
		// possibly request permission to use an input device.
		await navigator.mediaDevices.getUserMedia(
			{
				audio: true,
				video: false
			}
		).then(
			stream => {
				if (!stream) {
					throw new Error('No MediaStream "stream" found.');
				}
				this.stream = stream;

				//
				// setup primary event listeners
				const recordStartButton = document.getElementById(
					this.recordStartButtonId
				)
				recordStartButton.addEventListener(
					"click",
					() => {
						if (this.isRecording) {
							return false
						}
						this.startRecording()
					}
				)

				const recordStopButton = document.getElementById(
					this.recordStopButtonId
				)
				recordStopButton.addEventListener(
					"click",
					() => {
						if (!this.isRecording) {
							return false
						}
						this.mediaRecorder.stop();
					}
				)

				const playStartButton = document.getElementById(
					this.playStartButtonId
				)
				playStartButton.addEventListener(
					"click",
					() => {
						this.playRecording();
					}
				)
			}
		).catch(
			reason => {
				throw new Error(reason);
			}
		);
	}

	/**
	 * StartRecording sets up a MediaRecorder instance to begin recording.
	 * If this is called with existing recorded data the existing data is
	 * ERASED before re-starting MediaRecorder.
	 *
	 * This sets up event handlers for MediaRecorder 'dataavailable' and
	 * 'stop' events and issues the MediaRecorder 'start()' routine.
	 *
	 * @DOM_events AudioControls.RecordingStarted - when the first chunk of
	 *  audio data is available.
	 *
	 * @returns {Promise}
	 */
	private async startRecording(): Promise<unknown> {
		return new Promise(
			() => {
				this.chunks = [];

				this.mediaRecorder = new MediaRecorder(
					this.stream,
					{mimeType: 'audio/webm'}
				);
				this.mediaRecorder.addEventListener(
					'dataavailable',
					(audioData) => {
						if (this.chunks.length == 0) {
							// send the start recording event to
							// the start button
							this.isRecording = true
							document.getElementById(
								this.recordStartButtonId
							).dispatchEvent(
								this.eventStartedRecording
							)

							// set a max recording timeout
							this.recordingTimeExceededId = setTimeout(
								() => {
									this.mediaRecorder.stop()

									if (this.maxRecordingTimeMsec) {
										document.getElementById(
											this.recordStopButtonId
										).dispatchEvent(
											this.recordingTimeExceeded
										)
									}
								},
								this.maxRecordingTimeMsec
							)
						}

						if (audioData.data.size > 0) {
							this.chunks.push(audioData.data);
						}

						if (this.waveformCanvasId) {
							this.decodeAndDisplayAudio();
						}
					}
				);
				this.mediaRecorder.addEventListener(
					'stop',
					() => {
						this.onStop()
					}
				);

				//
				// start recording here
				this.mediaRecorder.start(this.recordingSampleRateMsec);
			}
		);
	}

	/**
	 * onStop - Handle the MediaRecorder 'stop' event.
	 *
	 * @DOM_Events 'AudioControls.RecordingStopped': when playing has finished.
	 */
	private onStop() {
		if (!this.isRecording) {
			throw new Error('Stop Recording called when Start Recording was'
			                + ' not active.')
		}

		//
		// stop any active tracks. Count the audio tracks in case
		// there are also video tracks.  We only care about audio.

		//
		// How many audio tracks are there? Should be at least one.
		this.stream.getTracks().filter(
			(d) => d.kind === 'audio'
		).forEach(
			(track) => {
				track.addEventListener(
					'stop',
					() => {
						console.log(`Track "${track.label}" is stopped.`)
					}
				)
				track.stop()
			}
		)

		//
		// this.unsavedAudio is the raw, unsubmitted audio data.
		if (this.chunks.length == 0) {
			throw new Error('There are no audio chunks.')
		}
		this.unsavedAudio = new Blob(this.chunks);

		this.isRecording = false

		clearTimeout(this.recordingTimeExceededId)
		this.recordingTimeExceededId = undefined

		// send the stop recording event to
		// the stop button
		document.getElementById(
			this.recordStopButtonId
		).dispatchEvent(
			this.eventStopRecording
		)
	}

	/*
	 * Play the saved audio through an AudioContext.
	 *
	 * @DOM_Events 'AudioControls.StartedPlaying': when playing starts.
	 * @DOM_Events 'AudioControls.FinishedPlaying': when playing has finished.
	 */
	private async playRecording() {
		if (!(this.unsavedAudio || this.unsavedAudio.size === 0)) {
			throw new Error(
				'Received request to play but there was no saved audio.')
		}
		if (this.isPlaying) {
			return
		}

		const ctx = new AudioContext();
		const fileReader = new FileReader();

		fileReader.onload = () => ctx.decodeAudioData(
			<ArrayBuffer>fileReader.result
		).then(
			buf => {
				const source = ctx.createBufferSource();
				source.buffer = buf;
				source.connect(ctx.destination);
				source.addEventListener(
					'ended',
					() => {
						document.getElementById(
							this.playStopButtonId
						).dispatchEvent(
							this.eventStopPlaying
						)
					}
				);

				document.getElementById(
					this.playStopButtonId
				).dispatchEvent(
					this.eventStartPlaying
				)
				this.isPlaying = true

				//
				// start playback
				source.start(0);

				this.isPlaying = false
			}
		).catch(
			(error) => {
				console.log(error)
			}
		)

		fileReader.readAsArrayBuffer(this.unsavedAudio);
	}

	/**
	 * drawWaveform: code is based on:
	 * https://stackoverflow.com/questions/22073716/create-a-waveform-of-the-full-track-with-web-audio-api
	 *
	 * @param {AudioBuffer} audioBuffer - audio data to convert to waveform.
	 */
	private drawWaveform(audioBuffer: AudioBuffer) {
		// Pycharm thinks 'canvas' should be of type HTMLElement instead of
		// HTMLCanvasElement. Putting in this 'ignore' to silence the nagging.
		// @ts-ignore
		const canvas: HTMLCanvasElement = document.getElementById(
			this.waveformCanvasId
		)

		const canvasCtx = canvas.getContext("2d")
		const width = canvas.width;
		const height = canvas.height;

		//
		// set background color to black
		canvasCtx.fillStyle = this.waveformBackgroundCSS
		canvasCtx.fillRect(0, 0, width, height);

		//
		// set foreground color
		canvasCtx.fillStyle = this.waveformForegroundCSS

		//
		// get the raw audio data for this recording timeslice. The
		// MediaRecorder has a sub-second save feature that generates the
		// incoming data.
		let rawAudioData = audioBuffer.getChannelData(0)

		// divide the raw data length by the canvas width to get the per-pixel
		// chunk size
		const chunkSize = Math.max(1, Math.ceil(rawAudioData.length / width))

		// each pixel-chunk of audio data could have values above and below
		// zero. The positive values will contribute to the displayed area
		// above the "origin" line in the output and the negative values
		// will be below the origin.
		//
		// There could be thousands+ of points in a per-pixel chunk. For quick
		// display purposes we really only care about the single largest
		// positive and smallest negative value in a chunk.  These two points
		// define the length of the vertical line (really a rectangle) that will
		// represent the pixel-chunk in the result.
		let positiveValues: number[] = []
		let negativeValues: number[] = []

		for (let x = 0; x < width; x++) {
			// array slice the raw data into pixel-chunks
			const start = x * chunkSize
			const end = start + chunkSize
			const chunk = rawAudioData.slice(start, end)

			// find and save the largest and smallest values in this chunk
			positiveValues.push(Math.max(...chunk))
			negativeValues.push(Math.min(...chunk))
		}
		// we are done with the raw data, let it go
		rawAudioData = null

		// the positiveValues and negativeValues values define the largest
		// vertical space needed to display all the collected points.  Each
		// pair of values: ( positiveValues[x], negativeValues[x] ) define a
		// future vertical line in the display.
		//
		// max is the largest of the positiveValues and min is the smallest
		// of the  negativeValues.  The difference between these two values
		// is the longest possible vertical line that could exist in the
		// incoming data.  These values will be scaled up to just fit in the
		// available height of the canvas.
		let max = Math.max(...positiveValues)
		let min = Math.min(...negativeValues)

		// Find the "Scaling Factor":

		// let's say that the vertical height of the canvas is 100. The
		// "origin" line will be at 50 (half the height). The values in
		// positiveValues & negativeValues could be anything (the PCM
		// standard may specify specific ranges of values but those ranges
		// were not readily apparent). The values have to be "scaled"
		// up/down to fit within the height limit while keeping "zero" on
		// the center line.
		//
		// Find the largest absolute value of min & max. This value is
		// "farthest" from the origin/zero so finding the value that will
		// scale that number up/down to just fit inside its "side" of the
		// origin becomes the scaling factor for all the other values.
		//
		// The scaling factor is then the largest value divided by half the
		// height of the canvas.
		let maxOriginOffset = Math.max(Math.abs(max), Math.abs(min))
		let halfHeight = Math.floor(height / 2)
		let scalingFactor = maxOriginOffset / halfHeight

		// apply the scaling factor to all pixel-chunk values and build a
		// rectangle whose width is 1 (pixel).  The top of the rectangle is the
		// distance from the origin (half the canvas height) to the scaled
		// "positive" value.  The bottom of the rectangle is the distance
		// from the origin to the scaled "negative" value.
		for (let x = 0; x < positiveValues.length; x++) {
			let top = positiveValues[x] / scalingFactor
			let bottom = negativeValues[x] / scalingFactor

			// "x" is the horizontal pixel position along the origin line.
			// "y" is how high above the origin the rectangle will start.
			// "width" is 1 pixel
			// "height" is the distance between the top and bottom values
			canvasCtx.fillRect(
				x,
				halfHeight - top,
				1,
				Math.max(1, top - bottom)
			)
		}
	}

	/**
	 * Convert the recorded Blob into audio
	 */
	private async decodeAndDisplayAudio() {
		// convert the blob audio data into an AudioContext and prepare to
		// display a "waveform".
		const audioCtx = new AudioContext();

		const fileReader = new FileReader();
		fileReader.readAsArrayBuffer(new Blob(this.chunks));
		fileReader.onload = () => audioCtx.decodeAudioData(
			<ArrayBuffer>fileReader.result
		).then(
			buf => {
				this.drawWaveform(buf)
			}
		)
	}
}

/**
 * Custom exception for the case when no audio inputs are found.
 */
class NoAudioInputs extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'NoAudioInputs';

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, NoAudioInputs.prototype);
	}
}
