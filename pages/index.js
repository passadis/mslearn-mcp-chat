import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';

const isValidUrl = (url) => {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
};
// Custom hook for communication with our own backend API route
const useMcp = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendMessage = async (message) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/mcp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data.reply;
        } catch (err) {
            setError(err.message || 'Something went wrong');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { sendMessage, isLoading, error };
};

export default function ChatPage() {
    const [messages, setMessages] = useState([{ text: "Hello! I can search the official Microsoft Learn documentation. What would you like to know?", sender: 'ai' }]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const { sendMessage, isLoading, error } = useMcp();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const aiResponseText = await sendMessage(input);
            const aiMessage = { text: aiResponseText, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            // Error is already handled by the hook
        }
    };

    const UserIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );

    const AiIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    );

    // Logo placeholder components
    // const LeftLogo = () => (
    //     <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-blue-400/30">
    //         <span className="text-white font-bold text-lg">MS</span>
    //     </div>
      const LeftLogo = () => (
          <Image
              src="/cblogger.png"
              alt="CloudBlogger"
              width={52}
              height={48}
              className="w-14 h-12 rounded-xl shadow-lg"
              priority
          />
      );
    
    // const RightLogo = () => (
    //     <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg border border-purple-400/30">
    //         <span className="text-white font-bold text-lg">AI</span>
    //     </div>
    // );
      const RightLogo = () => (
          <Image
              src="/cpilot.png"
              alt="Microsoft"
              width={54}
              height={48}
              className="w-15 h-12 rounded-xl shadow-lg"
              priority
          />
      );



    // Function to parse markdown-style links
    const parseMessageWithLinks = (text) => {
        if (!text || typeof text !== 'string') {
            return text;
        }

        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
            }

            parts.push(
                <a
                    key={`link-${match.index}`}
                    href={isValidUrl(match[2]) ? match[2] : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-medium bg-blue-500/10 px-1 py-0.5 rounded transition-colors"
                >
                    {match[1]}
                </a>
            );

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
        }

        return parts.length > 0 ? parts : <span>{text}</span>;
    };

    return (
        <>
            <Head>
                <title>MS Learn AI Chat</title>
                <meta name="description" content="Chat with an AI to search Microsoft Learn documentation." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            
            <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
                {/* Background pattern */}
                <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
                <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
                
                <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-4" style={{ height: '80vh' }}>
                    <div className="w-full max-w-4xl h-full flex flex-col bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
                        
                        {/* Enhanced Header with Logo Placeholders */}
                        <header className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <LeftLogo />
                                <div className="flex-1 text-center">
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                        MS Learn AI Assistant
                                    </h1>
                                    <p className="text-sm text-blue-100/80 mt-1 font-medium">
                                        Powered by Microsoft Learn MCP Server
                                    </p>
                                </div>
                                <RightLogo />
                            </div>
                        </header>

                        {/* Chat Messages Area */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-gray-900/50 to-gray-800/50">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex items-start gap-4 ${
                                        msg.sender === 'user' ? 'justify-end' : ''
                                    }`}
                                >
                                    {msg.sender === 'ai' && (
                                        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg border border-blue-400/30">
                                            <AiIcon />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-md p-4 rounded-2xl whitespace-pre-wrap shadow-lg backdrop-blur-sm border ${
                                            msg.sender === 'user'
                                                ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 border-indigo-400/30 rounded-br-none hover:from-indigo-500/90 hover:to-purple-500/90 transition-all duration-200'
                                                : 'bg-gradient-to-r from-gray-700/90 to-gray-600/90 border-gray-500/30 rounded-bl-none hover:from-gray-600/90 hover:to-gray-500/90 transition-all duration-200'
                                        }`}
                                    >
                                        <div className="text-white">{parseMessageWithLinks(msg.text)}</div>
                                    </div>
                                    {msg.sender === 'user' && (
                                        <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg border border-indigo-400/30">
                                            <UserIcon />
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {isLoading && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse shadow-lg">
                                        <AiIcon />
                                    </div>
                                    <div className="max-w-md p-4 bg-gradient-to-r from-gray-700/90 to-gray-600/90 rounded-2xl rounded-bl-none shadow-lg backdrop-blur-sm border border-gray-500/30">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="p-4 text-red-300 text-center border-t border-gray-700/50 bg-red-900/20 backdrop-blur-sm">
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-6 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-sm">
                            <form onSubmit={handleSend} className="flex items-center space-x-4">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about Azure, .NET, Power Platform, etc..."
                                    className="flex-1 p-4 bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-white placeholder-gray-400 shadow-inner"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 shadow-lg border border-blue-400/30"
                                >
                                    {isLoading ? (
                                        <svg
                                            className="animate-spin h-6 w-6 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}