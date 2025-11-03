export type Category = 'greeting' | 'daily' | 'study' | 'time' | 'emotion'

export const CATEGORY_LABELS: Record<Category, string> = {
  greeting: 'Greetings',
  daily: 'Daily Life',
  study: 'Study',
  time: 'Time',
  emotion: 'Emotion',
}

export type ExampleSentence = {
  hanzi: string
  pinyin: string
  translation: string
}

export type VocabularyItem = {
  id: number
  hanzi: string
  pinyin: string
  meaning: string
  category: Category
  examples: ExampleSentence[]
  tip?: string
}

export const VOCABULARY: VocabularyItem[] = [
  {
    id: 1,
    hanzi: '\u4f60\u597d',
    pinyin: 'ni3 hao3',
    meaning: 'hello',
    category: 'greeting',
    examples: [
      {
        hanzi: '\u4f60\u597d\uff0c\u6211\u53eb\u674e\u660e\u3002',
        pinyin: 'Ni3 hao3, wo3 jiao4 Li3 Ming2.',
        translation: 'Hello, my name is Li Ming.',
      },
    ],
    tip: 'Use this to greet someone for the first time or to start a conversation.',
  },
  {
    id: 2,
    hanzi: '\u8c22\u8c22',
    pinyin: 'xie4 xie',
    meaning: 'thank you',
    category: 'greeting',
    examples: [
      {
        hanzi: '\u8c22\u8c22\u4f60\u7684\u5e2e\u52a9\u3002',
        pinyin: 'Xie4xie ni3 de bang1zhu4.',
        translation: 'Thank you for your help.',
      },
    ],
    tip: 'Common reply: "\u4e0d\u5ba2\u6c14" (You are welcome).',
  },
  {
    id: 3,
    hanzi: '\u8bf7',
    pinyin: 'qing3',
    meaning: 'please; to invite',
    category: 'greeting',
    examples: [
      {
        hanzi: '\u8bf7\u8fdb\uff01',
        pinyin: 'Qing3 jin4!',
        translation: 'Please come in!',
      },
      {
        hanzi: '\u8bf7\u7ed9\u6211\u83dc\u5355\u3002',
        pinyin: 'Qing3 gei3 wo3 cai4dan1.',
        translation: 'Please give me the menu.',
      },
    ],
    tip: 'Place "\u8bf7" before the verb to sound polite (e.g. "\u8bf7\u5750" = please sit).',
  },
  {
    id: 4,
    hanzi: '\u5b66\u4e60',
    pinyin: 'xue2 xi2',
    meaning: 'to study',
    category: 'study',
    examples: [
      {
        hanzi: '\u6211\u559c\u6b22\u5b66\u4e60\u4e2d\u6587\u3002',
        pinyin: 'Wo3 xi3huan1 xue2xi2 Zhong1wen2.',
        translation: 'I like studying Chinese.',
      },
    ],
    tip: 'Combine with a subject to specify what you study, e.g. "\u5b66\u4e60\u4e2d\u6587" (study Chinese).',
  },
  {
    id: 5,
    hanzi: '\u4e00\u8d77',
    pinyin: 'yi4 qi3',
    meaning: 'together',
    category: 'daily',
    examples: [
      {
        hanzi: '\u6211\u4eec\u4e00\u8d77\u5403\u996d\u5427\u3002',
        pinyin: 'Wo3men yi4qi3 chi1fan4 ba.',
        translation: "Let's eat together.",
      },
    ],
    tip: 'Usually placed between the subject and verb: "\u6211\u4eec\u4e00\u8d77 + verb".',
  },
  {
    id: 6,
    hanzi: '\u73b0\u5728',
    pinyin: 'xian4 zai4',
    meaning: 'now',
    category: 'time',
    examples: [
      {
        hanzi: '\u73b0\u5728\u51e0\u70b9\uff1f',
        pinyin: 'Xian4zai4 ji3 dian3?',
        translation: 'What time is it now?',
      },
    ],
    tip: 'Useful for talking about the present moment or asking for the current time.',
  },
  {
    id: 7,
    hanzi: '\u559c\u6b22',
    pinyin: 'xi3 huan1',
    meaning: 'to like',
    category: 'emotion',
    examples: [
      {
        hanzi: '\u4f60\u559c\u6b22\u4ec0\u4e48\u97f3\u4e50\uff1f',
        pinyin: 'Ni3 xi3huan1 shen2me yin1yue4?',
        translation: 'What kind of music do you like?',
      },
    ],
    tip: 'Follow with a noun: "\u559c\u6b22 + noun" = to like something.',
  },
  {
    id: 8,
    hanzi: '\u518d\u89c1',
    pinyin: 'zai4 jian4',
    meaning: 'goodbye',
    category: 'greeting',
    examples: [
      {
        hanzi: '\u6211\u4eec\u660e\u5929\u89c1\uff0c\u518d\u89c1\uff01',
        pinyin: 'Wo3men ming2tian1 jian4, zai4jian4!',
        translation: 'See you tomorrow, bye!',
      },
    ],
    tip: 'Often placed at the end of a conversation when parting.',
  },
]

export const DAILY_FOCUS = {
  theme: 'Morning greetings',
  phrase: '\u65e9\u4e0a\u597d',
  pinyin: 'zao3 shang4 hao3',
  meaning: 'Good morning!',
  description:
    'Start the day with a warm greeting. Practice saying it smoothly and add a follow-up question to keep the conversation going.',
  breakdown: [
    { part: '\u65e9\u4e0a', translation: 'morning' },
    { part: '\u597d', translation: 'good' },
  ],
  practice: [
    'Send a morning greeting to a friend or study partner.',
    'Record yourself and compare the tone pattern to a native speaker.',
    'Add a question like "How is your day going?" to extend the dialogue.',
  ],
}

export const CONVERSATION_PATTERNS = [
  {
    title: 'Basic greeting flow',
    pattern: 'A: \u4f60\u597d! B: \u4f60\u597d! \u4f60\u597d\u5417?',
    example: 'A: \u4f60\u597d! \u6700\u8fd1\u600e\u4e48\u6837? B: \u6211\u5f88\u597d, \u8c22\u8c22.',
    tip: 'Add "How have you been recently?" to make the conversation sound natural.',
  },
  {
    title: 'Saying thanks',
    pattern: 'A: \u8c22\u8c22. B: \u4e0d\u5ba2\u6c14.',
    example: 'A: \u8c22\u8c22\u4f60\u4eca\u5929\u5e2e\u6211. B: \u4e0d\u5ba2\u6c14, \u6211\u4eec\u662f\u670b\u53cb.',
    tip: 'Use "\u4e0d\u5ba2\u6c14" as a friendly response to show it is no trouble.',
  },
  {
    title: 'Suggesting together',
    pattern: '\u6211\u4eec\u4e00\u8d77 + verb + \u5427?',
    example: '\u6211\u4eec\u4e00\u8d77\u5b66\u4e60\u5427?',
    tip: 'Ending with "\u5427" softens the suggestion and invites agreement.',
  },
]

export const MINI_LESSONS = [
  {
    title: 'Tone awareness',
    concept: 'Mandarin has four tones plus a neutral tone. Changing the tone changes the meaning.',
    takeaway: 'Always study the tone with the syllable. Example: "ma1" (mother) vs. "ma3" (horse).',
  },
  {
    title: 'Using "\u8bf7" politely',
    concept: 'Add "\u8bf7" before a verb to make polite requests.',
    takeaway: 'Try: "\u8bf7\u5750" (please sit) or "\u8bf7\u8bf4\u6162\u4e00\u70b9" (speak more slowly).',
  },
  {
    title: 'Placing "\u4e00\u8d77"',
    concept: 'Position "\u4e00\u8d77" between the subject and verb.',
    takeaway: 'Example: "\u6211\u4eec\u4e00\u8d77\u53bb\u770b\u7535\u5f71" = let?s go watch a movie together.',
  },
]

export const CULTURAL_NOTES = [
  {
    title: 'Greeting etiquette',
    content:
      'A slight nod with "\u4f60\u597d" is common when meeting someone. Once you know each other, nicknames can show friendliness.',
    takeaway: 'In formal settings, combine the family name with "Mr./Ms." (\u5148\u751f/\u5973\u58eb).',
  },
  {
    title: 'Giving gifts',
    content:
      'Offer and receive gifts with both hands. Many people wait to open a gift later to be polite.',
    takeaway: 'Keep your voice moderate in public spaces; calm communication is appreciated.',
  },
]

export const STUDY_ROUTINE = [
  {
    title: '15-minute pronunciation drill',
    duration: '15 min',
    tasks: [
      'Repeat each tone aloud three times',
      'Record five sentences and compare with native audio',
      'Note difficult sounds to revisit later',
    ],
  },
  {
    title: 'Vocabulary review loop',
    duration: '10 min',
    tasks: [
      'Read today?s words aloud',
      'Spot the words inside example sentences',
      'Set a goal for the next study session',
    ],
  },
  {
    title: 'Quick conversation practice',
    duration: '10 min',
    tasks: [
      'Read the dialogue patterns aloud',
      'Role-play two to three exchanges with a partner',
      'Create a new sentence using a fresh word',
    ],
  },
]

export const RESOURCE_LINKS = [
  {
    name: 'MOE Mandarin Dictionary',
    description: 'Official Taiwanese dictionary with pronunciation and examples.',
    url: 'https://dict.revised.moe.edu.tw/',
  },
  {
    name: 'Pinyin Practice',
    description: 'Interactive exercises focused on tone and pinyin accuracy.',
    url: 'https://www.pinyinpractice.com/',
  },
  {
    name: 'Language Learning with Netflix',
    description: 'Enhance listening with synced subtitles and vocabulary tools.',
    url: 'https://languagelearningwithnetflix.com/',
  },
]

export const SCENARIOS = [
  {
    title: 'Ordering at a cafe',
    dialogue: [
      {
        speaker: 'A',
        hanzi: '\u4f60\u597d\uff01\u8bf7\u7ed9\u6211\u4e00\u676f\u5496\u5561\u3002',
        pinyin: 'Ni3 hao3! Qing3 gei3 wo3 yi4 bei1 ka1fei1.',
        translation: 'Hello! Please give me a cup of coffee.',
      },
      {
        speaker: 'B',
        hanzi: '\u597d\u7684\uff0c\u8bf7\u7a0d\u7b49\u3002',
        pinyin: 'Hao3 de, qing3 shao1 deng3.',
        translation: 'Sure, please wait a moment.',
      },
    ],
  },
  {
    title: 'Making weekend plans',
    dialogue: [
      {
        speaker: 'A',
        hanzi: '\u6211\u4eec\u4e00\u8d77\u53bb\u770b\u7535\u5f71\u5427\uff1f',
        pinyin: 'Wo3men yi4qi3 qu4 kan4 dian4ying3 ba?',
        translation: 'Shall we go watch a movie together?',
      },
      {
        speaker: 'B',
        hanzi: '\u597d\u5440\uff0c\u4ec0\u4e48\u65f6\u5019\uff1f',
        pinyin: 'Hao3 ya, shen2me shi2hou4?',
        translation: 'Sounds good, when?',
      },
      {
        speaker: 'A',
        hanzi: '\u660e\u5929\u4e0b\u5348\u4e24\u70b9\u600e\u4e48\u6837\uff1f',
        pinyin: 'Ming2tian1 xia4wu3 liang3 dian3 zen3meyang4?',
        translation: 'How about tomorrow at 2 p.m.?',
      },
    ],
  },
]
