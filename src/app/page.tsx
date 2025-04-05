"use client";
import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css'

const Home = () => {
  const [topic, setTopic] = useState<string>('')
  const [aiResponses, setAiResponses] = useState<string[]>([])
  const [model, setModel] = useState<string>('llama3')
  const [waiting, setWaiting] = useState<boolean>(false)
  const [history, setHistory] = useState<{ question: string, response: string[] }[]>([])
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    autoResize();
  }, [topic]);

  useEffect(() => {
    if (aiResponses.length > 0 && topic) {
      setHistory(prev => [...prev, { question: topic, response: aiResponses }]);
      setTopic('');
    }
  }, [aiResponses]);

  const handleTopicChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(event.target.value);
  };

  const autoResize = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '26px'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  const handleAiResponses = async () => {
    setWaiting(true)
    const response = await fetch('/api/interview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, model }),
    });

    if (response.ok) {
      setWaiting(false)
      const data = await response.json();

      if (data.questions) {
        setAiResponses(data.questions);
      } else {
        console.error('No questions in response');
      }
    } else {
      console.error('Failed to fetch questions');
    }
  };

  const handleClearHistory = () => {
    setHistory([])
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Local Intelligence</h1>
      <div className={styles.model}>
        <label htmlFor="model" className={styles['model__label']}>Model:</label>
        <select
          name="model"
          id="model"
          className={styles['model__select']}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="llama3">Llama v3.3 8B</option>
          <option value="mistral">Mistral v(latest)</option>
          <option value="openchat">Openchat</option>
          <option value="deepseek-coder:6.7b">Deepseek-coder:6.7b</option>
        </select>
      </div>
      <p className={`${waiting ? styles['ai-responses-loading'] : styles['ai-responses-listening']} ${styles['ai-responses']}`}>
        <span>{waiting ? 'Loading...' : 'Listening'}</span>
      </p>
      <div className={styles['container-chat']}>
        {history.length > 0 ? (
          <>
            {history.map((elem, index) => (
              <div className={styles.history} key={index}>
                <div className={styles['history__block-question']}>
                  <div className={styles['history__question']}>
                    <span>Я:</span>
                    <br /><p className={styles['history__text']}>{elem.question}</p>
                  </div>
                </div>
                <div className={styles['history__responses']}>
                  <span >AI:</span>
                  <ul className={styles['history__list']}>
                    {elem.response.map((res, idx) => (
                      <li key={idx} className={styles['ai-responses__items']}>{res}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </>
        ) : (
          null
        )}
      </div>
      <div className={styles.question}>
        <button
          onClick={handleClearHistory}
          className={styles['question__button']}
        > Clear</button>
        <textarea
          name="question"
          value={topic}
          onChange={handleTopicChange}
          className={styles['question__textarea']}
          placeholder="Enter your question..."
          ref={textAreaRef}
        />
        <button
          onClick={handleAiResponses}
          disabled={topic == '' || waiting}
          className={styles['question__button']}
        > Go</button>
      </div>
    </div>
  );
};

export default Home;