/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { MoreVertical, Globe } from "lucide-react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import MultilingualVoiceInput from "./Input";
import axios from "axios";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@radix-ui/react-select";

const initialMessage = {
  id: 1,
  text: "👋 Hello! I'm your translator. I'm here to translate from Gujarati to English",
  isBot: true,
  timestamp: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

const LoadingIndicator = () => (
  <div className="flex items-start gap-3 animate-fade-in px-4">
    <Avatar className="w-10 h-10">
      <AvatarImage src="/api/placeholder/32/32" />
      <AvatarFallback className="bg-gray-200">
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      </AvatarFallback>
    </Avatar>
    <div className="flex flex-col gap-2 max-w-[80%]">
      <div className="flex gap-2 items-center text-sm text-gray-600">
        <span className="animate-pulse">Translating your message...</span>
      </div>
    </div>
  </div>
);

const DateDivider = ({ date }) => (
  <div className="flex items-center justify-center my-6 px-4">
    <div className="bg-gray-200 h-[1px] flex-grow" />
    <span className="px-4 text-sm text-gray-500 font-medium">{date}</span>
    <div className="bg-gray-200 h-[1px] flex-grow" />
  </div>
);

const ChatbotUI = () => {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [language, setLanguage] = useState("gujarati");
  const handleLanguageChange = (value) => {
    setLanguage(value);
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleDataFromChild = async (data) => {
    if (data.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: data,
        isBot: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      setIsLoading(true);
      const response = await axios.post("https://ipd-server-olive.vercel.app/generateresponse", {
        query: data,
        language: language.toLowerCase().slice(0, 2),
      });
      console.log(response); 
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 1,
          text: response.data.response,
          isBot: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setIsLoading(false);
    }
  };

  const MessageBubble = ({ message }) =>  (
    <div
      className={`flex items-start gap-3 group animate-fade-in px-4 ${
        message.isBot ? 'justify-start' : 'justify-end'
      }`}
    >
      {message.isBot && (
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src="/api/placeholder/32/32" />
          <AvatarFallback className="bg-gray-200 text-gray-500">
            <div className="flex items-center justify-center h-full">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s',
                    }}
                  />
                ))}
              </div>
            </div>
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`flex flex-col ${
          message.isBot ? 'items-start' : 'items-end'
        }`}
      >
        <div className="flex items-center gap-2">
          {message.isBot && (
            <span className="text-sm font-medium text-gray-700">Translator</span>
          )}
          <span className="text-xs text-gray-500">{message.timestamp}</span>
        </div>
        <div
          className={`mt-1 p-3.5 rounded-2xl relative group ${
            message.isBot
              ? 'bg-white border border-gray-200 rounded-tl-none shadow-sm'
              : 'bg-emerald-600 text-white rounded-tr-none'
          }`}
          style={{ maxWidth: 'min(420px, 80vw)' }}
        >
          {message.text}
          <div
            className={`absolute top-2 ${
              message.isBot ? 'right-2' : 'left-2'
            } opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            <button
              type="button"
              className="p-2 rounded-full transition-all duration-200 bg-white text-gray-700 hover:bg-gray-100"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {!message.isBot && (
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarFallback className="bg-emerald-600 text-white">
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );

  return (
    <div className="h-[100vh] bg-gray-50 flex flex-col">
      <div className="h-full flex flex-col">
        <div className="flex justify-between bg-emerald-600 text-white py-2 px-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Translator</h1>
              <p className="text-sm text-blue-100">
                I'm here to translate from Gujarati to English
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[120px] bg-white text-blue-800">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="gujarati">Gujarati</SelectItem>
                <SelectItem value="marathi">Marathi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <ScrollArea className="flex-grow">
          <div className="m-5 py-4">
            <DateDivider date="Today" />
            <div className="space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && <LoadingIndicator />}
            </div>
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </ScrollArea>
        <MultilingualVoiceInput sendDataToParent={handleDataFromChild} />
      </div>
    </div>
  );
};

export default ChatbotUI;