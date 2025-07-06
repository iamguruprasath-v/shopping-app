import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

const MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  USER_FOUND: 'User found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  LOGIN_SUCCESS: 'User logged in successfully',
  VALIDATION_SUCCESS: 'Validation successful',
  SESSION_EXPIRED: 'Your previous session has expired',
};

const ERROR_CODES = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
};

export default class SessionService extends Service {
  @service utils;
  @tracked user = JSON.parse(localStorage.getItem('ssd'));

  get currentUser() {
    return this.user;
  }

  get isAuthenticated() {
    const expiry = localStorage.getItem('ssd_expiry');
    if (!this.user || !expiry || new Date() > new Date(expiry)) {
      return false;
    }
    return true;
  }

  async getAllUsers() {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data).users : [];
  }

  async getUserByEmail(email) {
    if (!email?.trim()) {
      return this.utils.createResponse(false, 'Email is required', null, ERROR_CODES.INVALID_CREDENTIALS);
    }

    const users = await this.getAllUsers();
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return this.utils.createResponse(false, MESSAGES.USER_NOT_FOUND, null, ERROR_CODES.USER_NOT_FOUND);
    }

    const { password, ...safeUser } = user;
    return this.utils.createResponse(true, MESSAGES.USER_FOUND, safeUser);
  }

  async #validateCredentials(email, password) {
    const users = await this.getAllUsers();
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
      return this.utils.createResponse(false, MESSAGES.INVALID_CREDENTIALS, null, ERROR_CODES.INVALID_CREDENTIALS);
    }

    return this.utils.createResponse(true, MESSAGES.VALIDATION_SUCCESS, user);
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
    if (!email || !password) {
      return this.utils.createResponse(false, 'Email and password are required');
    }

    const validation = await this.#validateCredentials(email, password);
    if (!validation.success) return validation;

    this.user = { ...validation.data };

    localStorage.setItem('ssd', JSON.stringify(this.user));
    localStorage.setItem('ssd_expiry', this.utils.extendDate(new Date(), 2));

    return this.utils.createResponse(true, MESSAGES.LOGIN_SUCCESS, this.user);
  }

  async registerNewUser(userDetails) {
    const existing = await this.getUserByEmail(userDetails.email);
    if (existing.success) {
      return this.utils.createResponse(false, 'User already exists');
    }

    const allUsers = await this.getAllUsers();
    const newUser = this.setDefaultUserDetails(userDetails);

    allUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify({ users: allUsers }));

    return this.utils.createResponse(true, 'User Registered Successfully', newUser);
  }

  logout() {
    this.user = null;
    localStorage.removeItem('ssd');
    localStorage.removeItem('ssd_expiry');
  }

  keepCurrUserLoggedIn() {
    const currUser = JSON.parse(localStorage.getItem('ssd'));
    const expiry = localStorage.getItem('ssd_expiry');

    if (!currUser || new Date() > new Date(expiry)) {
      return this.utils.createResponse(false, MESSAGES.SESSION_EXPIRED, null, ERROR_CODES.SESSION_EXPIRED);
    }

    this.user = { ...currUser };
    localStorage.setItem('ssd_expiry', this.utils.extendDate(new Date(), 2));
    return this.utils.createResponse(true, 'Session extended', this.user);
  }

  async updateUserToDB(updatedUser) {
    const allUsers = await this.getAllUsers();
    const updatedList = allUsers.map(user => user.id === updatedUser.id ? updatedUser : user);

    localStorage.setItem('users', JSON.stringify({ users: updatedList }));
    localStorage.setItem('ssd', JSON.stringify({ ...updatedUser }));

    this.user = { ...updatedUser }; // 🔁 tracked reactivity trigger
  }

  addOrRemFav(id, flag) {
    const users = JSON.parse(localStorage.getItem('users')).users;
    const index = users.findIndex(user => user.email === this.currentUser.email);

    if (index === -1) return;

    if (flag === 1 && !users[index].favourites.includes(id)) {
      users[index].favourites.push(id);
      this.user.favourites.push(id);
    } else if (flag === 0 && users[index].favourites.includes(id)) {
      users[index].favourites = users[index].favourites.filter(pid => pid !== id);
      this.user.favourites = this.user.favourites.filter(pid => pid !== id);
    }

    localStorage.setItem('users', JSON.stringify({ users }));
    localStorage.setItem('ssd', JSON.stringify(this.user));
    this.user = { ...this.user }; // 🔁 trigger tracked
  }
}
