import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import './App.css'
import {
  CATEGORY_LABELS,
  CULTURAL_NOTES,
  CONVERSATION_PATTERNS,
  DAILY_FOCUS,
  MINI_LESSONS,
  RESOURCE_LINKS,
  SCENARIOS,
  STUDY_ROUTINE,
  VOCABULARY,
  type Category,
  type VocabularyItem,
} from './data/lessons'
import ScheduledMessageComponent from './components/ScheduledMessage'

type QuizQuestion = {
  word: VocabularyItem
  options: string[]
}

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const createQuizQuestion = (): QuizQuestion => {
  const word = VOCABULARY[Math.floor(Math.random() * VOCABULARY.length)]
  const distractors = shuffle(
    VOCABULARY.filter((item) => item.id !== word.id).map((item) => item.meaning),
  ).slice(0, 3)

  return {
    word,
    options: shuffle([...distractors, word.meaning]),
  }
}

const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

const createEmptyCategoryMap = () => {
  return Object.keys(CATEGORY_LABELS).reduce((acc, key) => {
    acc[key as Category] = []
    return acc
  }, {} as Record<Category, VocabularyItem[]>)
}

function App() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion>(createQuizQuestion)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null)
  const [knownWordIds, setKnownWordIds] = useState<number[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = window.localStorage.getItem('mandarin-known-words')
      return stored ? (JSON.parse(stored) as number[]) : []
    } catch (error) {
      console.warn('Failed to parse stored known words', error)
      return []
    }
  })
  const [notes, setNotes] = useState<string>(() => {
    if (typeof window === 'undefined') return ''
    return window.localStorage.getItem('mandarin-learning-notes') ?? ''
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('mandarin-known-words', JSON.stringify(knownWordIds))
  }, [knownWordIds])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('mandarin-learning-notes', notes)
  }, [notes])

  const progress = useMemo(() => {
    if (VOCABULARY.length === 0) return 0
    return Math.round((knownWordIds.length / VOCABULARY.length) * 100)
  }, [knownWordIds])

  const vocabularyByCategory = useMemo(() => {
    return VOCABULARY.reduce<Record<Category, VocabularyItem[]>>((acc, item) => {
      acc[item.category].push(item)
      return acc
    }, createEmptyCategoryMap())
  }, [])

  const currentCard = VOCABULARY[currentCardIndex]
  const isCurrentWordKnown = knownWordIds.includes(currentCard.id)

  const speak = (text: string, lang: string = 'zh-CN') => {
    if (!speechSupported) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % VOCABULARY.length)
  }

  const handlePrevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + VOCABULARY.length) % VOCABULARY.length)
  }

  const toggleKnownWord = (wordId: number) => {
    setKnownWordIds((prev) =>
      prev.includes(wordId) ? prev.filter((id) => id !== wordId) : [...prev, wordId],
    )
  }

  const handleQuizOptionSelect = (option: string) => {
    if (selectedOption) return
    setSelectedOption(option)
    setQuizResult(option === quizQuestion.word.meaning ? 'correct' : 'incorrect')
  }

  const handleNextQuizQuestion = () => {
    setQuizQuestion(createQuizQuestion())
    setSelectedOption(null)
    setQuizResult(null)
  }

  return (
    <div className="app">
      <header className="hero">
        <p className="hero__tag">10-minute daily Mandarin</p>
        <h1>Nihao Chinese Lab</h1>
        <p className="hero__subtitle">
          Practice core vocabulary, real-life conversation patterns, and culture notes in one focused
          study space.
        </p>

        <div className="hero__stats">
          <div>
            <span>{VOCABULARY.length}</span>
            <p>Core words</p>
          </div>
          <div>
            <span>{progress}%</span>
            <p>Completion</p>
          </div>
          <div>
            <span>{STUDY_ROUTINE.length}</span>
            <p>Study routines</p>
          </div>
        </div>
      </header>

      <main className="content">
        <ScheduledMessageComponent />

        <section className="card daily-focus">
          <div className="section-header">
            <h2>Daily focus</h2>
            <span className="badge">{DAILY_FOCUS.theme}</span>
          </div>
          <div className="daily-focus__phrase">
            <div>
              <p className="phrase">{DAILY_FOCUS.phrase}</p>
              <p className="pinyin">{DAILY_FOCUS.pinyin}</p>
              <p className="meaning">{DAILY_FOCUS.meaning}</p>
            </div>
            <button
              className="ghost-button"
              type="button"
              onClick={() => speak(DAILY_FOCUS.phrase)}
              disabled={!speechSupported}
            >
              Play pronunciation
            </button>
          </div>
          <p className="description">{DAILY_FOCUS.description}</p>

          <div className="daily-focus__details">
            <div>
              <h3>Breakdown</h3>
              <ul>
                {DAILY_FOCUS.breakdown.map((item) => (
                  <li key={item.part}>
                    <span className="pill pill--hanzi">{item.part}</span>
                    <span>{item.translation}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Practice ideas</h3>
              <ul className="bullet-list">
                {DAILY_FOCUS.practice.map((mission) => (
                  <li key={mission}>{mission}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="card flashcard">
          <div className="section-header">
            <h2>Flashcards</h2>
            <span className="badge badge--muted">
              {currentCardIndex + 1} / {VOCABULARY.length}
            </span>
          </div>

          <div className="flashcard__body">
            <div className="flashcard__meta">
              <span className={`pill pill--category pill--${currentCard.category}`}>
                {CATEGORY_LABELS[currentCard.category]}
              </span>
              <button
                className={`ghost-button ghost-button--small ${isCurrentWordKnown ? 'is-active' : ''}`}
                type="button"
                onClick={() => toggleKnownWord(currentCard.id)}
              >
                {isCurrentWordKnown ? 'Mark for review' : 'Mark as learned'}
              </button>
            </div>

            <div className="flashcard__content">
              <h3>{currentCard.hanzi}</h3>
              <p className="pinyin">{currentCard.pinyin}</p>
              <p className="meaning">{currentCard.meaning}</p>
              <div className="flashcard__actions">
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => speak(currentCard.hanzi)}
                  disabled={!speechSupported}
                >
                  Play pronunciation
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => speak(currentCard.meaning, 'en-US')}
                >
                  Play meaning
                </button>
              </div>
            </div>

            <div className="flashcard__examples">
              <h4>Example sentences</h4>
              <ul>
                {currentCard.examples.map((example) => (
                  <li key={example.hanzi}>
                    <p className="hanzi">{example.hanzi}</p>
                    <p className="pinyin">{example.pinyin}</p>
                    <p className="translation">{example.translation}</p>
                  </li>
                ))}
              </ul>
              {currentCard.tip && <p className="tip">?? {currentCard.tip}</p>}
            </div>

            <div className="flashcard__nav">
              <button className="ghost-button" type="button" onClick={handlePrevCard}>
                Previous
              </button>
              <button className="primary-button" type="button" onClick={handleNextCard}>
                Next
              </button>
            </div>
          </div>
        </section>

        <section className="card quiz">
          <div className="section-header">
            <h2>Multiple-choice quiz</h2>
            <p className="section-subtitle">Match the correct meaning</p>
          </div>

          <div className="quiz__question">
            <p className="quiz__prompt">{quizQuestion.word.hanzi}</p>
            <p className="pinyin">{quizQuestion.word.pinyin}</p>
          </div>

          <div className="quiz__options">
            {quizQuestion.options.map((option) => {
              const isSelected = selectedOption === option
              const isCorrect = quizQuestion.word.meaning === option
              return (
                <button
                  key={option}
                  type="button"
                  className={`quiz__option ${
                    selectedOption
                      ? isCorrect
                        ? 'quiz__option--correct'
                        : isSelected
                          ? 'quiz__option--incorrect'
                          : ''
                      : ''
                  } ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleQuizOptionSelect(option)}
                  disabled={Boolean(selectedOption)}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {quizResult && (
            <div className={`quiz__result quiz__result--${quizResult}`}>
              {quizResult === 'correct'
                ? 'Great job! Keep stacking accurate recall.'
                : 'Not quite. Review the flashcard and try the next one.'}
              <div className="quiz__answer-detail">
                <p>
                  Correct answer: <strong>{quizQuestion.word.meaning}</strong>
                </p>
                {quizQuestion.word.examples[0] && (
                  <p>
                    Example: {quizQuestion.word.examples[0].hanzi} ({
                      quizQuestion.word.examples[0].translation
                    })
                  </p>
                )}
              </div>
            </div>
          )}

          <button className="primary-button quiz__next" type="button" onClick={handleNextQuizQuestion}>
            Next question
          </button>
        </section>

        <section className="card lessons">
          <div className="section-header">
            <h2>Mini lessons</h2>
            <p className="section-subtitle">Key pronunciation and grammar takeaways</p>
          </div>
          <div className="grid grid--two">
            {MINI_LESSONS.map((lesson) => (
              <article key={lesson.title} className="info-card">
                <h3>{lesson.title}</h3>
                <p className="info-card__concept">{lesson.concept}</p>
                <p className="info-card__takeaway">{lesson.takeaway}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card patterns">
          <div className="section-header">
            <h2>Conversation patterns</h2>
            <p className="section-subtitle">Plug-and-play structures for daily talk</p>
          </div>
          <div className="patterns__list">
            {CONVERSATION_PATTERNS.map((pattern) => (
              <article key={pattern.title} className="pattern-card">
                <h3>{pattern.title}</h3>
                <p className="pattern-card__pattern">{pattern.pattern}</p>
                <p className="pattern-card__example">Example: {pattern.example}</p>
                <p className="pattern-card__tip">Tip. {pattern.tip}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card scenarios">
          <div className="section-header">
            <h2>Situational dialogues</h2>
            <p className="section-subtitle">Short scripts for real-life moments</p>
          </div>
          <div className="grid grid--two">
            {SCENARIOS.map((scenario) => (
              <article key={scenario.title} className="scenario-card">
                <h3>{scenario.title}</h3>
                <ul>
                  {scenario.dialogue.map((line, index) => (
                    <li key={`${line.speaker}-${index}`}>
                      <p className="hanzi">
                        {line.speaker}: {line.hanzi}
                      </p>
                      <p className="pinyin">{line.pinyin}</p>
                      <p className="translation">{line.translation}</p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="card progress">
          <div className="section-header">
            <h2>Progress & categories</h2>
          </div>
          <div className="progress__summary">
            <div
              className="progress__ring"
              style={{
                '--progress-angle': `${Math.min(progress, 100) * 3.6}deg`,
              } as CSSProperties}
            >
              <span>{progress}%</span>
              <p>Learned words</p>
            </div>
            <p>
              Words marked as learned are saved locally. Toggle them anytime to keep your review list
              honest.
            </p>
          </div>
          <div className="grid grid--two">
            {Object.entries(vocabularyByCategory).map(([category, words]) => (
              <article key={category} className="category-card">
                <h3>{CATEGORY_LABELS[category as Category]}</h3>
                <ul>
                  {words.map((word) => (
                    <li key={word.id}>
                      <span>{word.hanzi}</span>
                      <span className="pinyin">{word.pinyin}</span>
                      <span className="translation">{word.meaning}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="card study-support">
          <div className="section-header">
            <h2>Study routine & notes</h2>
          </div>
          <div className="grid grid--two">
            <div>
              {STUDY_ROUTINE.map((routine) => (
                <article key={routine.title} className="routine-card">
                  <div className="routine-card__header">
                    <h3>{routine.title}</h3>
                    <span className="badge badge--muted">{routine.duration}</span>
                  </div>
                  <ul className="bullet-list">
                    {routine.tasks.map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div>
              <label className="notes__label" htmlFor="notes">
                Learning notes
              </label>
              <textarea
                id="notes"
                className="notes__textarea"
                placeholder="Capture pronunciation tips, new phrases, or study reminders."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card culture">
          <div className="section-header">
            <h2>Culture notes</h2>
            <p className="section-subtitle">Understand the etiquette behind the language</p>
          </div>
          <div className="grid grid--two">
            {CULTURAL_NOTES.map((note) => (
              <article key={note.title} className="info-card">
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <p className="info-card__takeaway">? {note.takeaway}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card resources">
          <div className="section-header">
            <h2>Recommended resources</h2>
            <p className="section-subtitle">Extend listening, tone work, and input</p>
          </div>
          <ul className="resources__list">
            {RESOURCE_LINKS.map((resource) => (
              <li key={resource.name}>
                <h3>{resource.name}</h3>
                <p>{resource.description}</p>
                <a href={resource.url} target="_blank" rel="noreferrer">
                  Open site ?
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {!speechSupported && (
        <p className="speech-warning">
          Speech synthesis is not available in this browser, so the pronunciation buttons are
          disabled.
        </p>
      )}
    </div>
  )
}

export default App
