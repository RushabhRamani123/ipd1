/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useWhisper } from '@chengsokdara/use-whisper';
import { useEffect, useState } from 'react';
import { Search, Send, Mic, MicOff, Loader } from 'lucide-react';

const MultilingualVoiceInput = ({ sendDataToParent, language = 'en' }) => {
  // State Management
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayValue, setDisplayValue] = useState('');
  const [isWebSpeechListening, setIsWebSpeechListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [messageQueue, setMessageQueue] = useState([]);

  // Whisper Configuration for Gujarati
  const {
    recording: whisperRecording,
    transcript: whisperTranscript,
    startRecording: startWhisperRecording,
    stopRecording: stopWhisperRecording,
  } = useWhisper({
    apiKey: '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',
    streaming: true,
    timeSlice: 1000,
    whisperConfig: {
      language: 'gu',
      response_format: 'text',
    },
  });

  // Web Speech Recognition Setup for English
  const setupWebSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      throw new Error('Voice input is not supported in your browser');
    }

    const newRecognition = new window.webkitSpeechRecognition();
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.lang = 'gu-IN';
    return newRecognition;
  };

  // Start Web Speech Recognition
  const startWebSpeechInput = () => {
    setError(null);
    try {
      const newRecognition = setupWebSpeechRecognition();

      newRecognition.onstart = () => {
        setIsWebSpeechListening(true);
        setError(null);
      };

      newRecognition.onresult = (event) => {
        let finalTranscript = '';
        let currentInterimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            setMessageQueue(prev => [...prev, transcript.trim()]);
          } else {
            currentInterimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInput(prev => `${prev} ${finalTranscript}`.trim());
        }
        setInterimTranscript(currentInterimTranscript);
      };

      newRecognition.onerror = (event) => {
        setError(`Voice input error: ${event.error}`);
        stopWebSpeechInput();
      };

      newRecognition.onend = () => {
        if (isWebSpeechListening) {
          try {
            newRecognition.start();
          } catch (err) {
            setError('Failed recognition');
            stopWebSpeechInput();
          }
        }
      };

      newRecognition.start();
      setRecognition(newRecognition);
    } catch (err) {
      setError('Failed to start voice input');
      setIsWebSpeechListening(false);
    }
  };

  // Stop Web Speech Recognition
  const stopWebSpeechInput = () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }
    setIsWebSpeechListening(false);
    setInterimTranscript('');
    
    if (messageQueue.length > 0) {
      setMessageQueue([]);
    }
  };

  // Handle Voice Input Toggle
  const handleVoiceInput = async () => {
    if (language === 'gu') {
      if (whisperRecording) {
        await stopWhisperRecording();
      } else {
        setError(null);
        try {
          await startWhisperRecording();
        } catch (err) {
          setError('Failed to start voice input');
        }
      }
    } else {
      if (isWebSpeechListening) {
        stopWebSpeechInput();
      } else {
        startWebSpeechInput();
      }
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const submitText = displayValue.trim() || input.trim();

    if (!submitText) {
      setError(language === 'gu' 
        ? 'કૃપા કરીને સબમિટ કરતા પહેલા કંઈક ટેક્સ્ટ દાખલ કરો'
        : 'Please enter some text before submitting'
      );
      return;
    }

    setIsLoading(true);

    try {
      sendDataToParent(submitText);
      setInput('');
      setDisplayValue('');
      setInterimTranscript('');
      setMessageQueue([]);
    } catch (err) {
      setError(err.message || (language === 'gu' ? 'એક ભૂલ આવી' : 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    setError(null);
    const newValue = e.target.value;
    setInput(newValue);
    setDisplayValue(newValue);
  };

  // Update Display Value from Whisper
  useEffect(() => {
    if (whisperTranscript.text) {
      setInput(prev => `${prev} ${whisperTranscript.text}`.trim());
      setDisplayValue(`${input} ${whisperTranscript.text}`.trim());
    }
  }, [whisperTranscript.text]);

  // Update Display Value from Web Speech
  useEffect(() => {
    if (interimTranscript || input) {
      setDisplayValue(`${input} ${interimTranscript}`.trim());
    } else {
      setDisplayValue('');
    }
  }, [interimTranscript, input]);

  // Cleanup Effect
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  const isRecording = language === 'gu' ? whisperRecording : isWebSpeechListening;

  return (
    <div className="w-full bg-gradient-to-b from-green-50 to-white border-t shadow-sm">
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative group flex items-center">
            <div className="absolute left-4 text-green-600 pointer-events-none">
              <Search size={20} className="group-focus-within:text-green-700" />
            </div>
            
            <input
              type="text"
              className={`w-full pl-12 pr-24 py-3.5 rounded-2xl border 
                       ${error ? 'border-red-200 focus:ring-red-500/20 focus:border-red-500' 
                              : 'border-green-100 focus:ring-green-500/20 focus:border-green-500'}
                       bg-white shadow-sm transition-all duration-200 ease-in-out
                       placeholder:text-gray-400 text-gray-700
                       focus:outline-none focus:ring-2
                       hover:border-green-200 hover:shadow-md
                       disabled:bg-gray-50 disabled:cursor-not-allowed`}
              placeholder={language === 'gu' ? 'તમારો પ્રશ્ન પૂછો?' : 'Ask your question?'}
              value={displayValue}
              onChange={handleInputChange}
              disabled={isLoading}
              aria-invalid={!!error}
              aria-describedby={error ? "input-error" : undefined}
            />

            <div className="absolute right-2 flex items-center space-x-1">
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={`p-2 rounded-full transition-all duration-200
                          ${isRecording 
                            ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                          disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
              >
                {isRecording ? (
                  <MicOff size={20} className="animate-pulse" />
                ) : (
                  <Mic size={20} />
                )}
              </button>

              <button
                type="submit"
                disabled={!displayValue.trim() || isLoading}
                className={`p-2 rounded-full transition-all duration-200
                          ${displayValue.trim() && !isLoading
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                          disabled:opacity-50`}
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <Send size={20} className={displayValue.trim() ? 'transform rotate-45' : ''} />
                )}
              </button>
            </div>

            <div className={`absolute inset-0 rounded-2xl pointer-events-none
                          ring-1 ring-inset ${error ? 'ring-red-100/50' : 'ring-green-100/50'}`} 
            />
          </div>

          <div className="flex justify-between mt-2 px-4">
            {error ? (
              <p id="input-error" className="text-xs text-red-500 animate-fade-in">
                {error}
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                {isRecording 
                  ? language === 'gu'
                    ? 'રેકોર્ડિંગ ચાલુ છે... માઇક આઇકન પર ક્લિક કરીને રેકોર્ડિંગ બંધ કરો'
                    : 'Listening... Click the mic icon to stop recording'
                  : ''}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultilingualVoiceInput;