"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioControls = void 0;
var WavFileEncoder = require("../lib/wav-file-encoder/WavFileEncoder.js");
var AudioControls = /** @class */ (function () {
    /**
     *  Setup basic audio recording in the browser.
     *
     *  @constructor
     *  @param {string} codec - required - A string representing the mime
     *                  type and codec associated with the browser.
     *  @param {string} recordStartButtonId - required - DOM Element ID of the
     *                  Recording Start button.
     *  @param {string?} recordStopButtonId - optional - DOM Element ID of the
     *                  Recording Stop button. If not defined it will use the
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
     *  @param {number?} audio_display_threshold - optional - Default = 0.005. A
     *                  floating point value less than 1. This only effects
     *                  visual display data. Display data have values
     *                  between -1.0 and 1.0. A microphone may pick up very
     *                  quiet sounds that may show up in the display. Values
     *                  between negative(audio_display_threshold) and
     *                  positive(audio_display_threshold) will be set to zero.
     *  @param {number?} audio_display_value_length - optional - Default =
     *                  16K. The maximum amount of audio data to display during
     *                  each render cycle. Trying to display all the data
     *                  each time quickly becomes impossible. The data
     *                  selected for display is the last/most recent
     *                  audio_display_value_length amount of data per render
     *                  cycle.
     */
    function AudioControls(codec, recordStartButtonId, recordStopButtonId, waveformCanvasId, waveformBackgroundCSS, waveformForegroundCSS, maxRecordingTimeMsec, recordingSampleRateMsec, audio_display_threshold, audio_display_value_length) {
        if (recordStopButtonId === void 0) { recordStopButtonId = undefined; }
        if (waveformCanvasId === void 0) { waveformCanvasId = undefined; }
        if (waveformBackgroundCSS === void 0) { waveformBackgroundCSS = "black"; }
        if (waveformForegroundCSS === void 0) { waveformForegroundCSS = "white"; }
        if (maxRecordingTimeMsec === void 0) { maxRecordingTimeMsec = 60000; }
        if (recordingSampleRateMsec === void 0) { recordingSampleRateMsec = 100; }
        if (audio_display_threshold === void 0) { audio_display_threshold = 0.005; }
        if (audio_display_value_length === void 0) { audio_display_value_length = 1024 * 16; }
        var _this = this;
        this._chunks = [];
        // constructor params
        this._codec = undefined;
        this._waveformBackgroundCSS = 'black';
        this._waveformForegroundCSS = 'white';
        this._maxRecordingTimeMsec = 60000;
        this._recordingSampleRateMsec = 250;
        this._isRecording = false;
        /*
         * The display audio functions will "scale" the audio a mic pics up to "fit"
         * the size of the display area.  This means that initial mic sounds and
         * "quiet" background noise can show up in the display as possibly large
         *  peaks.  audio_display_threshold defines a +/- range of values that
         *  will be visually ignored.  This does not modify the audio data. It
         *  only modifies the data used to display a "waveform".
         *
         * "audio_display_threshold" is a floating point number that will "zero out"
         * audio values that are between negative(audio_display_threshold) and
         * positive(audio_display_threshold).  Note, this is ONLY for the
         * display values. Actual recorded audio is unchanged.
         */
        this.audio_display_threshold = 0.005;
        /*
         * Only display the last audio_display_value_length amount of data in
         * the visual display area.
         */
        this.audio_display_value_length = 1024 * 16; // 16k
        //
        // Events
        this.eventStartedRecording = new CustomEvent('AudioControls.RecordingStarted');
        this.eventStopRecording = new CustomEvent('AudioControls.RecordingStopped');
        this.recordingTimeExceeded = new CustomEvent('AudioControls.RecordingTimeExceeded');
        this.eventBrowserNotSupported = new CustomEvent('AudioControls.BrowserNotSupported');
        this.eventNoInputDevicesFound = new CustomEvent('AudioControls.NoInputDevicesFound');
        // codec is REQUIRED
        if (!(codec && codec.trim())) {
            var msg = "recordStartButtonId is required.";
            console.log(msg);
            throw new Error(msg);
        }
        if (typeof codec != 'string') {
            var msg = "codec should be a string.";
            console.log(msg);
            throw new Error(msg);
        }
        this._codec = codec.trim();
        // RECORD START/STOP BUTTONS
        // recordStartButtonId is REQUIRED
        if (!(recordStartButtonId && recordStartButtonId.trim())) {
            var msg = "recordStartButtonId is required.";
            console.log(msg);
            throw new Error(msg);
        }
        if (typeof recordStartButtonId != 'string') {
            var msg = "recordStartButtonId should be a string.";
            console.log(msg);
            throw new Error(msg);
        }
        recordStartButtonId = recordStartButtonId.trim();
        if (!document.getElementById(recordStartButtonId)) {
            var msg = "recordStartButtonId value \"".concat(recordStartButtonId, "\" ")
                + "does not exist in the DOM.";
            console.log(msg);
            throw new Error(msg);
        }
        this._recordStartButtonId = recordStartButtonId;
        // if recordStopButtonId is undefined make this.recordStopButtonId
        // the same as this.recordStartButtonId
        if (!(recordStopButtonId && recordStopButtonId.trim())) {
            this._recordStopButtonId = this._recordStartButtonId;
        }
        else {
            if (typeof recordStopButtonId != 'string') {
                var msg = "recordStopButtonId should be a string or undefined.";
                console.log(msg);
                throw new Error(msg);
            }
            recordStopButtonId = recordStopButtonId.trim();
            if (!document.getElementById(recordStopButtonId)) {
                var msg = "recordStopButtonId value \"".concat(recordStopButtonId, "\" ")
                    + "does not exist in the DOM.";
                console.log(msg);
                throw new Error(msg);
            }
            this._recordStopButtonId = recordStopButtonId;
        }
        // WAVEFORM CANVAS
        if (!(waveformCanvasId && waveformCanvasId.trim())) {
            // no start button ID so no stop button ID
            this._waveformCanvasId = undefined;
        }
        else {
            if (typeof waveformCanvasId != 'string') {
                var msg = "waveformCanvasId should be a string.";
                console.log(msg);
                throw new Error(msg);
            }
            waveformCanvasId = waveformCanvasId.trim();
            if (!document.getElementById(waveformCanvasId)) {
                var msg = "waveformCanvasId value \"".concat(waveformCanvasId, "\" ")
                    + "does not exist in the DOM.";
                console.log(msg);
                throw new Error(msg);
            }
            this._waveformCanvasId = waveformCanvasId;
            if (waveformBackgroundCSS) {
                if (typeof waveformBackgroundCSS != 'string') {
                    var msg = "waveformBackgroundCSS should be a string.";
                    console.log(msg);
                    throw new Error(msg);
                }
                this._waveformBackgroundCSS = waveformBackgroundCSS.trim();
            }
            if (waveformForegroundCSS) {
                if (typeof waveformForegroundCSS != 'string') {
                    var msg = "waveformForegroundCSS should be a string.";
                    console.log(msg);
                    throw new Error(msg);
                }
                this._waveformForegroundCSS = waveformForegroundCSS.trim();
            }
        }
        // MAX RECORDING TIME
        if (typeof maxRecordingTimeMsec != 'number') {
            var msg = "maxRecordingTimeMsec should be a number in "
                + "milliseconds.";
            console.log(msg);
            throw new Error(msg);
        }
        this._maxRecordingTimeMsec = Math.ceil(maxRecordingTimeMsec);
        if (typeof recordingSampleRateMsec != 'number') {
            throw new Error("recordingSampleRateMsec should be a number in "
                + "milliseconds.");
        }
        if (recordingSampleRateMsec) {
            this._recordingSampleRateMsec = Math.ceil(recordingSampleRateMsec);
            if (this._recordingSampleRateMsec === 0) {
                var msg = "Recording Sample Rate value is zero.";
                console.log(msg);
                throw new Error(msg);
            }
        }
        // AUDIO DISPLAY THRESHOLD
        if (typeof audio_display_threshold != 'number') {
            var msg = "audio_display_threshold should be a floating "
                + "point number.";
            console.log(msg);
            throw new Error(msg);
        }
        if (audio_display_threshold > 1.0 || audio_display_threshold < -1.0) {
            var msg = "audio_display_threshold only has a useful range "
                + "between -1.0 and 1.0. Default is 0.005.";
            console.log(msg);
            throw new Error(msg);
        }
        this.audio_display_threshold = audio_display_threshold;
        // AUDIO DISPLAY VALUE LENGTH
        if (typeof audio_display_value_length != 'number') {
            var msg = "audio_display_value_length should be an integer > 0.";
            console.log(msg);
            throw new Error(msg);
        }
        if (audio_display_value_length < 1) {
            var msg = "audio_display_value_length only has a useful integer"
                + " range > 0.";
            console.log(msg);
            throw new Error(msg);
        }
        this.audio_display_value_length = Math.ceil(audio_display_value_length);
        //
        // get list of available input devices. The "list" is probably not
        // useful but the number of potential devices is.
        var devices = undefined;
        try {
            devices = navigator.mediaDevices.enumerateDevices();
        }
        catch (_a) {
            var msg = "Browser Not Supported.";
            console.log(msg);
            document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                'detail': 'This browser does not support recording. Please try opening this page in a different browser or update this browser to the most recent version to continue'
            }));
            throw new Error(msg);
        }
        devices.then(function (devices) {
            //
            // There are devices attached. Are there any audio input
            // devices?
            var availableInputDevices = devices.filter(function (d) { return d.kind === 'audioinput'; });
            if (!availableInputDevices.length) {
                var msg = "No input devices found.";
                console.log(msg);
                document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                    'detail': 'No input devices found. Please attach a microphone and reload the page'
                }));
                throw new Error(msg);
            }
            _this.initializeRecording()
                .catch(function (error) {
                console.log(error.message);
                document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                    'detail': error.message
                }));
                throw new Error(error.message);
            });
        }).catch(function (error) {
            console.log(error.message);
            switch (error.message) {
                case "Browser Not Supported.":
                    document.dispatchEvent(_this.eventBrowserNotSupported);
                    break;
                case "No input devices found.":
                    document.dispatchEvent(_this.eventNoInputDevicesFound);
                    break;
                default:
                    document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                        'detail': error.message
                    }));
                    break;
            }
            throw new Error(error.message);
        });
    }
    /**
     * If there is at least one input device potentially signal the user to
     * grant access.
     *
     * @throws Exceptions are possible from navigator.mediaDevices.getUserMedia
     */
    AudioControls.prototype.initializeRecording = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            this._recordingContext = new (AudioContext || webkitAudioContext)();
                        }
                        catch (e) {
                            console.log(e);
                            document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                                'detail': "Trying to establish an AudioContext: ".concat(e)
                            }));
                            throw new Error(e);
                        }
                        //
                        // possibly request permission to use an input device.
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
                                audio: true,
                                video: false
                            }).then(function (stream) {
                                if (!stream) {
                                    var msg = "No MediaStream \"stream\" found.";
                                    console.log(msg);
                                    document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                                        'detail': "".concat(msg)
                                    }));
                                    throw new Error(msg);
                                }
                                _this._stream = stream;
                                //
                                // setup primary event listeners
                                var recordStartButton = document.getElementById(_this._recordStartButtonId);
                                recordStartButton.addEventListener("click", function () {
                                    if (_this._isRecording) {
                                        return false;
                                    }
                                    _this.startRecording().catch(function (error) {
                                        var msg = "startRecording error: ".concat(error.message, ".");
                                        console.log(msg);
                                        document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                                            'detail': error.stack
                                        }));
                                        throw new Error(msg);
                                    });
                                });
                                var recordStopButton = document.getElementById(_this._recordStopButtonId);
                                recordStopButton.addEventListener("click", function () {
                                    if (!_this._isRecording) {
                                        return false;
                                    }
                                    _this._mediaRecorder.stop();
                                });
                            }).catch(function (error) {
                                console.log(error.message);
                                document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                                    'detail': "Trying to GetUserMedia: ".concat(error.message)
                                }));
                                throw new Error(error.message);
                            })];
                    case 1:
                        //
                        // possibly request permission to use an input device.
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
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
    AudioControls.prototype.startRecording = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function () {
                        _this._chunks = [];
                        if (!_this._codec) {
                            var msg = "Codec was not specified.";
                            console.log(msg);
                            document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                                'detail': "startRecording: no codec: ".concat(msg)
                            }));
                            throw new Error(msg);
                        }
                        try {
                            _this._mediaRecorder = new MediaRecorder(_this._stream, {
                                mimeType: _this._codec
                            });
                        }
                        catch (e) {
                            console.log(e);
                            document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                                'detail': "MediaRecorder: ".concat(e)
                            }));
                            throw e;
                        }
                        _this._mediaRecorder.addEventListener('dataavailable', function (audioData) {
                            if (_this._chunks.length == 0) {
                                // send the start recording event to
                                // the start button
                                _this._isRecording = true;
                                document.getElementById(_this._recordStartButtonId).dispatchEvent(_this.eventStartedRecording);
                                // set a max recording timeout
                                if (_this._maxRecordingTimeMsec > 0) {
                                    _this._recordingTimeExceededId = setTimeout(function () {
                                        _this._mediaRecorder.stop();
                                        if (_this._maxRecordingTimeMsec) {
                                            document.getElementById(_this._recordStopButtonId).dispatchEvent(_this.recordingTimeExceeded);
                                        }
                                    }, _this._maxRecordingTimeMsec);
                                }
                            }
                            _this._chunks.push(audioData.data);
                            if (_this._waveformCanvasId) {
                                _this.decodeAndDisplayAudio().catch(function (error) {
                                    console.log(error.message);
                                    document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                                        'detail': "decodeAndDisplayAudio: ".concat(error.message)
                                    }));
                                    throw new Error(error.message);
                                });
                            }
                        });
                        _this._mediaRecorder.addEventListener('stop', function () {
                            _this.onStop();
                        });
                        //
                        // start recording here
                        _this._mediaRecorder.start(_this._recordingSampleRateMsec);
                    })];
            });
        });
    };
    /**
     * onStop - Handle the MediaRecorder 'stop' event.
     *
     * @DOM_Events 'AudioControls.RecordingStopped': when playing has finished.
     */
    AudioControls.prototype.onStop = function () {
        var _this = this;
        if (!this._isRecording) {
            console.log('Stop Recording called when Start Recording was not'
                + ' active.');
            return;
        }
        //
        // stop any active tracks. Count the audio tracks in case
        // there are also video tracks.  We only care about audio.
        //
        // How many audio tracks are there? Should be at least one.
        var getTracks = undefined;
        try {
            getTracks = this._stream.getTracks();
        }
        catch (e) {
            console.log(e);
            document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                'detail': "getTracks: ".concat(e)
            }));
            throw e;
        }
        var recordingData = {};
        getTracks.filter(function (track) { return track.kind === 'audio'; }).forEach(function (track, index) {
            if (!recordingData
                .hasOwnProperty('track information')) {
                recordingData['track information'] = {
                    'number of tracks': getTracks.length,
                    'per track information': []
                };
            }
            recordingData['track information']['per track information'].push({
                'track number': index,
                'track label': track.label
            });
            track.stop();
        });
        this._isRecording = false;
        clearTimeout(this._recordingTimeExceededId);
        this._recordingTimeExceededId = undefined;
        //
        // this._chunks is the raw, un-submitted audio data.
        if (this._chunks.length == 0) {
            var msg = 'There are no audio chunks.';
            console.log(msg);
            document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                'detail': msg
            }));
            throw new Error(msg);
        }
        var unsavedAudio = new Blob(this._chunks, {
            'type': 'audio/wav'
        });
        this._chunks = undefined;
        unsavedAudio.arrayBuffer().then(function (buffer) {
            _this._recordingContext.decodeAudioData(buffer).then(function (buffer) {
                //
                // capture recording details
                if (!recordingData
                    .hasOwnProperty('WAV information')) {
                    recordingData['WAV information'] = {};
                }
                if (!recordingData['WAV information']
                    .hasOwnProperty('sampleRate')) {
                    recordingData['WAV information']['sampleRate'] = buffer.sampleRate;
                }
                if (!recordingData['WAV information']
                    .hasOwnProperty('length')) {
                    recordingData['WAV information']['length'] =
                        buffer.length;
                }
                if (!recordingData['WAV information']
                    .hasOwnProperty('numberOfChannels')) {
                    recordingData['WAV information']['numberOfChannels'] = buffer.numberOfChannels;
                }
                if (!recordingData['WAV information']
                    .hasOwnProperty('duration')) {
                    recordingData['WAV information']['duration'] =
                        buffer.duration;
                }
                //
                // Create AudioBuffer of WAV values
                var wavData = WavFileEncoder
                    .encodeWavFileFromAudioBuffer(buffer, WavFileEncoder.WavFileType.float32);
                document.getElementById(_this._recordStopButtonId).dispatchEvent(
                //
                // return audio data to the caller.
                new CustomEvent('AudioControls.RecordingStopped', {
                    'detail': {
                        'recordingData': recordingData,
                        'wavData': new Blob([wavData], { type: 'audio/wav' })
                    }
                }));
            }).catch(function (error) {
                console.log(error.message);
                document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                    'detail': "decodeAudioData: ".concat(error.message)
                }));
                throw new Error(error.message);
            });
        }).catch(function (error) {
            console.log(error.message);
            document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                'detail': "unsavedAudioBuffer: ".concat(error.message)
            }));
            throw new Error(error.message);
        });
    };
    /**
     * drawWaveform: code is based on:
     * https://stackoverflow.com/questions/22073716/create-a-waveform-of-the-full-track-with-web-audio-api
     *
     * @param {AudioBuffer} audioBuffer - audio data to convert to waveform.
     */
    AudioControls.prototype.drawWaveform = function (audioBuffer) {
        try {
            // Pycharm thinks 'canvas' should be of type HTMLElement instead of
            // HTMLCanvasElement. Putting in this 'ignore' to silence the
            // nagging.
            // @ts-ignore
            var canvas = document.getElementById(this._waveformCanvasId);
            var canvasCtx = canvas.getContext("2d");
            var width = canvas.width;
            var height = canvas.height;
            var halfHeight = Math.floor(height / 2);
            //
            // set background color to black
            canvasCtx.fillStyle = this._waveformBackgroundCSS;
            canvasCtx.fillRect(0, 0, width, height);
            canvasCtx.fillStyle = this._waveformForegroundCSS;
            //
            // set foreground color
            canvasCtx.strokeStyle = this._waveformForegroundCSS;
            canvasCtx.beginPath();
            canvasCtx.moveTo(0, halfHeight);
            canvasCtx.lineTo(width, halfHeight);
            canvasCtx.stroke();
            //
            // get the raw audio data for this recording timeslice. The
            // MediaRecorder has a sub-second save feature that generates the
            // incoming data.
            //
            // We only care about the first channel for the display.
            if (audioBuffer.numberOfChannels < 1) {
                throw new Error("AudioBuffer has no channels.");
            }
            var rawAudioData = audioBuffer.getChannelData(0);
            //
            // the amount of recorded audio could be HUGE. Trying to display
            // and redisplay all of it "in real time" is insane.  Just
            // display, at most,  the last this.audio_display_value_length
            // amount.
            var rawAudioDataLength = rawAudioData.length;
            //
            // offset is how much of the accumulated audio to skip before
            // display
            var offset = 0;
            if (rawAudioDataLength > this.audio_display_value_length) {
                offset = rawAudioDataLength - this.audio_display_value_length;
            }
            //
            // workingData is the part of the accumulated audio to display.
            // There could be 10's of thousands of datapoints, so we will
            // divide workingData length by the number of pixels.  Each
            // pixel chunk will have a max and min value. Find and plot those.
            var workingData = rawAudioData.slice(offset, rawAudioDataLength - 1);
            var chunkSize = Math.max(1, Math.ceil(workingData.length / width));
            //
            // find the high and low values in the workingData block
            var workingDataMax_1 = Number.MIN_VALUE;
            var workingDataMin_1 = Number.MAX_VALUE;
            workingData.forEach(function (value) {
                if (value > workingDataMax_1) {
                    workingDataMax_1 = value;
                }
                if (value < workingDataMin_1) {
                    workingDataMin_1 = value;
                }
            });
            //
            // the scaling factor is based on the largest "absolute" value in
            // this "frame" of audio data.  The largest value should always be
            // between -1 and 1.
            //
            // the scaling factor is finally negated in order to "flip" the
            // perceived direction of positive and negative audio values.
            // This is because the canvas widget has its (0,0) "origin"
            // point in the upper left hand corner.  "Positive" Y values then
            // appear to increase "downwards" which makes numeric sense but
            // not visual sense.  The end effect is that negative values
            // multiplied by the negative scaling factor become "positive"
            // and vice versa.
            var scalingFactor = 1.0 / Math.max(Math.abs(workingDataMax_1), Math.abs(workingDataMin_1)) * -1;
            var _loop_1 = function (x) {
                // array slice the raw data into pixel-chunks
                var start = x * chunkSize;
                var end = start + chunkSize;
                //
                // "chunk" should hold floating point values between -1.0
                // and 1.0
                var chunk = workingData.slice(start, end);
                //
                // find the high and low values in this chunk. There might
                // be thousands of values in the chunk only draw a line
                // between the largest and smallest.
                var chunkMax = Number.MIN_VALUE;
                var chunkMin = Number.MAX_VALUE;
                chunk.forEach(function (value) {
                    if (value > chunkMax) {
                        chunkMax = value;
                    }
                    if (value < chunkMin) {
                        chunkMin = value;
                    }
                });
                var cmx = chunkMax;
                if (cmx < this_1.audio_display_threshold
                    && cmx > (this_1.audio_display_threshold * -1)) {
                    cmx = 0.0;
                }
                var cmn = chunkMin;
                if (cmn < this_1.audio_display_threshold
                    && cmn > (this_1.audio_display_threshold * -1)) {
                    cmn = 0.0;
                }
                var top_1 = cmx * scalingFactor // Scale the value to "1.0".
                    * halfHeight // Scale the "1" value to the
                    //     space around the midline.
                    + halfHeight; // Translate the value down to
                //     the midline.
                var bottom = cmn * scalingFactor // Scale the value to "1.0".
                    * halfHeight // Scale the "1" value to the
                    //     space around the
                    //     midline.
                    + halfHeight; // Translate the value down to
                //     the midline.
                canvasCtx.beginPath();
                canvasCtx.moveTo(x, top_1);
                canvasCtx.lineTo(x, bottom);
                canvasCtx.stroke();
            };
            var this_1 = this;
            //
            // loop over the incoming data
            for (var x = 0; x < width; x++) {
                _loop_1(x);
            }
        }
        catch (e) {
            document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                'detail': "drawWaveform: ".concat(e)
            }));
            throw new Error(e);
        }
    };
    /**
     * Convert the recorded Blob into audio
     */
    AudioControls.prototype.decodeAndDisplayAudio = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    // convert the blob audio data into an AudioContext and prepare to
                    // display a "waveform".
                    new Blob(this._chunks, { 'type': 'audio/wav' }).arrayBuffer().then(function (arrayBuffer) {
                        _this._recordingContext.decodeAudioData(arrayBuffer).then(function (audioBuffer) {
                            if (!audioBuffer) {
                                console.log("undefined audioBuffer");
                                return;
                            }
                            _this.drawWaveform(audioBuffer);
                        }).catch(function (error) {
                            console.log(error.message);
                            document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                                'detail': "decodeAndDisplayAudio: decodeAudioData: ".concat(error.message)
                            }));
                            throw new Error(error.message);
                        });
                    }).catch(function (error) {
                        console.log(error.message);
                        document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                            'detail': "decodeAndDisplayAudio reading Blob: ".concat(error.message)
                        }));
                        throw new Error(error.message);
                    });
                }
                catch (e) {
                    console.log(e);
                    document.dispatchEvent(new CustomEvent('AudioControls.Error', {
                        'detail': "decodeAndDisplayAudio: ".concat(e)
                    }));
                    throw new Error(e);
                }
                return [2 /*return*/];
            });
        });
    };
    return AudioControls;
}());
exports.AudioControls = AudioControls;
