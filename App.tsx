
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getGeminiChat } from './services/geminiService';
import { ScenarioType, AsymmetricStep, ChatMessage } from './types';

// Components
const Header: React.FC = () => (
  <header class="relative w-full h-80 overflow-hidden flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90 z-10"></div>
    <img 
      alt="Cenário Digital" 
      className="absolute inset-0 w-full h-full object-cover" 
      src="https://picsum.photos/seed/crypto/1600/900" 
    />
    <div className="relative z-20 text-center px-4">
      <span className="inline-block py-1 px-3 rounded-full bg-blue-500/30 border border-blue-400 text-blue-200 text-sm font-semibold mb-4">
        Mini Aula Interativa • 10 Minutos
      </span>
      <h1 className="text-4xl md:text-6xl font-bold mb-2 text-white drop-shadow-lg">
        Criptografia: Tech & Prática
      </h1>
      <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto opacity-90">
        Dos bilhetes secretos no corredor à segurança do seu banco digital.
      </p>
    </div>
  </header>
);

const AsymmetricVisualizer: React.FC<{ step: number }> = ({ step }) => {
  return (
    <div className="flex justify-between items-center w-full px-4 md:px-12 mt-6 relative">
      <div className="absolute w-full h-1 bg-slate-700 top-1/2 left-0 -translate-y-1/2 z-0"></div>
      
      {/* Me (Owner) */}
      <div className={`flex flex-col items-center gap-2 z-10 transition-transform ${step === 3 ? 'scale-110' : ''}`}>
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center border-4 border-slate-700 shadow-xl relative">
          <span className="material-symbols-outlined text-3xl text-white fill-1">person</span>
          <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-1 rounded-full shadow-md" title="Chave Privada">
            <span className="material-symbols-outlined text-xs">key</span>
          </div>
        </div>
        <span className="text-sm font-bold text-blue-300">EU (Dono)</span>
      </div>

      {/* Moving Object Container */}
      <div className="flex-1 flex justify-center items-center z-10">
        <div 
          className="bg-slate-800 p-4 rounded-full border-2 border-slate-500 shadow-2xl transition-all duration-700 ease-in-out transform"
          style={{ 
            transform: `translateX(${step === 1 || step === 2 ? '40%' : step === 3 ? '0%' : '-40%'}) scale(${step === 0 ? 0.8 : 1})`,
            opacity: step === 0 ? 0.5 : 1
          }}
        >
          {step === 2 || step === 3 ? (
            <span className="material-symbols-outlined text-3xl text-red-400 fill-1">lock</span>
          ) : (
            <span className="material-symbols-outlined text-3xl text-slate-300">lock_open</span>
          )}
        </div>
      </div>

      {/* Class (Users) */}
      <div className={`flex flex-col items-center gap-2 z-10 transition-opacity ${step >= 1 ? 'opacity-100' : 'opacity-30'}`}>
        <div className="w-16 h-16 rounded-full bg-pink-600 flex items-center justify-center border-4 border-slate-700 shadow-xl">
          <span className="material-symbols-outlined text-3xl text-white fill-1">group</span>
        </div>
        <span className="text-sm font-bold text-pink-300">TURMA</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [scenario, setScenario] = useState<ScenarioType>('glass');
  const [caesarMsg, setCaesarMsg] = useState('CRIPTOGRAFIA');
  const [caesarShift, setCaesarShift] = useState(3);
  const [asymStep, setAsymStep] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const asymSteps: AsymmetricStep[] = [
    { text: "Passo 1: Eu distribuo cadeados ABERTOS.", sub: "Qualquer um pode pegar um (Chave Pública).", progress: "25%", btnLabel: "Distribuir" },
    { text: "Passo 2: Alguém tranca uma mensagem com meu cadeado.", sub: "Click! Agora ninguém mais abre sem a chave.", progress: "50%", btnLabel: "Trancar" },
    { text: "Passo 3: O cadeado trancado volta para mim.", sub: "Pode passar pelo corredor cheio de curiosos.", progress: "75%", btnLabel: "Enviar" },
    { text: "Passo 4: Só EU tenho a chave que abre este cadeado.", sub: "Chave Privada guardada no meu bolso.", progress: "100%", btnLabel: "Reiniciar" }
  ];

  const getCaesarResult = () => {
    return caesarMsg.toUpperCase().split('').map(char => {
      const idx = alphabet.indexOf(char);
      if (idx === -1) return char;
      return alphabet[(idx + caesarShift) % 26];
    }).join('');
  };

  const nextAsymStep = () => {
    setAsymStep((prev) => (prev + 1) % asymSteps.length);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const chat = getGeminiChat(process.env.API_KEY || '');
      const result = await chat.sendMessage({ message: chatInput });
      const modelMsg: ChatMessage = { role: 'model', parts: [{ text: result.text || 'Desculpe, não consegui processar isso.' }] };
      setChatHistory(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: 'Ops! Tive um erro de conexão. Tente novamente em um instante.' }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* AI Assistant FAB */}
      <button 
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center gap-2 group"
      >
        <span className="material-symbols-outlined text-3xl">psychology</span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold pr-2">Dúvidas?</span>
      </button>

      {/* AI Chat Drawer */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm h-[500px] bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">shield_person</span>
              <span className="font-bold">CryptoExpert AI</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="hover:text-red-400">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-slate-400 mt-10">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">smart_toy</span>
                <p>Olá! Sou seu guia. Pergunte qualquer coisa sobre criptografia!</p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700 border border-slate-600'}`}>
                  {msg.parts[0].text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 p-3 rounded-2xl flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 bg-slate-900 flex gap-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Ex: Como funciona o RSA?"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button onClick={handleSendChat} className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Sections */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-24">
        
        {/* Section 1: Scenario */}
        <section className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-lg">1</span>
            <h2 className="text-3xl font-bold text-blue-400">O Cenário: A Internet é um Corredor</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex flex-col justify-center">
              <p className="text-slate-300 mb-8 leading-relaxed text-lg">
                Imagine a internet como o corredor de uma escola barulhenta. Enviar uma mensagem normal é como carregar uma carta em uma <strong>Caixa de Vidro</strong>. Qualquer um que olhar para você pode ler o conteúdo.
              </p>
              <div className="space-y-4">
                <button 
                  onClick={() => setScenario('glass')}
                  className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all ${scenario === 'glass' ? 'bg-red-900/20 border-red-500 ring-2 ring-red-500/50' : 'bg-white/5 border-slate-700 hover:bg-white/10'}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${scenario === 'glass' ? 'text-red-400' : 'text-slate-500'}`}>visibility</span>
                    <span className="font-semibold">Caixa de Vidro</span>
                  </span>
                  <span className="text-xs uppercase tracking-tighter opacity-60">Vulnerável</span>
                </button>
                <button 
                  onClick={() => setScenario('safe')}
                  className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all ${scenario === 'safe' ? 'bg-green-900/20 border-green-500 ring-2 ring-green-500/50' : 'bg-white/5 border-slate-700 hover:bg-white/10'}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${scenario === 'safe' ? 'text-green-400' : 'text-slate-500'}`}>lock</span>
                    <span className="font-semibold">Cofre de Aço</span>
                  </span>
                  <span className="text-xs uppercase tracking-tighter opacity-60">Seguro</span>
                </button>
              </div>
            </div>

            <div className="relative h-80 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-black group">
              <img 
                src={scenario === 'glass' ? "https://picsum.photos/seed/glassbox/800/600" : "https://picsum.photos/seed/vault/800/600"} 
                className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-500" 
                alt="Visualização" 
              />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className={`p-6 rounded-2xl shadow-2xl font-mono text-xl md:text-2xl transition-all duration-500 ${scenario === 'glass' ? 'bg-white text-black translate-y-0' : 'bg-slate-900 text-green-400 border border-green-500 scale-90 blur-[2px]'}`}>
                  {scenario === 'glass' ? '"Ola Mae, a senha eh 123"' : 'X7k#9Lm!_Pq$Z'}
                </div>
              </div>
              <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${scenario === 'glass' ? 'bg-red-600' : 'bg-green-600'}`}>
                {scenario === 'glass' ? 'Vulnerável' : 'Criptografado'}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Caesar Cipher */}
        <section className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-purple-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-lg">2</span>
            <h2 className="text-3xl font-bold text-purple-400">A Lógica: Cifra de César</h2>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                  O método mais antigo! Simplesmente <strong>deslocamos</strong> o alfabeto. Se a chave for 3, 'A' vira 'D'. Quando chegamos no 'Z', voltamos para o 'A'.
                </p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase text-slate-500 tracking-widest mb-2 font-bold">Mensagem (Máx 12)</label>
                    <input 
                      type="text" 
                      maxLength={12}
                      value={caesarMsg}
                      onChange={(e) => setCaesarMsg(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xl font-mono tracking-widest text-purple-400 outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs uppercase text-slate-500 tracking-widest font-bold">Deslocamento (Chave)</label>
                      <span className="text-purple-400 font-mono font-bold text-lg">+{caesarShift}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="25" 
                      value={caesarShift}
                      onChange={(e) => setCaesarShift(parseInt(e.target.value))}
                      className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 h-full flex flex-col justify-center items-center">
                <div className="text-center space-y-4">
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Resultado Cifrado</div>
                  <div className="text-4xl md:text-5xl font-mono font-bold text-white tracking-widest bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent py-2">
                    {getCaesarResult() || '...'}
                  </div>
                  <div className="flex justify-center gap-1 opacity-20">
                    {alphabet.split('').map((c, i) => (
                      <span key={i} className="text-[8px]">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-2xl flex gap-4 items-start">
              <span className="material-symbols-outlined text-red-400">gavel</span>
              <p className="text-sm text-red-200/80">
                <strong>Ponto Fraco:</strong> Como só existem 26 possibilidades, qualquer computador (ou pessoa paciente) consegue quebrar essa cifra em segundos testando todos os deslocamentos.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Asymmetric Encryption */}
        <section className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-green-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-lg">3</span>
            <h2 className="text-3xl font-bold text-green-400">O Cadeado: Assimétrica</h2>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
            <p className="text-slate-300 text-center max-w-2xl mx-auto mb-12 text-lg">
              Na criptografia moderna, usamos <strong>Duas Chaves</strong>. Uma para trancar (Pública) e uma diferente para abrir (Privada). Imagine um cadeado que você entrega aberto para todo mundo.
            </p>

            <div className="relative bg-slate-950 rounded-3xl p-8 border border-slate-800 min-h-[350px] flex flex-col items-center justify-center">
              {/* Progress Bar */}
              <div className="absolute top-6 w-1/2 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500" 
                  style={{ width: asymSteps[asymStep].progress }}
                />
              </div>

              <AsymmetricVisualizer step={asymStep} />

              <div className="mt-12 text-center space-y-2">
                <h4 className="text-xl font-bold text-white">{asymSteps[asymStep].text}</h4>
                <p className="text-slate-400">{asymSteps[asymStep].sub}</p>
              </div>

              <button 
                onClick={nextAsymStep}
                className="mt-8 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-green-900/20 transition-all flex items-center gap-2"
              >
                <span>{asymSteps[asymStep].btnLabel}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: HTTPS */}
        <section className="scroll-mt-24 pb-24">
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-yellow-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-lg">4</span>
            <h2 className="text-3xl font-bold text-yellow-500">HTTPS: Segurança Real</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-400">lock</span> HTTPS
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800">
                    <span className="material-symbols-outlined text-blue-400 mt-1">handshake</span>
                    <div>
                      <h5 className="font-bold text-blue-300">1. O Acordo (Assimétrica)</h5>
                      <p className="text-xs text-slate-400">Usamos o "Cadeado" pesado apenas para trocar uma chave simples no início. É lento, mas garante que ninguém finja ser quem não é.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800">
                    <span className="material-symbols-outlined text-yellow-400 mt-1">bolt</span>
                    <div>
                      <h5 className="font-bold text-yellow-300">2. O Fluxo (Simétrica)</h5>
                      <p className="text-xs text-slate-400">Assim que a chave simples é trocada, usamos ela para enviar vídeos e dados pesados com rapidez total.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden group border border-slate-800 shadow-2xl">
              <img 
                src="https://picsum.photos/seed/network/800/600" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60" 
                alt="Digital Tunnel"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8">
                <div className="bg-slate-950/80 backdrop-blur-md p-6 rounded-2xl border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-yellow-500 uppercase tracking-widest">Live Secured Data</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    Quando você assiste um vídeo no YouTube, seu navegador não "tranca e destranca" cada pixel com o cadeado pesado. Ele usa o túnel de velocidade criado no início da conversa!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 py-12 text-center border-t border-slate-900">
        <p className="text-slate-500 text-sm">Mini Aula Interativa de Criptografia • © 2024</p>
        <div className="mt-4 flex justify-center gap-4 text-slate-600">
          <span className="material-symbols-outlined hover:text-blue-500 cursor-pointer transition-colors">terminal</span>
          <span className="material-symbols-outlined hover:text-green-500 cursor-pointer transition-colors">security</span>
          <span className="material-symbols-outlined hover:text-purple-500 cursor-pointer transition-colors">vpn_key</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
