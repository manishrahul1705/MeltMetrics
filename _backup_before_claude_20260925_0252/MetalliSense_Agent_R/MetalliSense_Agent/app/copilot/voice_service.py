"""
Voice Services for AI Copilot
Handles Speech-to-Text and Text-to-Speech

STT: Groq Whisper (unchanged, already working in this project).
TTS: gTTS by default (unchanged, already working) — OR ElevenLabs if
     TTS_PROVIDER=elevenlabs and ELEVENLABS_API_KEY is set, for
     higher-quality voice output.

⚠️ The ElevenLabs path has NOT been tested against a live API call — no
ElevenLabs key is available in the environment this was built in, and
api.elevenlabs.io is not reachable from that sandbox at all. The request
shape matches ElevenLabs' public REST API docs exactly, but you are the
first to actually call it. If it errors, paste the exact error and it can
be fixed from the real response instead of guesswork.
"""
import os
import requests
from pathlib import Path
from typing import BinaryIO, Optional, Dict
import io

# Speech-to-Text: Groq Whisper API
from groq import Groq

# Text-to-Speech: gTTS (Google Text-to-Speech - Free, default)
from gtts import gTTS

TTS_PROVIDER = os.getenv("TTS_PROVIDER", "gtts").lower()  # "gtts" | "elevenlabs"
ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"
# Default voice: "Rachel", a standard premade ElevenLabs voice. Override
# with ELEVENLABS_VOICE_ID for a different one (see elevenlabs.io/app/voice-library).
DEFAULT_ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"


class VoiceService:
    """
    Voice interaction service for AI Copilot

    Features:
    - Speech-to-Text using Groq Whisper
    - Text-to-Speech using gTTS (default) or ElevenLabs (if configured)
    - Multiple language support
    - Audio file handling
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Args:
            api_key: Groq API key for Whisper (STT). TTS provider/key is
                     configured separately via TTS_PROVIDER / ELEVENLABS_API_KEY.
        """
        self.api_key = api_key or os.getenv('GROQ_API_KEY')

        if not self.api_key:
            raise ValueError("Groq API key required for voice services (used for speech-to-text)")

        self.client = Groq(api_key=self.api_key)
        self.whisper_model = "whisper-large-v3"

        self.tts_provider = TTS_PROVIDER
        self.elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
        self.elevenlabs_voice_id = os.getenv("ELEVENLABS_VOICE_ID", DEFAULT_ELEVENLABS_VOICE_ID)

        if self.tts_provider == "elevenlabs" and not self.elevenlabs_api_key:
            print("⚠️  TTS_PROVIDER=elevenlabs but ELEVENLABS_API_KEY is not set — "
                  "falling back to gTTS for text-to-speech.")
            self.tts_provider = "gtts"

    def transcribe_audio(
        self,
        audio_file: BinaryIO,
        language: str = "en"
    ) -> Dict[str, str]:
        """Convert speech to text using Groq Whisper (unchanged)."""
        try:
            transcription = self.client.audio.transcriptions.create(
                file=audio_file,
                model=self.whisper_model,
                language=language,
                response_format="json"
            )
            return {"text": transcription.text, "language": language, "success": True}
        except Exception as e:
            return {"text": "", "error": str(e), "success": False}

    def text_to_speech(
        self,
        text: str,
        language: str = "en",
        slow: bool = False
    ) -> bytes:
        """
        Convert text to speech. Uses ElevenLabs if configured and available,
        otherwise gTTS (default, already-working behavior).
        """
        if self.tts_provider == "elevenlabs":
            audio = self._elevenlabs_tts(text)
            if audio:
                return audio
            print("ElevenLabs TTS failed — falling back to gTTS for this request.")

        return self._gtts_tts(text, language, slow)

    def _gtts_tts(self, text: str, language: str = "en", slow: bool = False) -> bytes:
        try:
            tts = gTTS(text=text, lang=language, slow=slow)
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            return audio_buffer.read()
        except Exception as e:
            print(f"TTS Error: {e}")
            return b""

    def _elevenlabs_tts(self, text: str) -> Optional[bytes]:
        """
        Calls ElevenLabs' text-to-speech REST API directly.
        Docs: https://elevenlabs.io/docs/api-reference/text-to-speech
        """
        if not self.elevenlabs_api_key:
            return None
        try:
            url = f"{ELEVENLABS_API_URL}/{self.elevenlabs_voice_id}"
            headers = {
                "xi-api-key": self.elevenlabs_api_key,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            }
            payload = {
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
            }
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            if response.status_code == 200:
                return response.content
            print(f"ElevenLabs TTS error: {response.status_code} {response.text}")
            return None
        except Exception as e:
            print(f"ElevenLabs TTS request failed: {e}")
            return None

    def text_to_speech_file(
        self,
        text: str,
        output_path: str,
        language: str = "en",
        slow: bool = False
    ) -> bool:
        """Convert text to speech and save to file (uses whichever provider is active)."""
        try:
            audio_bytes = self.text_to_speech(text, language, slow)
            if not audio_bytes:
                return False
            with open(output_path, "wb") as f:
                f.write(audio_bytes)
            return True
        except Exception as e:
            print(f"TTS File Error: {e}")
            return False

    def get_supported_languages(self) -> Dict[str, str]:
        """Language support depends on the active TTS provider — this list
        reflects gTTS's common languages; ElevenLabs supports a similar
        but not identical set (multilingual_v2 model covers ~29 languages)."""
        return {
            "en": "English", "es": "Spanish", "fr": "French", "de": "German",
            "it": "Italian", "pt": "Portuguese", "ru": "Russian", "ja": "Japanese",
            "ko": "Korean", "zh": "Chinese", "hi": "Hindi", "ar": "Arabic"
        }

    def get_tts_provider(self) -> str:
        """Which TTS backend is actually active right now."""
        return self.tts_provider


# Singleton instance
_voice_service_instance = None

def get_voice_service() -> VoiceService:
    """Get or create voice service instance"""
    global _voice_service_instance
    if _voice_service_instance is None:
        _voice_service_instance = VoiceService()
    return _voice_service_instance
