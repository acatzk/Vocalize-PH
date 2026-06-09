export function generateCurlSnippet(
  provider: 'google' | 'azure' | 'elevenlabs',
  text: string,
  voiceCode: string,
  pitch: number,
  speed: number
): string {
  // Normalize parameters
  const sanitizedText = text.replace(/"/g, '\\"').replace(/\n/g, ' ');

  if (provider === 'google') {
    return `curl -X POST \\
  "https://texttospeech.googleapis.com/v1/text:synthesize?key=\${GOOGLE_API_KEY}" \\
  -H "Content-Type: application/json; charset=utf-8" \\
  -d '{
    "input": { "text": "${sanitizedText}" },
    "voice": { "languageCode": "tl-PH", "name": "${voiceCode}" },
    "audioConfig": {
      "audioEncoding": "MP3",
      "speakingRate": ${speed.toFixed(2)},
      "pitch": ${((pitch - 1.0) * 20.0).toFixed(1)}
    }
  }' \\
  --output synthesized_tagalog.mp3`;
  }

  if (provider === 'azure') {
    const ratePercent = Math.round((speed - 1) * 100);
    const rateSign = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
    const pitchPercent = Math.round((pitch - 1) * 50);
    const pitchSign = pitchPercent >= 0 ? `+${pitchPercent}%` : `${pitchPercent}%`;

    return `curl --location --request POST "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1" \\
  --header "Ocp-Apim-Subscription-Key: YOUR_AZURE_SPEECH_KEY" \\
  --header "Content-Type: application/ssml+xml" \\
  --header "X-Microsoft-OutputFormat: audio-16khz-128kbitrate-mono-mp3" \\
  --data-raw '<speak version="1.0" xml:lang="tl-PH">
    <voice name="${voiceCode}">
      <prosody rate="${rateSign}" pitch="${pitchSign}">
        ${sanitizedText}
      </prosody>
    </voice>
  </speak>' \\
  --output synthesized_tagalog.mp3`;
  }

  // ElevenLabs
  return `curl -X POST \\
  "https://api.elevenlabs.io/v1/text-to-speech/${voiceCode}" \\
  -H "xi-api-key: YOUR_ELEVENLABS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "${sanitizedText}",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.75,
      "speed": ${speed.toFixed(2)}
    }
  }' \\
  --output synthesized_tagalog.mp3`;
}

export function generateNodeSnippet(
  provider: 'google' | 'azure' | 'elevenlabs',
  text: string,
  voiceCode: string,
  pitch: number,
  speed: number
): string {
  const sanitizedText = text.replace(/'/g, "\\'").replace(/\n/g, ' ');

  if (provider === 'google') {
    return `// npm install @google-cloud/text-to-speech
import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import util from 'util';

const client = new textToSpeech.TextToSpeechClient();

async function quickStart() {
  const request = {
    input: { text: '${sanitizedText}' },
    voice: { languageCode: 'tl-PH', name: '${voiceCode}' },
    audioConfig: { 
      audioEncoding: 'MP3',
      speakingRate: ${speed.toFixed(2)},
      pitch: ${((pitch - 1) * 20).toFixed(1)} 
    },
  };

  const [response] = await client.synthesizeSpeech(request);
  const writeFile = util.promisify(fs.writeFile);
  await writeFile('output.mp3', response.audioContent, 'binary');
  console.log('Audio content written to file: output.mp3');
}
quickStart();`;
  }

  if (provider === 'azure') {
    const ratePercent = Math.round((speed - 1) * 100);
    const rateSign = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
    const pitchPercent = Math.round((pitch - 1) * 50);
    const pitchSign = pitchPercent >= 0 ? `+${pitchPercent}%` : `${pitchPercent}%`;

    return `// npm install microsoft-cognitiveservices-speech-sdk
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import fs from "fs";

const speechConfig = sdk.SpeechConfig.fromSubscription(
  "YOUR_AZURE_SPEECH_KEY", 
  "eastus"
);
const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

const ssml = \`<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="tl-PH">
  <voice name="${voiceCode}">
    <prosody rate="${rateSign}" pitch="${pitchSign}">
      ${sanitizedText}
    </prosody>
  </voice>
</speak>\`;

synthesizer.speakSsmlAsync(
  ssml,
  result => {
    if (result.audioData) {
      fs.writeFileSync("output.mp3", Buffer.from(result.audioData));
      console.log("Synthesized successfully, saved to output.mp3");
    }
    synthesizer.close();
  },
  err => {
    console.error(err);
    synthesizer.close();
  }
);`;
  }

  // ElevenLabs
  return `// npm install axios
import axios from 'axios';
import fs from 'fs';

async function synthezis() {
  const response = await axios({
    method: 'POST',
    url: 'https://api.elevenlabs.io/v1/text-to-speech/${voiceCode}',
    headers: {
      'xi-api-key': 'YOUR_ELEVENLABS_API_KEY',
      'Content-Type': 'application/json',
    },
    data: {
      text: '${sanitizedText}',
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    },
    responseType: 'stream'
  });

  const writer = fs.createWriteStream('output.mp3');
  response.data.pipe(writer);
  console.log('Stream piped, saving to output.mp3');
}
synthezis();`;
}

export function generatePythonSnippet(
  provider: 'google' | 'azure' | 'elevenlabs',
  text: string,
  voiceCode: string,
  pitch: number,
  speed: number
): string {
  const escapedText = text.replace(/'/g, "\\'").replace(/\n/g, ' ');

  if (provider === 'google') {
    return `# pip install google-cloud-texttospeech
from google.cloud import texttospeech

client = texttospeech.TextToSpeechClient()

synthesis_input = texttospeech.SynthesisInput(text='${escapedText}')

voice = texttospeech.VoiceSelectionParams(
    language_code="tl-PH", 
    name="${voiceCode}"
)

audio_config = texttospeech.AudioConfig(
    audio_encoding=texttospeech.AudioEncoding.MP3,
    speaking_rate=${speed.toFixed(2)},
    pitch=${((pitch - 1.0) * 20.0).toFixed(1)}
)

response = client.synthesize_speech(
    input=synthesis_input, voice=voice, audio_config=audio_config
)

with open("output.mp3", "wb") as out:
    out.write(response.audio_content)
    print('Audio content written to file: output.mp3')`;
  }

  if (provider === 'azure') {
    const ratePercent = Math.round((speed - 1) * 100);
    const rateSign = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
    const pitchPercent = Math.round((pitch - 1) * 50);
    const pitchSign = pitchPercent >= 0 ? `+${pitchPercent}%` : `${pitchPercent}%`;

    return `# pip install azure-cognitiveservices-speech
import azure.cognitiveservices.speech as speechsdk

speech_config = speechsdk.SpeechConfig(
    subscription="YOUR_AZURE_SPEECH_KEY", 
    region="eastus"
)
audio_config = speechsdk.audio.AudioOutputConfig(filename="output.mp3")

synthesizer = speechsdk.SpeechSynthesizer(
    speech_config=speech_config, 
    audio_config=audio_config
)

ssml = """<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="tl-PH">
  <voice name="${voiceCode}">
    <prosody rate="${rateSign}" pitch="${pitchSign}">
      ${escapedText}
    </prosody>
  </voice>
</speak>"""

result = synthesizer.speak_ssml_async(ssml).get()
if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
    print("Synthesized successfully, saved to output.mp3")
else:
    print(f"Error: {result.reason}")`;
  }

  // ElevenLabs
  return `# pip install requests
import requests

url = "https://api.elevenlabs.io/v1/text-to-speech/${voiceCode}"

headers = {
    "xi-api-key": "YOUR_ELEVENLABS_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "text": "${escapedText}",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.75
    }
}

response = requests.post(url, json=data, headers=headers)
if response.status_code == 200:
    with open("output.mp3", "wb") as f:
        f.write(response.content)
    print("Synthesized successfully, saved to output.mp3")
else:
    print(f"Error {response.status_code}: {response.text}")`;
}
