import { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User,
  RefreshCw,
  ArrowRight,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { sendChatMessageApi } from '@/services/chatbot/chat.api'
import { useCart } from '@/contexts/CartContext'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MessageItem {
  id: string
  role: 'user' | 'bot'
  content: string
}

const STARTER_PROMPTS = [
  '🎁 Hiện tại đang có khuyến mãi gì không?',
  '📱 Gợi ý cho tôi vài mẫu điện thoại mới',
  '📦 Kiểm tra giúp tôi đơn hàng gần nhất',
  '💎 Xem điểm V-point & Đổi Voucher'
]

export default function ChatbotWidget() {
  const { fetchCart } = useCart()

  const [isOpen, setIsOpen] = useState(() => {
    return sessionStorage.getItem('vtech_chat_is_open') === 'true'
  })

  const [isExpanded, setIsExpanded] = useState(() => {
    return sessionStorage.getItem('vtech_chat_is_expanded') === 'true'
  })

  const [messages, setMessages] = useState<MessageItem[]>(() => {
    const savedMessages = sessionStorage.getItem('vtech_chat_messages')
    return savedMessages
      ? JSON.parse(savedMessages)
      : [
          {
            id: 'welcome',
            role: 'bot',
            content:
              'Chào bạn! Mình là Trợ lý AI của VTech. Bạn cần tư vấn mua điện thoại, laptop hay phụ kiện gì ạ?'
          }
        ]
  })

  const [sessionId, setSessionId] = useState<string | null>(() => {
    return sessionStorage.getItem('vtech_chat_session')
  })

  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    sessionStorage.setItem('vtech_chat_is_open', String(isOpen))
  }, [isOpen])

  useEffect(() => {
    sessionStorage.setItem('vtech_chat_is_expanded', String(isExpanded))
  }, [isExpanded])

  useEffect(() => {
    sessionStorage.setItem('vtech_chat_messages', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    if (sessionId) sessionStorage.setItem('vtech_chat_session', sessionId)
  }, [sessionId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSendMessage = async (suggestedText?: string) => {
    const userText = (suggestedText || inputValue).trim()

    if (!userText || isLoading) return

    if (!suggestedText) {
      setInputValue('')
    }

    const newUserMsg: MessageItem = { id: Date.now().toString(), role: 'user', content: userText }
    setMessages((prev) => [...prev, newUserMsg])
    setIsLoading(true)

    try {
      const data = await sendChatMessageApi(userText, sessionId)
      setSessionId(data.sessionId)

      const newBotMsg: MessageItem = {
        id: Date.now().toString() + 'bot',
        role: 'bot',
        content: data.reply
      }
      setMessages((prev) => [...prev, newBotMsg])

      if (data.reply.includes('Thành công! Đã thêm') || data.reply.includes('vào giỏ hàng')) {
        if (typeof fetchCart === 'function') {
          await fetchCart()
        }
      }
    } catch (error) {
      const errorMsg: MessageItem = {
        id: Date.now().toString() + 'error',
        role: 'bot',
        content: 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau giây lát.'
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const handleResetChat = () => {
    sessionStorage.removeItem('vtech_chat_messages')
    sessionStorage.removeItem('vtech_chat_session')
    setSessionId(null)
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        content: 'Đã làm mới đoạn chat. Bạn cần hỗ trợ gì ạ?'
      }
    ])
  }

  const renderMessageContent = (content: string, role: 'bot' | 'user') => {
    if (role === 'user') {
      return <span className='whitespace-pre-wrap'>{content}</span>
    }

    // ĐÃ FIX: Không cần dùng Regex phức tạp nữa vì Backend đã trả về Markdown chuẩn
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Tách chính xác { children } ra để TypeScript không còn báo lỗi node/props unused
          table: ({ children }) => (
            <div className='overflow-x-auto my-3 rounded-lg border border-slate-200'>
              <table className='w-full text-left border-collapse text-sm bg-white text-slate-800'>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className='bg-red-50 text-red-700 font-bold'>{children}</thead>
          ),
          th: ({ children }) => <th className='border-b border-slate-200 px-3 py-2'>{children}</th>,
          td: ({ children }) => <td className='border-b border-slate-200 px-3 py-2'>{children}</td>,

          ul: ({ children }) => <ul className='list-disc pl-5 my-2 space-y-1'>{children}</ul>,
          ol: ({ children }) => <ol className='list-decimal pl-5 my-2 space-y-1'>{children}</ol>,
          li: ({ children }) => <li className='leading-relaxed'>{children}</li>,

          p: ({ children }) => <p className='mb-2 last:mb-0 leading-relaxed'>{children}</p>,
          strong: ({ children }) => (
            <strong className='font-bold text-slate-900'>{children}</strong>
          ),

          // Tự động rẽ nhánh Link điều hướng nội bộ hoặc mở Tab mới
          a: ({ href, children }) => {
            const isInternal = href?.startsWith('/')
            const btnClass =
              'inline-flex items-center gap-1.5 px-3 py-1.5 my-1 bg-red-600 text-white hover:bg-red-700 rounded-lg text-[13px] font-bold transition-colors shadow-sm no-underline'

            if (!isInternal) {
              return (
                <a href={href} target='_blank' rel='noopener noreferrer' className={btnClass}>
                  {children} <ArrowRight className='h-3.5 w-3.5' />
                </a>
              )
            }
            return (
              <Link to={href || '#'} className={btnClass}>
                {children} <ArrowRight className='h-3.5 w-3.5' />
              </Link>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  const chatWidth = isExpanded ? 'w-[480px] sm:w-[560px]' : 'w-80 sm:w-96'
  const chatHeight = isExpanded ? 'h-[680px]' : 'h-[500px]'

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end'>
      {isOpen && (
        <div
          className={`mb-4 ${chatWidth} bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col ${chatHeight} animate-in fade-in slide-in-from-bottom-10 duration-300 transition-all`}
          style={{ transition: 'width 0.3s ease, height 0.3s ease' }}
        >
          {/* Header */}
          <div className='bg-red-600 p-4 flex items-center justify-between text-white shadow-md shrink-0'>
            <div className='flex items-center gap-2'>
              <div className='bg-white/20 p-1.5 rounded-full'>
                <Bot className='h-5 w-5' />
              </div>
              <div>
                <h3 className='font-bold text-sm'>VTech AI Assistant</h3>
                <p className='text-[10px] text-red-100'>Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <div className='flex items-center gap-1.5'>
              <button
                onClick={handleResetChat}
                title='Làm mới đoạn chat'
                className='hover:bg-red-700 p-1.5 rounded-full transition-colors'
              >
                <RefreshCw className='h-4 w-4' />
              </button>

              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
                className='hover:bg-red-700 p-1.5 rounded-full transition-colors'
              >
                {isExpanded ? <Minimize2 className='h-4 w-4' /> : <Maximize2 className='h-4 w-4' />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title='Đóng'
                className='hover:bg-red-700 p-1.5 rounded-full transition-colors'
              >
                <X className='h-5 w-5' />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3'>
            {messages.map((msg, index) => (
              <div key={msg.id} className='flex flex-col'>
                <div
                  className={`flex gap-2 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div
                    className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-red-100 text-red-600'}`}
                  >
                    {msg.role === 'user' ? (
                      <User className='h-4 w-4 text-slate-500' />
                    ) : (
                      <Bot className='h-4 w-4' />
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-red-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}
                  >
                    {renderMessageContent(msg.content, msg.role)}
                  </div>
                </div>

                {messages.length === 1 && index === 0 && !isLoading && (
                  <div className='flex flex-col gap-2 mt-3 ml-9 items-start'>
                    {STARTER_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className='text-[13px] bg-white text-slate-600 border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-left shadow-sm'
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className='flex gap-2 max-w-[85%] mr-auto items-center'>
                <div className='h-7 w-7 rounded-full bg-red-100 flex items-center justify-center text-red-600'>
                  <Bot className='h-4 w-4' />
                </div>
                <div className='bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1'>
                  <span className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce'></span>
                  <span
                    className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce'
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                  <span
                    className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce'
                    style={{ animationDelay: '0.4s' }}
                  ></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className='p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0'>
            <input
              type='text'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Nhập câu hỏi của bạn...'
              className='flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50'
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className='h-10 w-10 shrink-0 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 transition-colors'
            >
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4 ml-0.5' />
              )}
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className='h-14 w-14 bg-red-600 rounded-full shadow-xl flex items-center justify-center text-white hover:bg-red-700 hover:scale-105 transition-all animate-bounce-short'
        >
          <MessageSquare className='h-6 w-6' />
        </button>
      )}
    </div>
  )
}
