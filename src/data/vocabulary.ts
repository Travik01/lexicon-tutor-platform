export type WordCategory = "Health" | "School / study" | "Actions" | "Useful phrases" | "People / reactions" | "Rules" | "Places";

export type VocabEntry = {
  id: string;
  word: string;
  translation: string;
  definition: string;
  example: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "phrase" | "phrasal verb" | "collocation" | "word formation";
  category: WordCategory;
  level: "A2" | "B1" | "B2";
  formationBase?: string; // For word formation (e.g., "success" for "successful")
};

export type LessonVocabSet = {
  id: string;
  title: string;
  lessonDate: string;
  level: "A2" | "B1" | "B2";
  pdfName?: string;
  words: VocabEntry[];
};

export const CATEGORIES: WordCategory[] = [
  "Health",
  "School / study",
  "Actions",
  "Useful phrases",
  "People / reactions",
  "Rules",
  "Places",
];

// Демо-набор с урока по теме «повседневные действия и школа»
export const DEMO_VOCAB_SETS: LessonVocabSet[] = [
  {
    id: "set-daily-life",
    title: "Daily life & School",
    lessonDate: new Date().toISOString().slice(0, 10),
    level: "A2",
    pdfName: "Daily_Life_Lesson_Notes.pdf",
    words: [
      { id: "v1", word: "enjoyable", translation: "приятный", definition: "giving pleasure or satisfaction", example: "The lesson was really enjoyable.", partOfSpeech: "adjective", category: "People / reactions", level: "A2" },
      { id: "v-wf1", word: "successful", formationBase: "success", translation: "успешный", definition: "achieving the results that were wanted or hoped for", example: "She is a successful business woman.", partOfSpeech: "word formation", category: "School / study", level: "A2" },
      { id: "v-coll1", word: "make a decision", translation: "принять решение", definition: "to choose something after thinking about several possibilities", example: "I haven't made a decision yet.", partOfSpeech: "collocation", category: "Actions", level: "A2" },
      { id: "v2", word: "to attend", translation: "посещать", definition: "to be present at an event or place", example: "She attends every class.", partOfSpeech: "verb", category: "School / study", level: "A2" },
      { id: "v3", word: "assignment", translation: "задание", definition: "a piece of work given to someone as part of their studies", example: "The assignment is due on Friday.", partOfSpeech: "noun", category: "School / study", level: "A2" },
      { id: "v4", word: "to improve", translation: "улучшать", definition: "to make or become better", example: "Practice helps to improve your skills.", partOfSpeech: "verb", category: "Actions", level: "A2" },
      { id: "v5", word: "confident", translation: "уверенный", definition: "feeling sure about your own abilities", example: "He felt confident before the test.", partOfSpeech: "adjective", category: "People / reactions", level: "A2" },
      { id: "v6", word: "to rush", translation: "спешить", definition: "to move or act with great speed", example: "Don't rush — take your time.", partOfSpeech: "verb", category: "Actions", level: "A2" },
      { id: "v7", word: "canteen", translation: "столовая", definition: "a place in a school or workplace where meals are served", example: "We had lunch in the canteen.", partOfSpeech: "noun", category: "Places", level: "A2" },
      { id: "v8", word: "to revise", translation: "повторять (для экзамена)", definition: "to study something again, especially for an exam", example: "I need to revise for the test.", partOfSpeech: "verb", category: "School / study", level: "A2" },
      { id: "v9", word: "exhausted", translation: "истощённый, очень уставший", definition: "extremely tired", example: "After the exam I was completely exhausted.", partOfSpeech: "adjective", category: "Health", level: "A2" },
      { id: "v10", word: "by the way", translation: "кстати", definition: "used to introduce a new topic or something you just thought of", example: "By the way, have you seen the new schedule?", partOfSpeech: "phrase", category: "Useful phrases", level: "A2" },
      { id: "v11", word: "deadline", translation: "крайний срок", definition: "the latest time by which something must be done", example: "The deadline for the essay is Monday.", partOfSpeech: "noun", category: "Rules", level: "A2" },
      { id: "v12", word: "to participate", translation: "участвовать", definition: "to take part in an activity or event", example: "Everyone should participate in the discussion.", partOfSpeech: "verb", category: "Actions", level: "A2" },
      { id: "v-wf2", word: "improvement", formationBase: "improve", translation: "улучшение", definition: "the process of making something better", example: "There has been a great improvement.", partOfSpeech: "word formation", category: "School / study", level: "A2" },
      { id: "v-coll2", word: "pay attention", translation: "обращать внимание", definition: "to watch, listen to, or think about something carefully", example: "Please pay attention to the teacher.", partOfSpeech: "collocation", category: "School / study", level: "A2" },
      { id: "v-coll3", word: "take a break", translation: "сделать перерыв", definition: "to stop what you are doing for a short time", example: "Let's take a break after this exercise.", partOfSpeech: "collocation", category: "Actions", level: "A2" },
      { id: "v-pv1", word: "look up", translation: "искать (в словаре)", definition: "to search for information in a book or on the internet", example: "Look up this word in the dictionary.", partOfSpeech: "phrasal verb", category: "School / study", level: "A2" },
      { id: "v-pv2", word: "hand in", translation: "сдавать (работу)", definition: "to give something to a person in authority", example: "Hand in your essays by Friday.", partOfSpeech: "phrasal verb", category: "School / study", level: "A2" },
    ],
  },
  {
    id: "set-travel",
    title: "Travel & Transport",
    lessonDate: new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10),
    level: "A2",
    pdfName: "Travel_Transport_Notes.pdf",
    words: [
      { id: "vt1", word: "departure", translation: "отправление", definition: "the act of leaving a place", example: "The departure time is 8:30.", partOfSpeech: "noun", category: "Places", level: "A2" },
      { id: "vt2", word: "destination", translation: "пункт назначения", definition: "the place someone is going to", example: "London is our final destination.", partOfSpeech: "noun", category: "Places", level: "A2" },
      { id: "vt3", word: "luggage", translation: "багаж", definition: "bags and suitcases that you take when travelling", example: "Don't forget your luggage.", partOfSpeech: "noun", category: "Actions", level: "A2" },
      { id: "vt4", word: "to board", translation: "садиться (в транспорт)", definition: "to get on a plane, train, or ship", example: "We boarded the train at platform 5.", partOfSpeech: "verb", category: "Actions", level: "A2" },
      { id: "vt5", word: "delay", translation: "задержка", definition: "a period of time when something happens later than planned", example: "There was a two-hour delay.", partOfSpeech: "noun", category: "Rules", level: "A2" },
      { id: "vt6", word: "single ticket", translation: "билет в одну сторону", definition: "a ticket for travelling in one direction only", example: "I bought a single ticket to Oxford.", partOfSpeech: "collocation", category: "Rules", level: "A2" },
      { id: "vt7", word: "return ticket", translation: "билет туда и обратно", definition: "a ticket for travelling to a place and back again", example: "A return ticket is cheaper.", partOfSpeech: "collocation", category: "Rules", level: "A2" },
      { id: "vt8", word: "check in", translation: "зарегистрироваться", definition: "to report your arrival at a hotel or airport", example: "We need to check in two hours early.", partOfSpeech: "phrasal verb", category: "Actions", level: "A2" },
      { id: "vt9", word: "set off", translation: "отправиться в путь", definition: "to start a journey", example: "We set off early in the morning.", partOfSpeech: "phrasal verb", category: "Actions", level: "A2" },
      { id: "vt10", word: "comfortable", translation: "удобный, комфортный", definition: "providing physical ease and relaxation", example: "The seats were very comfortable.", partOfSpeech: "adjective", category: "People / reactions", level: "A2" },
      { id: "vt-wf1", word: "arrival", formationBase: "arrive", translation: "прибытие", definition: "the act of reaching a place", example: "On arrival, please go to reception.", partOfSpeech: "word formation", category: "Places", level: "A2" },
      { id: "vt-wf2", word: "traveller", formationBase: "travel", translation: "путешественник", definition: "a person who is travelling", example: "She is an experienced traveller.", partOfSpeech: "word formation", category: "People / reactions", level: "A2" },
    ],
  },
  {
    id: "set-environment",
    title: "Environment & Future",
    lessonDate: new Date().toISOString().slice(0, 10),
    level: "B2",
    pdfName: "Environment_Notes.pdf",
    words: [
      { id: "ve1", word: "sustainable", translation: "устойчивый", definition: "able to be maintained at a certain rate or level", example: "We need sustainable development.", partOfSpeech: "adjective", category: "Rules", level: "B2" },
      { id: "ve2", word: "to preserve", translation: "сохранять", definition: "to maintain something in its original or existing state", example: "We must preserve our forests.", partOfSpeech: "verb", category: "Actions", level: "B2" },
      { id: "ve3", word: "renewable", translation: "возобновляемый", definition: "not depleted when used", example: "Solar power is a renewable energy source.", partOfSpeech: "adjective", category: "Useful phrases", level: "B2" },
      { id: "ve-wf1", word: "pollution", formationBase: "pollute", translation: "загрязнение", definition: "the presence in or introduction into the environment of a substance which has harmful effects", example: "Air pollution is increasing.", partOfSpeech: "word formation", category: "Health", level: "B2" },
      { id: "ve-pv1", word: "cut down on", translation: "сократить потребление", definition: "to reduce the amount or consumption of something", example: "We should cut down on plastic waste.", partOfSpeech: "phrasal verb", category: "Actions", level: "B2" },
    ],
  },
  {
    id: "set-opinions",
    title: "Opinions & Arguments",
    lessonDate: new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10),
    level: "B1",
    pdfName: "Opinions_Arguments_Notes.pdf",
    words: [
      { id: "v20", word: "to persuade", translation: "уговаривать", definition: "to make someone agree to do something by reasoning or arguing", example: "She persuaded him to stay.", partOfSpeech: "verb", category: "Actions", level: "B1" },
      { id: "v21", word: "point of view", translation: "точка зрения", definition: "a particular way of looking at something", example: "From my point of view, it's a good idea.", partOfSpeech: "phrase", category: "Useful phrases", level: "B1" },
      { id: "v22", word: "to disagree", translation: "не соглашаться", definition: "to have a different opinion from someone", example: "I disagree with that statement.", partOfSpeech: "verb", category: "Actions", level: "B1" },
      { id: "v23", word: "fair", translation: "справедливый", definition: "treating everyone equally and according to the rules", example: "The teacher's decision was fair.", partOfSpeech: "adjective", category: "Rules", level: "B1" },
      { id: "v24", word: "evidence", translation: "доказательства", definition: "facts or information showing whether something is true", example: "There is no evidence to support this claim.", partOfSpeech: "noun", category: "School / study", level: "B1" },
      { id: "v25", word: "to claim", translation: "утверждать", definition: "to say that something is true, even without proof", example: "He claims to be an expert.", partOfSpeech: "verb", category: "Actions", level: "B1" },
      { id: "v26", word: "moreover", translation: "более того", definition: "used to add more important information", example: "The plan is effective. Moreover, it saves money.", partOfSpeech: "adverb", category: "Useful phrases", level: "B1" },
      { id: "v27", word: "opponent", translation: "противник, оппонент", definition: "a person who disagrees with or fights against another", example: "Her opponent had a strong argument.", partOfSpeech: "noun", category: "People / reactions", level: "B1" },
      { id: "v28", word: "to support", translation: "поддерживать", definition: "to give help, encouragement, or approval", example: "Most students supported the idea.", partOfSpeech: "verb", category: "Actions", level: "B1" },
      { id: "v29", word: "in my opinion", translation: "по моему мнению", definition: "used to introduce your personal view", example: "In my opinion, reading is the best way to learn.", partOfSpeech: "phrase", category: "Useful phrases", level: "B1" },
    ],
  },
];

// Утилиты для генерации интерактивных форматов из словарного набора

/** Квиз: выбери перевод */
export function generateQuiz(words: VocabEntry[]) {
  return words.map((w) => {
    const distractors = words
      .filter((d) => d.id !== w.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map((d) => d.translation);
    const options = [w.translation, ...distractors].sort(() => Math.random() - 0.5);
    return {
      id: `quiz-${w.id}`,
      prompt: `What does "${w.word}" mean?`,
      options,
      correct: options.indexOf(w.translation),
      explanation: `${w.word} — ${w.translation}. ${w.example}`,
    };
  });
}

/** Match up: соедини слово с переводом */
export function generateMatchPairs(words: VocabEntry[]) {
  return words.slice(0, 8).map((w) => ({
    id: `match-${w.id}`,
    left: w.word,
    right: w.translation,
  }));
}

/** Group sort: распредели слова по категориям */
export function generateGroupSort(words: VocabEntry[]) {
  const cats = [...new Set(words.map((w) => w.category))].slice(0, 4);
  return cats.map((cat) => ({
    category: cat,
    words: words.filter((w) => w.category === cat).map((w) => w.word),
  }));
}

/** Complete the sentence: вставь слово в пропуск */
export function generateCompleteSentence(words: VocabEntry[]) {
  return words.map((w) => {
    const blank = w.example.replace(new RegExp(w.word, "gi"), "___");
    return {
      id: `complete-${w.id}`,
      prompt: blank === w.example ? `___ means "${w.translation}".` : blank,
      answers: [w.word.toLowerCase()],
      explanation: `${w.word} — ${w.translation}. ${w.definition}`,
    };
  });
}
