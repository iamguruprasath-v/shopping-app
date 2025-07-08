import Service from '@ember/service';


const RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
};

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
    const clonedDate = new Date(date);
    clonedDate.setDate(clonedDate.getDate() + extendedDays);
    return clonedDate;
  }

  /**
   * Creates a standardized response object
   * @param {boolean} success - Whether the operation was successful
   * @param {string} message - Human-readable message
   * @param {*} data - Response data
   * @param {string} errorCode - Machine-readable error code
   * @returns {Object} Standardized response
   */
  createResponse(success, message, data = null, errorCode = null) {
    return {
      success,
      status: success ? RESPONSE_STATUS.SUCCESS : RESPONSE_STATUS.ERROR,
      message,
      data,
      ...(errorCode && { errorCode }),
      timestamp: new Date().toISOString(),
    };
  }

  formatDateTime(dateObj) {
    return dateObj.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}
