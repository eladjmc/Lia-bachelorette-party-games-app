export interface TriviaOption {
  id: string;
  text: string;
}

export interface TriviaQuestion {
  id: string;
  text: string;
  options: TriviaOption[];
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: "tq-01",
    text: "מה הצבע האהוב על רוב האנשים בעולם?",
    options: [
      { id: "a", text: "כחול" },
      { id: "b", text: "אדום" },
      { id: "c", text: "ירוק" },
      { id: "d", text: "צהוב" },
    ],
  },
  {
    id: "tq-02",
    text: "כמה יבשות יש בעולם?",
    options: [
      { id: "a", text: "5" },
      { id: "b", text: "6" },
      { id: "c", text: "7" },
      { id: "d", text: "8" },
    ],
  },
  {
    id: "tq-03",
    text: "מהי הבירה של צרפת?",
    options: [
      { id: "a", text: "ליון" },
      { id: "b", text: "פריז" },
      { id: "c", text: "מרסיי" },
    ],
  },
  {
    id: "tq-04",
    text: "איזה בעל חיים הוא הגדול ביותר בים?",
    options: [
      { id: "a", text: "כריש לבן" },
      { id: "b", text: "לוויתן כחול" },
      { id: "c", text: "תמנון ענק" },
      { id: "d", text: "דולפין" },
    ],
  },
  {
    id: "tq-05",
    text: "כמה ימים יש בשנה מעוברת?",
    options: [
      { id: "a", text: "365" },
      { id: "b", text: "366" },
      { id: "c", text: "364" },
    ],
  },
  {
    id: "tq-06",
    text: "מהו הכוכב הקרוב ביותר לשמש?",
    options: [
      { id: "a", text: "נוגה" },
      { id: "b", text: "מאדים" },
      { id: "c", text: "כוכב חמה" },
      { id: "d", text: "צדק" },
    ],
  },
  {
    id: "tq-07",
    text: "איזו שפה מדוברת הכי הרבה בעולם כשפת אם?",
    options: [
      { id: "a", text: "אנגלית" },
      { id: "b", text: "ספרדית" },
      { id: "c", text: "מנדרינית" },
      { id: "d", text: "הינדי" },
    ],
  },
  {
    id: "tq-08",
    text: "מהו המאכל הלאומי של איטליה לפי סטריאוטיפ נפוץ?",
    options: [
      { id: "a", text: "סושי" },
      { id: "b", text: "פיצה" },
      { id: "c", text: "המבורגר" },
      { id: "d", text: "טאקו" },
      { id: "e", text: "פלאפל" },
    ],
  },
  {
    id: "tq-09",
    text: "כמה צבעים יש בקשת בענן?",
    options: [
      { id: "a", text: "5" },
      { id: "b", text: "6" },
      { id: "c", text: "7" },
    ],
  },
  {
    id: "tq-10",
    text: "מהו החודש האחרון בשנה?",
    options: [
      { id: "a", text: "נובמבר" },
      { id: "b", text: "דצמבר" },
      { id: "c", text: "ינואר" },
    ],
  },
];

export function getTriviaQuestionById(id: string): TriviaQuestion | undefined {
  return TRIVIA_QUESTIONS.find((q) => q.id === id);
}
