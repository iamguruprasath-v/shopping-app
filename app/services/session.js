import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

// Constants for response messages and status codes
const RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
};

const MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  USER_FOUND: 'User found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  LOGIN_SUCCESS: 'User logged in successfully',
  VALIDATION_SUCCESS: 'Validation successful',
  SESSION_EXPIRED: 'Your previous session has been expired',
};

const ERROR_CODES = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_FOUND: 'USER_FOUND',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
};

export default class SessionService extends Service {
  @tracked currentUser = null;
  @tracked isAuthenticated = false;
  @service utils;

  /**
   * Creates a standardized response object
   * @param {boolean} success - Whether the operation was successful
   * @param {string} message - Human-readable message
   * @param {*} data - Response data
   * @param {string} errorCode - Machine-readable error code
   * @returns {Object} Standardized response
   */
  #createResponse(success, message, data = null, errorCode = null) {
    return {
      success,
      status: success ? RESPONSE_STATUS.SUCCESS : RESPONSE_STATUS.ERROR,
      message,
      data,
      ...(errorCode && { errorCode }),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Retrieves user data from localStorage by email
   * @param {string} email - User email
   * @returns {Object} Response object with user data or error
   */
  async getUserByEmail(email) {
    try {
      if (!email?.trim()) {
        return this.#createResponse(
          false,
          'Email is required',
          null,
          ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      const usersData = localStorage.getItem('users');
      if (!usersData) {
        return this.#createResponse(
          false,
          MESSAGES.USER_NOT_FOUND,
          null,
          ERROR_CODES.USER_NOT_FOUND,
        );
      }

      const users = JSON.parse(usersData);
      const user = users.find(
        (user) => user.email?.toLowerCase() === email.toLowerCase(),
      );

      if (!user) {
        return this.#createResponse(
          false,
          MESSAGES.USER_NOT_FOUND,
          null,
          ERROR_CODES.USER_NOT_FOUND,
        );
      }

      // Don't return password in response for security
      const { password, ...userWithoutPassword } = user;

      return this.#createResponse(
        true,
        MESSAGES.USER_FOUND,
        userWithoutPassword,
      );
    } catch (error) {
      console.error('Error retrieving user:', error);
      return this.#createResponse(
        false,
        'An error occurred while retrieving user data',
        null,
        'SYSTEM_ERROR',
      );
    }
  }

  /**
   * Get all users from localstorage
   *
   * @async
   * @returns {Object} - List of users
   */
  async getAllUsers() {
    let allUsers = await localStorage.getItem('users');
    return JSON.parse(allUsers);
  }

  /**
   * Validates user credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Validation response
   */
  async #validateCredentials(email, password) {
    try {
      const usersData = localStorage.getItem('users');
      if (!usersData) {
        return this.#createResponse(
          false,
          MESSAGES.INVALID_CREDENTIALS,
          null,
          ERROR_CODES.USER_NOT_FOUND,
        );
      }

      const users = JSON.parse(usersData);
      const user = users.find(
        (user) =>
          user.email?.toLowerCase() === email.toLowerCase() &&
          user.password === password,
      );

      if (!user) {
        return this.#createResponse(
          false,
          MESSAGES.INVALID_CREDENTIALS,
          null,
          ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return this.#createResponse(
        true,
        MESSAGES.VALIDATION_SUCCESS,
        userWithoutPassword,
      );
    } catch (error) {
      console.error('Error validating credentials:', error);
      return this.#createResponse(
        false,
        'An error occurred during validation',
        null,
        'VALIDATION_ERROR',
      );
    }
  }

  /**
   * Description placeholder
   *
   * @param {Object} userDetails
   * @returns {Object} userDetails
   */
  setDefaultUserDetails(userDetails) {
    return {
      ...userDetails,
      orders: [],
      favourites: [],
      cart: [],
    };
  }

  /**
   * Authenticates user with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Object} Login response
   */
  async login(credentials) {
    try {
      // Input validation
      if (!credentials?.email || !credentials?.password) {
        return this.#createResponse(
          false,
          'Email and password are required',
          null,
          ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      // Validate credentials
      const validationResponse = await this.#validateCredentials(
        credentials.email,
        credentials.password,
      );

      if (validationResponse.success) {
        // Set session data
        this.currentUser = validationResponse.data;
        this.isAuthenticated = true;
        localStorage.setItem(
          'ssd',
          JSON.stringify({
            user: this.currentUser,
            expiration: this.utils.extendDate(new Date(), 2),
          }),
        );

        return this.#createResponse(
          true,
          MESSAGES.LOGIN_SUCCESS,
          validationResponse.data,
        );
      }

      return validationResponse;
    } catch (error) {
      console.error('Login error:', error);
      return this.#createResponse(
        false,
        'An error occurred during login',
        null,
        'LOGIN_ERROR',
      );
    }
  }

  /**
   * Registers new users with given details and with default values
   * @param {Object} userDetails - Has details about user
   * @returns {Object} Registered response
   */
  async registerNewUser(userDetails) {
    try {
      if (this.getUserByEmail(userDetails.email).message == MESSAGES.USER_FOUND)
        return this.#createResponse(false, 'User Already Exists');

      let allUsers = this.getAllUsers();
      let updatedUserDetails = this.setDefaultUserDetails(userDetails);
      allUsers.push(updatedUserDetails);
      await localStorage.setItem('users', JSON.stringify(allUsers));
      return this.#createResponse(
        true,
        'User Registered Successfully',
        updatedUserDetails,
      );
    } catch (error) {
        return this.#createResponse(false, "Error occured while user creation")
    }
  }

  /**
   * Logs out the current user
   */
  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  /**
   * Checks if user is currently authenticated
   * @returns {boolean} Authentication status
   */
  get isUserAuthenticated() {
    return this.isAuthenticated && this.currentUser !== null;
  }

  /**
   * Attempts to extend the user's session if the current session is valid.
   *
   * - Retrieves session data (`ssd`) from localStorage.
   * - If session is missing or expired, returns session expired response.
   * - If valid, extends expiration by 2 days and updates localStorage.
   *
   * @returns {Object} Standard response indicating success or failure
   */
  keepCurrUserLoggedIn() {
    const sessionKey = 'ssd';
    const currSession = JSON.parse(localStorage.getItem(sessionKey));

    if (!currSession || new Date() > new Date(currSession.expiration)) {
      return this.#createResponse(
        false,
        MESSAGES.SESSION_EXPIRED,
        null,
        ERROR_CODES.SESSION_EXPIRED,
      );
    }

    const newExpiryDate = this.utils.extendDate(new Date(), 2);

    localStorage.setItem(
      sessionKey,
      JSON.stringify({
        ...currSession,
        expiration: newExpiryDate,
      }),
    );

    return this.#createResponse(true, 'Session extended', currSession);
  }
}
