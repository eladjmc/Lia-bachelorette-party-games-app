export interface PassTheParcelQuestion {
  id: string;
  text: string;
}

export const PASS_THE_PARCEL_QUESTIONS: PassTheParcelQuestion[] = [
  {
    id: "ptp-01",
    text: "איך הכרת את לייה ומה היה הרושם הראשון שלך ממנה?",
  },
  { id: "ptp-02", text: "מה הדבר הראשון שאת עושה כשאת קמה בבוקר?" },
  { id: "ptp-03", text: "איזו סדרה את יכולה לראות שוב ושוב?" },
  { id: "ptp-04", text: "מה המאכל שאת אף פעם לא מסרבת לו?" },
  { id: "ptp-05", text: "מה המקום הכי יפה שביקרת בו?" },
  { id: "ptp-06", text: "איזו דמות מסרט של דיסני/פיקסאר הכי דומה לך?" },
  { id: "ptp-07", text: "איזה מקצוע היית רוצה לנסות ליום אחד?" },
  { id: "ptp-08", text: "מה הקנייה הכי מיותרת שעשית לאחרונה?" },
  { id: "ptp-09", text: "עם איזו מפורסמת היית שמחה לצאת לארוחת ערב?" },
  { id: "ptp-10", text: "מה החופשה המושלמת מבחינתך?" },
  {
    id: "ptp-11",
    text: "מה הדבר הראשון שהיית עושה אם היית זוכה במיליון שקלים?",
  },
  {
    id: "ptp-12",
    text: "אם היית יכולה לחזור לגיל מסוים לשבוע, איזה גיל היית בוחרת?",
  },
  { id: "ptp-13", text: "איזה אימוג׳י את שולחת הכי הרבה?" },
  { id: "ptp-14", text: "מה הדבר שהיית רוצה ללמוד בשנה הקרובה?" },
];

export function getPassTheParcelQuestionById(
  id: string,
): PassTheParcelQuestion | undefined {
  return PASS_THE_PARCEL_QUESTIONS.find((q) => q.id === id);
}
