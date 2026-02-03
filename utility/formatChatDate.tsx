import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(calendar);

export const formatChatDate = (date: string) => {
  return dayjs(date).calendar(null, {
    sameDay: "h:mm A", // 12:40 PM
    lastDay: "ddd h:mm A", // Tue 12:40 PM
    lastWeek: "ddd h:mm A", // Wed 12:24 PM
    sameElse: "MMM D, YYYY, h:mm A", // Jan 24, 2026, 12:48 PM
  });
};
