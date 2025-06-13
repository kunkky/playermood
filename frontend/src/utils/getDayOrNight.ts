export const getDayOrNight = (): "day" | "night" => {
  const hour = new Date().getHours(); // 0–23
  return hour >= 6 && hour < 18 ? "day" : "night";
};
