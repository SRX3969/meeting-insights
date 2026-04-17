import { useChat } from "@ai-sdk/react";
import { X, Send, Sparkles, MessageSquare, ListChecks, Lightbulb, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { useRef, useEffect } from "react";

interface MeetingChatProps {
  isOpen: boolean;
  onClose: () => void;
  meetingTitle: string;
  transcript: string;
}

export function MeetingChat({ isOpen, onClose, meetingTitle, transcript }: MeetingChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit, setInput, isLoading } = useChat({
    api: "/api/chat-meeting",
    body: {
      transcript,
      meetingTitle,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hi! I can help you analyze "${meetingTitle}". Ask me anything or try a quick action below.`
      }
    ]
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const quickActions = [
    { label: "Summarize", icon: Sparkles, prompt: "Give me a 3-sentence summary of this meeting." },
    { label: "Key Insights", icon: Lightbulb, prompt: "What are the 3 most important strategic insights from this meeting?" },
    { label: "Action Items", icon: ListChecks, prompt: "Who is responsible for what? List each person and their specific tasks." },
    { label: "Improve", icon: Zap, prompt: "How could this meeting have been more productive? Give me feedback based on the transcript." }
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-[100] border-l border-black/5 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
           <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
           </div>
           <h3 className="font-black text-sm uppercase tracking-widest text-[#0A0A0A]">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
          <X className="h-4.5 w-4.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, i) => (
             <button
                key={i}
                onClick={() => setInput(action.prompt)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-black/5 bg-black/[0.02] hover:bg-primary/5 hover:border-primary/20 transition-all text-[11px] font-bold text-[#0A0A0A] group"
             >
                <action.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                {action.label}
             </button>
          ))}
        </div>

        <div className="space-y-6">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                ? 'bg-primary text-white font-medium shadow-lg shadow-primary/10' 
                : 'bg-black/[0.03] text-[#1A1A1A] font-medium border border-black/[0.02]'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-black/[0.03] p-4 rounded-2xl border border-black/[0.02] flex gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-black/5 bg-white">
        <form onSubmit={handleSubmit} className="relative">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything about the meeting..."
            className="w-full pl-4 pr-12 py-4 rounded-2xl bg-black/[0.03] border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/60 transition-all"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1.5 h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
