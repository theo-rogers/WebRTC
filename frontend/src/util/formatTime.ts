import Message from '../shared/classes/Message';
// import Meeting from '../shared/classes/Meeting';
/**
 * Format time into a string as: Month DD HH:MM PM/AM in the local time zone
 * @param {Date} date object to format
 * @return {string} The date as string in the above format
 */
export function toLocalStringMonth(date:Date) {
  return date.toLocaleTimeString([],
      {month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit'});
};
/**
 * Format time into a string as: Weekday HH:MM PM/AM in the local time zone
 * @param {Date} date object to format
 * @return {string} The date as string in the above format
 */
export function toLocalStringWeekday(date:Date) {
  return date.toLocaleTimeString([],
      {weekday: 'long', hour: 'numeric', minute: '2-digit'});
};
/**
 * Format time into a string as: HH:MM PM/AM in the local time zone
 * @param {Date} date object to format
 * @return {string} The date as string in the above format
 */
export function toLocalStringHour(date:Date) {
  return date.toLocaleTimeString([],
      {hour: 'numeric', minute: '2-digit'});
};
/**
 * Calculates the difference in minutes between the supplied Date objects.
 * If a second date is not supplied, the current time is used.
 * @param {Date} dateToCompare object to compare
 * @param {Date?} reference an optional date to reference, defaults to
 * current time.
 * @return {number} The time difference in minutes
 */
export function getTimeDiffMinutes(dateToCompare:Date, reference= new Date()) {
  return Math.floor((reference.getTime() - dateToCompare.getTime()) / (60_000));
};

/**
 * Formats provided time input to provide a user friendly string which
 * displays the difference between current time
 * (how long ago the time occurred).
 * @param {Date}inputTime The time to format
 * @return {string} The difference in time
 */
export function getPastTimeDifference(inputTime:Date) {
  /* timeDiff = difference in time (minutes) */
  const timeDiff = getTimeDiffMinutes(inputTime);
  const today = new Date();
  const oneWeekAgo = new Date().setDate(today.getDate() - 7);
  const beforeOneWeekAgo = oneWeekAgo > inputTime.getTime();

  const midnight = new Date().setHours(0, 0, 0, 0);
  const beforeMidnight = midnight > inputTime.getTime();

  let timeToDisplay = '';
  /* if time is before one week ago include month */
  if (beforeOneWeekAgo) timeToDisplay = toLocalStringMonth(inputTime);
  /* if time is before midnight include weekday */
  else if (beforeMidnight) timeToDisplay = toLocalStringWeekday(inputTime);
  /* if time is not before midnight and within 24 hours include hour */
  else if (timeDiff < 60 * 24) timeToDisplay = toLocalStringHour(inputTime);
  else if (timeDiff < 60) timeToDisplay = `${timeDiff} minutes ago`;
  else if (timeDiff === 1) timeToDisplay = `${timeDiff} minute ago`;
  else if (timeDiff === 0) timeToDisplay = 'now';
  return timeToDisplay;
}

/**
 * Formats message time to display how recently it occurred.
 * @param {Message} message The message to process
 * @return {string} The difference in time.
 */
export function getMessageTimeDifference(message:Message) {
  return getPastTimeDifference(message.timeStamp);
}
// export function getMeetingTimeUntilStart(meeting:Meeting) {
//
// }
//
