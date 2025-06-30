import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';


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
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
};

export default class SessionService extends Service {
  @tracked currentUser = JSON.parse(localStorage.getItem('ssd'));
  get isAuthenticated() {
    if(this.currentUser) return true;
    else return false;
  }

  @service utils;

  async getUserByEmail(email) {
    try {
      if (!email?.trim()) {
        return this.utils.createResponse(
          false,
          'Email is required',
          null,
          ERROR_CODES.INVALID_CREDENTIALS
        );
      }

      const usersData = localStorage.getItem('users');
      if (!usersData) {
        return this.utils.createResponse(
          false,
          MESSAGES.USER_NOT_FOUND,
          null,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      const users = JSON.parse(usersData);
      const user = users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        return this.utils.createResponse(
          false,
          MESSAGES.USER_NOT_FOUND,
          null,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      const { password, ...userWithoutPassword } = user;
      return this.utils.createResponse(true, MESSAGES.USER_FOUND, userWithoutPassword);
    } catch (error) {
      console.error('Error retrieving user:', error);
      return this.utils.createResponse(false, 'An error occurred', null, 'SYSTEM_ERROR');
    }
  }

  async getAllUsers() {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data).users : [];
  }

  async #validateCredentials(email, password) {
    try {
      const users = await this.getAllUsers();
      const user = users.find(
        (u) =>
          u.email?.toLowerCase() === email.toLowerCase() &&
          u.password === password
      );


      if (!user) {
        return this.utils.createResponse(
          false,
          MESSAGES.INVALID_CREDENTIALS,
          null,
          ERROR_CODES.INVALID_CREDENTIALS
        );
      }

      const { password: _, ...userWithoutPassword } = user;
      return this.utils.createResponse(true, MESSAGES.VALIDATION_SUCCESS, userWithoutPassword);
    } catch (error) {
      console.error('Credential validation failed:', error);
      return this.utils.createResponse(false, 'Validation error', null, 'VALIDATION_ERROR');
    }
  }

  setDefaultUserDetails(userDetails) {
    return {
      ...userDetails,
      orders: [],
      favourites: [],
      cart: [],
    };
  }

  async login({ email, password }) {
    try {
      if (!email || !password) {
        return this.utils.createResponse(
          false,
          'Email and password are required',
          null,
          ERROR_CODES.INVALID_CREDENTIALS
        );
      }

      const validation = await this.#validateCredentials(email, password);
      if (!validation.success) return validation;

      this.currentUser = validation.data;

      localStorage.setItem(
        'ssd',
        JSON.stringify({
          user: this.currentUser,
          expiration: this.utils.extendDate(new Date(), 2),
        })
      );

      return this.utils.createResponse(true, MESSAGES.LOGIN_SUCCESS, this.currentUser);
    } catch (err) {
      console.error('Login error:', err);
      return this.utils.createResponse(false, 'Login error', null, 'LOGIN_ERROR');
    }
  }

  async registerNewUser(userDetails) {
    try {
      const existing = await this.getUserByEmail(userDetails.email);
      if (existing.success) {
        return this.utils.createResponse(false, 'User already exists');
      }

      const allUsers = await this.getAllUsers();
      const newUser = this.setDefaultUserDetails(userDetails);

      allUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(allUsers));

      return this.utils.createResponse(true, 'User Registered Successfully', newUser);
    } catch (err) {
      return this.utils.createResponse(false, 'Error during registration');
    }
  }

  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem('ssd');
  }

  keepCurrUserLoggedIn() {
    const sessionKey = 'ssd';
    const currSession = JSON.parse(localStorage.getItem(sessionKey));

    if (!currSession || new Date() > new Date(currSession.expiration)) {
      return this.utils.createResponse(
        false,
        MESSAGES.SESSION_EXPIRED,
        null,
        ERROR_CODES.SESSION_EXPIRED
      );
    }

    const newExpiryDate = this.utils.extendDate(new Date(), 2);
    localStorage.setItem(
      sessionKey,
      JSON.stringify({ ...currSession, expiration: newExpiryDate })
    );

    this.currentUser = currSession.user;
    this.isAuthenticated = true;

    return this.utils.createResponse(true, 'Session extended', currSession.user);
  }

  async updateUserToDB(updatedUser) {
    try {
      const allUsers = await this.getAllUsers();
      const updatedList = allUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      );

      localStorage.setItem('users', JSON.stringify(updatedList));
      this.currentUser = updatedUser;
    } catch (error) {
      console.error('Error updating user to DB:', error);
    }
  }
}
