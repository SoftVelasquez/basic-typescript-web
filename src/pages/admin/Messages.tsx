import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Check,
  CheckCheck,
} from 'lucide-react';
import {
  collection,
  query,
  addDoc,
  doc,
  orderBy,
  where,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  createdAt: any;
  read: boolean;
  fromName?: string;
}

interface Conversation {
  userId: string;
  userEmail: string;
  userName?: string;
  lastMessage: Message;
  unreadCount: number;
}

export default function AdminMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      const convMap = new Map<string, Conversation>();

      allMessages.forEach((msg) => {
        const otherUserId = msg.from === 'admin' || msg.from === user.uid ? msg.to : msg.from;
        
        if (!convMap.has(otherUserId)) {
          convMap.set(otherUserId, {
            userId: otherUserId,
            userEmail: msg.fromName || otherUserId,
            lastMessage: msg,
            unreadCount: msg.to === user.uid && !msg.read ? 1 : 0,
          });
        } else {
          const conv = convMap.get(otherUserId)!;
          if (msg.to === user.uid && !msg.read) {
            conv.unreadCount++;
          }
        }
      });

      setConversations(Array.from(convMap.values()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedConversation || !user) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('from', 'in', [user.uid, selectedConversation]),
      where('to', 'in', [user.uid, selectedConversation]),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(msgs);

      msgs.forEach(async (msg) => {
        if (msg.to === user.uid && !msg.read) {
          await updateDoc(doc(db, 'messages', msg.id), { read: true });
        }
      });
    });

    return () => unsubscribe();
  }, [selectedConversation, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      setSending(true);
      await addDoc(collection(db, 'messages'), {
        from: user.uid,
        to: selectedConversation,
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
        read: false,
        fromName: user.email,
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold text-white">Mensajes</h1>
        <p className="text-gray-400 mt-1">
          Gestiona las conversaciones con los usuarios
        </p>
      </div>

      <div className="flex gap-4 h-full">
        <div className="w-80 bg-[#1a1a1a] rounded-lg border border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-white font-semibold">Conversaciones</h2>
          </div>
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No hay conversaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => setSelectedConversation(conv.userId)}
                    className={`w-full p-4 text-left hover:bg-[#0a0a0a] transition-colors ${
                      selectedConversation === conv.userId ? 'bg-[#0a0a0a]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {conv.userEmail}
                        </p>
                        <p className="text-gray-500 text-sm truncate">
                          {conv.lastMessage.content}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex-1 bg-[#1a1a1a] rounded-lg border border-gray-800 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {conversations.find((c) => c.userId === selectedConversation)
                        ?.userEmail || 'Usuario'}
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isFromMe = msg.from === user?.uid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isFromMe
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-800 text-white'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs opacity-70">
                              {formatTime(msg.createdAt)}
                            </span>
                            {isFromMe && (
                              <span className="text-xs opacity-70">
                                {msg.read ? (
                                  <CheckCheck className="w-3 h-3" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="bg-[#0a0a0a] border-gray-700 text-white"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Selecciona una conversación</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
