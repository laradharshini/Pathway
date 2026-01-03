import { createContext, useContext, useState } from 'react';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [initialMessage, setInitialMessage] = useState('');

    const openChat = (message = '') => {
        if (message) setInitialMessage(message);
        setIsOpen(true);
    };

    const closeChat = () => {
        setIsOpen(false);
        // Don't clear message immediately to avoid flicker, let it clear on next open if needed
    };

    return (
        <ChatContext.Provider value={{ isOpen, initialMessage, openChat, closeChat, setInitialMessage }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
