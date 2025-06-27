import Service from '@ember/service';

export default class UtilsService extends Service {
  /**
   * Returns a new Date object by extending the given date by a specified number of days.
   * 
   * @param {Date} date - The base date to extend
   * @param {number} extendedDays - Number of days to add
   * @returns {Date} - New Date object with extended days added
   * 
   * @example
   *   extendDate(new Date(), 2); // Returns a new date two days in the future
   */
  extendDate(date, extendedDays) {
    const clonedDate = new Date(date); // Clone to avoid mutating original
    clonedDate.setDate(clonedDate.getDate() + extendedDays);
    return clonedDate;
  }
}
