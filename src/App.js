import './App.css';
import heaterOneMp3 from './audio/heater-1.mp3';
import heaterTwoMp3 from './audio/heater-2.mp3';
import heaterThreeMp3 from './audio/heater-3.mp3';
import heaterFourMp3 from './audio/heater-4.mp3';
import clapMp3 from './audio/clap.mp3';
import openHihatMp3 from './audio/open-hh.mp3';
import kickAndHatMp3 from './audio/kick-n-hat.mp3';
import kickMp3 from './audio/kick.mp3';
import closedHiHatMp3 from './audio/closed-hh.mp3';
import { useState, useEffect, useMemo } from 'react';

const drums = {
	q: { id: 'heater-1', src: heaterOneMp3, keyCode: 81 },
	w: { id: 'heater-2', src: heaterTwoMp3, keyCode: 87 },
	e: { id: 'heater-3', src: heaterThreeMp3, keyCode: 69 },
	a: { id: 'heater-4', src: heaterFourMp3 , keyCode: 65 },
	s: { id: 'clap', src: clapMp3, keyCode: 83 },
	d: { id: 'open-hh', src: openHihatMp3, keyCode: 68 },
	z: { id: 'kick-n-hat', src: kickAndHatMp3, keyCode: 90 },
	x: { id: 'kick', src: kickMp3, keyCode: 88 },
	c: { id: 'closed-hh', src: closedHiHatMp3, keyCode: 67 }
};


function App() {

	// object that contains a key of a keyboard key and a value of an array buffer of audio data
	// e.g. { q: decodedData, w: decodedData }
	const drumAudioData = {};
	const audioContext = useMemo(() => new AudioContext(), []);

	 useEffect(() => {
		 /**
			* takes a file source string, fetches the data and returns an arrayBuffer for use with AudioContext
			*
			* @param {string} src string representing the file path to the mp3 file
			* @returns {Promise<arrayBuffer>} an array buffer containing the data of the mp3
			*/
		const decodeAudioData = async (src) => {
			try {
				const response = await fetch(src);
				const arrayBuffer = await response.arrayBuffer();
				return audioContext.decodeAudioData(arrayBuffer);
			} catch (error) {
				console.error(`Error decoding audio data: ${error}`);
			}
		};

		 /**
			* loads the decoded audio data (arrayBuffer) into the drumAudioData object so it can be quickly played ad hoc
		  *
		  * @returns none
		  */
		const loadDrums = async () => {
			// for...in loop guarantees async handling
			for (const key of Object.keys(drums)) {
					const decodedData = await decodeAudioData(drums[key].src);
					drumAudioData[key] = decodedData;
			}
		}
		loadDrums();
	});


	// volume slider feature
	const [gain, setGain] = useState('1'); // min: 0 max: 2
	const gainNode = useMemo(() => audioContext.createGain(), [audioContext]);

	const handleGainChange = (event) => {
		setGain(event.target.value);
	};

	useEffect(() => {
		gainNode.gain.value = gain;
		console.log(gainNode.gain.value);
		console.log(gain);
	}, [gain])

	/** function that takes a keypress and creates a bufferSource, 
	 	* plays it, and returns the ID of the drum played
		*/
	const playDrum = (keyPressed) => {
		const bufferSource = audioContext.createBufferSource();
		bufferSource.buffer = drumAudioData[keyPressed];
		bufferSource.connect(gainNode).connect(audioContext.destination);
		console.log(gainNode.gain.value);
		bufferSource.start();
		return drums[keyPressed].id;
	}

	// keypress play feature
	useEffect(() => {
		function handleKeyDown(event) {
			const keyPlayed = Object.keys(drums).find((key) => {
				return drums[key].keyCode === event.keyCode;
			});
			if (keyPlayed) {
				const drumPlayedId = playDrum(keyPlayed);
				setLastPlayed(drumPlayedId);
			}
		}

		document.addEventListener('keydown', handleKeyDown);

		return function cleanup() {
			document.removeEventListener('keydown', handleKeyDown);
		}
	});

	// click to play feature
	const handleDrumPadClick = (event) => {
		const keyPlayed = event.target.getAttribute('drumkey');
		const drumPlayedId = playDrum(keyPlayed);
		setLastPlayed(drumPlayedId);
	};

	// TODO: show recently played feature
	const [lastPlayed, setLastPlayed] = useState('');


	// create drum buttons feature
	const createDrumButtons = (drumsObject) => {
		const drumButtons = Object.keys(drumsObject).map(key => {
			
			return (
				<button 
					key={key} 
					drumkey={key}
					id={drumsObject[key].id}
					onClick={handleDrumPadClick}
					className="drum-pad">
					<audio src={drumsObject[key].src}></audio>
					{key}
				</button>
			);
		});

		return drumButtons;
	};

  return (
		<>
			<h1>drum machine</h1>
			<div id="drum-machine">
				<div className="container grid">
					{createDrumButtons(drums)}
				</div>
				<div className="container flex">
					<div id="controls">
						<label for='gain'>Gain:</label>
						<input 
						type='range'
						name='gain'
						id='gain'
						min='0'
						max='2'
						step='0.01'
						value={gain}
						onChange={handleGainChange} />
					</div>
					<div id="display">{lastPlayed}</div>
				</div>
			</div>
		</>
  );
}

export default App;
