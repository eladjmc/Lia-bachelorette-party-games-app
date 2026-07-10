export interface TruthPrompt {
  id: string;
  type: "truth";
  text: string;
}

export const TRUTH_PROMPTS: TruthPrompt[] = [
  { id: "truth-01", type: "truth", text: "איך הכרת את לייה?" },
  { id: "truth-02", type: "truth", text: "מה היה הרושם הראשון שלך מלייה?" },
  {
    id: "truth-03",
    type: "truth",
    text: "מה הדבר הראשון שעולה לך בראש כשאת חושבת על לייה?",
  },
  { id: "truth-04", type: "truth", text: "מה הדבר שהכי מעצבן את לייה?" },
  { id: "truth-05", type: "truth", text: "מה לייה תמיד מזמינה במסעדה או בבר?" },
  { id: "truth-06", type: "truth", text: "איזה משפט לייה אומרת הרבה?" },
  { id: "truth-07", type: "truth", text: "מה הזיכרון הכי מצחיק שלך עם לייה?" },
  { id: "truth-08", type: "truth", text: "מה הרגע הכי מרגש שחווית עם לייה?" },
  {
    id: "truth-09",
    type: "truth",
    text: "מה הדבר הכי אמיץ שלייה עשתה לדעתך?",
  },
  {
    id: "truth-10",
    type: "truth",
    text: "מה הדבר שלייה לעולם לא תסכים לעשות?",
  },
  {
    id: "truth-11",
    type: "truth",
    text: "לאיזו תוכנית ריאליטי לייה הכי מתאימה?",
  },
  {
    id: "truth-12",
    type: "truth",
    text: "איזו דמות מסרט דיסני הכי מזכירה לך את לייה?",
  },
  { id: "truth-13", type: "truth", text: "מה לייה הייתה לוקחת איתה לאי בודד?" },
  {
    id: "truth-14",
    type: "truth",
    text: "מי לדעתך מכירה את לייה הכי טוב בחדר?",
  },
  {
    id: "truth-15",
    type: "truth",
    text: "מה לדעתך הדבר שלייה הכי אוהבת בסבי?",
  },
  {
    id: "truth-16",
    type: "truth",
    text: "על מה לדעתך לייה וסבי יתווכחו הכי הרבה?",
  },
  {
    id: "truth-17",
    type: "truth",
    text: "איזו עצה היית נותנת ללייה לחיי הנישואים?",
  },
];
