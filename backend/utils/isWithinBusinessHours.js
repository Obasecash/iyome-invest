import moment from "moment-timezone";
import { BUSINESS_HOURS } from "../config/businessHours.js";

export function isWithinBusinessHours() {
  const now = moment().tz(BUSINESS_HOURS.timezone);

  const day = now.day();      // 0–6
  const hour = now.hour();    // 0–23

  const validDay = BUSINESS_HOURS.days.includes(day);
  const validHour =
    hour >= BUSINESS_HOURS.startHour &&
    hour < BUSINESS_HOURS.endHour;

  return validDay && validHour;
}
