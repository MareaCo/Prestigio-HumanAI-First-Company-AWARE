import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Trash2,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
} from "lucide-react";
import { miaChatFn } from "@/lib/miaChat.functions";
import { useApp } from "@/context/AppContext";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

const SUGGESTIONS = [
  "¿Cómo interpreto mis 8 dimensiones de Madurez en IA?",
  "Dame 3 consejos para mejorar en Contexto y Datos",
  "¿Cuáles son los 4 Arquetipos de adopción de IA?",
  "Ayúdame a redactar un prompt para mi trabajo",
  "¿Cómo gestiono los permisos y roles de los colaboradores?",
];

export function MiaChatWidget() {
  const { role } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "model",
      text: "¡Hola! Soy MIA, Estoy aquí para ayudarte a interpretar tus diagnósticos, optimizar tus flujos de trabajo, redactar mejores prompts o responder cualquier duda sobre la plataforma. ¿En qué te puedo ayudar hoy?",
      timestamp: "Ahora",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      setIsOpen(true);
      const customEv = e as CustomEvent<{ prompt?: string }>;
      if (customEv.detail && customEv.detail.prompt) {
        setInputMessage(customEv.detail.prompt);
      }
    };
    window.addEventListener("open-mia-chat", handleOpenEvent);
    return () => window.removeEventListener("open-mia-chat", handleOpenEvent);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!customText) setInputMessage("");
    setLoading(true);

    try {
      // Build history for API
      const history = newMessages
        .filter((m) => m.id !== "welcome-1")
        .slice(-10) // Send up to last 10 messages for context
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      // Call server function
      const res = await miaChatFn({
        data: {
          message: textToSend,
          history,
          userContext: {
            role,
            employeeName: "Usuario",
            companyName: "Marea / Prestigio",
          },
        },
      });

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "model",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      console.error("Error asking MIA:", err);
      const errorText =
        err instanceof Error ? err.message : "Error de comunicación con MIA";
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "model",
        text: `⚠️ **Ocurrió un inconveniente:** ${errorText}. Por favor intenta de nuevo.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm("¿Deseas reiniciar la conversación con MIA?")) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: "model",
          text: "¡Hola de nuevo! He reiniciado el chat. ¿En qué puedo ayudarte ahora?",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Drawer / Window */}
      <div className="w-[380px] sm:w-[420px] h-[580px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-ink/10 flex flex-col overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-5 duration-200">
        {/* Header */}
        <div className="bg-ink text-cream p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0D7A5F] via-[#2B5B84] to-[#0D7A5F] p-[2px] shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-ink rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#EBF6F1] animate-pulse" />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#0D7A5F] border-2 border-ink"></span>
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white tracking-wide">
                MIA
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-cream/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Reiniciar chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-cream/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Cerrar chat"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F5F0]/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "model" && (
                <div className="w-7 h-7 rounded-full bg-ink text-cream flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4 text-[#0D7A5F]" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm relative group ${
                  msg.role === "user"
                    ? "bg-ink text-cream rounded-tr-none"
                    : "bg-white text-ink border border-ink/10 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {formatMarkdown(msg.text)}
                </div>

                <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-current/10 text-[10px] opacity-60">
                  <span>{msg.timestamp}</span>
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="hover:opacity-100 flex items-center gap-1 transition-opacity"
                    title="Copiar respuesta"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-[#0D7A5F]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-slate-200 text-ink flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <User className="w-4 h-4 text-slate-700" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-center gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-ink text-cream flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-[#0D7A5F] animate-spin" />
              </div>
              <div className="bg-white border border-ink/10 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0D7A5F] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#0D7A5F] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#0D7A5F] animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] text-ink-muted ml-2 font-medium">
                  MIA está pensando…
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Chips */}
        {messages.length <= 2 && (
          <div className="p-3 bg-white border-t border-ink/5 shrink-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-ink-muted mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#0D7A5F]" /> Sugerencias de
              consulta:
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug)}
                  disabled={loading}
                  className="text-[11px] text-ink/80 bg-[#F7F5F0] hover:bg-[#0D7A5F] hover:text-white px-2.5 py-1 rounded-full border border-ink/10 transition-all text-left truncate max-w-full font-medium"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Footer */}
        <div className="p-3 bg-white border-t border-ink/10 shrink-0">
          <div className="flex items-end gap-2 bg-slate-50 border border-ink/10 rounded-xl p-1.5 focus-within:border-[#0D7A5F] focus-within:ring-1 focus-within:ring-[#0D7A5F]/20 transition-all">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta a MIA… (Enter para enviar)"
              rows={1}
              className="flex-1 bg-transparent border-0 focus:ring-0 resize-none text-xs text-ink placeholder:text-ink-muted max-h-24 min-h-[36px] py-2 px-2"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || loading}
              className="w-9 h-9 rounded-lg bg-[#0D7A5F] text-white flex items-center justify-center shrink-0 hover:bg-[#0D7A5F]/90 disabled:opacity-40 disabled:hover:bg-[#0D7A5F] transition-all shadow-sm"
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-ink-muted mt-1.5 px-1">
            <span>Shift + Enter para salto de línea</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#0D7A5F]" /> Impulsado por
              Gemini
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple helper to format basic Markdown bold/code/bullets nicely
function formatMarkdown(text: string) {
  const parts = text.split("\n");
  return parts.map((line, idx) => {
    // Check if line is bullet point
    const isBullet =
      line.trim().startsWith("- ") || line.trim().startsWith("* ");
    const cleanLine = isBullet ? line.trim().replace(/^[-*]\s+/, "") : line;

    // Bold parsing (**text**)
    const elements = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(cleanLine)) !== null) {
      if (match.index > lastIndex) {
        elements.push(cleanLine.substring(lastIndex, match.index));
      }
      elements.push(
        <strong key={match.index} className="font-semibold text-ink">
          {match[1]}
        </strong>,
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < cleanLine.length) {
      elements.push(cleanLine.substring(lastIndex));
    }

    if (isBullet) {
      return (
        <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-2">
          <span className="text-[#0D7A5F] font-bold shrink-0">•</span>
          <div>{elements.length > 0 ? elements : cleanLine}</div>
        </div>
      );
    }

    return (
      <div key={idx} className={line.trim() === "" ? "h-2" : "my-0.5"}>
        {elements.length > 0 ? elements : line}
      </div>
    );
  });
}
