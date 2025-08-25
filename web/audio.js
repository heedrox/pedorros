const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const AUDIO_ELEMENTS = {
    'neutral.mp3': document.getElementById("game-audio-neutral"),
    'pedito-1.mp3': document.getElementById("game-audio-pedito-1"),
    'pedito-2.mp3': document.getElementById("game-audio-pedito-2"),
    'pedito-3.mp3': document.getElementById("game-audio-pedito-3"),
    'pedito-4.mp3': document.getElementById("game-audio-pedito-4"),
    'pedito-5.mp3': document.getElementById("game-audio-pedito-5"),
    'pedorro-1.mp3': document.getElementById("game-audio-pedorro-1"),
    'pedorro-2.mp3': document.getElementById("game-audio-pedorro-2"),
    'pedorro-3.mp3': document.getElementById("game-audio-pedorro-3"),
    'pedorro-4.mp3': document.getElementById("game-audio-pedorro-4"),
    'pedorro-5.mp3': document.getElementById("game-audio-pedorro-5"),
    'intro/intro.mp3': document.getElementById("game-audio-intro")
}

const prepareTrack = (audioElementKey) => {
    const audioElement = AUDIO_ELEMENTS[audioElementKey];
    const track = audioContext.createMediaElementSource(audioElement);
    track.connect(audioContext.destination);
}

for (const audioElementKey in AUDIO_ELEMENTS) {
    prepareTrack(audioElementKey);
}

const playAudio = async (audioElementKey, delay = 1000) => new Promise(async (resolve, reject) => {
    const audioElement = AUDIO_ELEMENTS[audioElementKey];
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    console.log("Reproducción HTML5 + AudioContext delayed", delay);
    
    setTimeout(async () => {
      console.log("Reproduciendo", audioElementKey);
      await audioElement.play(); // suena seguro en iOS
      resolve();
    }, delay)
    
    
  });

  export { playAudio };