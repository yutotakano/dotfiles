/* mpv integration with auto-editor (https://github.com/WyattBlue/auto-editor)
 *
 * Changelog:
 * https://github.com/idMysteries/mpv-skip-silence/commits/main/autoeditor.js
 * 
 * Limitations:
 * 1. The video must have a constant frame-rate; variable frame rate sources,
 *    sources with frame skips will have issues.
 *
 * Copyright 2022 Tatsuyuki Ishi <ishitatsuyuki@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var AUTO_EDITOR_BIN = "auto-editor"; //auto-editor";
var AUTO_EDITOR_ARGS = ["--export", "json", "--quiet", "--margin", "1.5sec,0.5sec", "--edit", "audio:threshold=4%,mincut=10"]; // frames are the units, can also use "1sec" for seconds

var SILENCE_SPEED = 20;

var in_silence = false;
var restore_speed = 2.0; // Default, but will use whatever is customly set by user

var timeObserver;

var cmdInProgress = false;

function runAutoEditor() {
	if (cmdInProgress) {
		mp.osd_message("auto-editor: An analysis is already in progress");
		return;
	}
	var file = mp.get_property("path");
	var cmd = {
		name: "subprocess",
		playback_only: false,
		capture_stdout: true,
		capture_stderr: true,
		detach: false,
		args: [AUTO_EDITOR_BIN, file].concat(AUTO_EDITOR_ARGS)
	};
	mp.osd_message("auto-editor: Running analysis on " + file);
	cmdInProgress = true;
	mp.command_native_async(cmd, function (success, result, error) {
		cmdInProgress = false;
		if (result !== undefined) mp.msg.error(result.stdout);
		if (result !== undefined) mp.msg.error(result.stderr);
		if (success) {
			load();
		} else {
			mp.osd_message("ERROR: " + error.toString());
			mp.msg.error(error);
		}
	});
}

function load() {
	if (timeObserver != null) {
		mp.unobserve_property(timeObserver);
		timeObserver = null;
		in_silence = false;
		mp.set_property("speed", restore_speed);
	}
		
	var file = mp.get_property("path").replace(/\.[^.]+$/, "_ALTERED.json");
	// Ignore non-file things
	if (!file || file.indexOf("://") !== 0) {
		return;
	}
//	mp.osd_message("Trying to read from" + file);
	var content;
	try {
		content = JSON.parse(mp.utils.read_file(file));
	} catch (e) {
		mp.msg.error(e);
		return;
	}
  
	var segments = content["v"][0]
	if (segments.length < 1) return;
  
	mp.osd_message("auto-editor: Loaded " + segments.length + " segments");
  
	var current_segment = segments[0];
  
	restore_speed = mp.get_property_number("speed");
	timeObserver = function (_name, time) {
		var frame = mp.get_property_number("estimated-frame-number");
	
		if (frame >= current_segment["offset"] && frame < current_segment["offset"] + current_segment["dur"]) {
			if (in_silence){
				in_silence = false;
				mp.set_property("speed", restore_speed);
			}
		}
		else {
			for (var i = 0; i < segments.length; i++) {
				if (frame >= segments[i]["offset"] && frame < segments[i]["offset"] + segments[i]["dur"]) {
					current_segment = segments[i];
					break;
				}
			}
			if (!in_silence) {
				in_silence = true;
				restore_speed = mp.get_property_number("speed");
				mp.set_property("speed", SILENCE_SPEED);
			}
		}
	};
	mp.observe_property("time-pos", "number", timeObserver);
}

mp.register_event("start-file", load);
mp.add_key_binding("E", "run-auto-editor", runAutoEditor);
