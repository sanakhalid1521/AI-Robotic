import React, { useState } from 'react';
import Layout from '@theme/Layout';
import styles from './RAGInterface.module.css';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const RAGInterface = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paperTopic, setPaperTopic] = useState('');
  const [paperLength, setPaperLength] = useState('3000');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the backend API
      const response = await fetch('http://localhost:8001/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          context: messages.map(m => m.content).join(' '),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'Sorry, I could not process your request.'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleGeneratePaper = async () => {
    if (!paperTopic.trim() || isLoading) return;

    setIsLoading(true);
    setMessages([]);

    try {
      // Call the paper generation API
      const response = await fetch('http://localhost:8001/api/rag/generate-paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: paperTopic,
          length: parseInt(paperLength),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add paper response
      const paperMessage: Message = {
        role: 'assistant',
        content: data.paper || 'Sorry, could not generate the paper.'
      };
      setMessages([paperMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error generating the paper.'
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="RAG Interface" description="Research Assistant with Retrieval Augmented Generation">
      <div className={styles.container}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img
              src="/img/RAG.jpg"
              alt="RAG Icon"
              style={{
                width: '50px',
                height: '50px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
            <div>
              <h1>Research Assistant with RAG</h1>
              <p>Ask questions about academic topics or generate research papers</p>
            </div>
          </div>
        </div>

        <div className={styles.paperGenerator}>
          <h2>Generate Research Paper</h2>
          <div className={styles.inputGroup}>
            <label htmlFor="topic">Paper Topic:</label>
            <input
              id="topic"
              type="text"
              value={paperTopic}
              onChange={(e) => setPaperTopic(e.target.value)}
              placeholder="Enter research topic..."
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="length">Paper Length (words):</label>
            <select
              id="length"
              value={paperLength}
              onChange={(e) => setPaperLength(e.target.value)}
              disabled={isLoading}
            >
              <option value="1500">1500 words</option>
              <option value="3000">3000 words</option>
              <option value="5000">5000 words</option>
            </select>
          </div>

          <button
            onClick={handleGeneratePaper}
            disabled={isLoading || !paperTopic.trim()}
            className={styles.generateButton}
          >
            {isLoading ? 'Generating...' : 'Generate Paper'}
          </button>
        </div>

        <div className={styles.chatContainer}>
          <h2>Ask Questions</h2>
          <form onSubmit={handleSubmit} className={styles.chatForm}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about academic topics..."
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={styles.submitButton}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>

          <div className={styles.messages}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${styles.message} ${styles[message.role]}`}
              >
                <div className={styles.messageContent}>
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className={styles.message + ' ' + styles.assistant}>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RAGInterface;