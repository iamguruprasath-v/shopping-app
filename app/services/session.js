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
  @tracked _user = JSON.parse(localStorage.getItem('ssd'));

  constructor() {
    super(...arguments);
    if(!this.isAuthenticated) this.currentUser = null 
  }

  get currentUser() {
    return this._user;
  }

  set currentUser(user) {
    this._user = user;
  }

  get isAuthenticated() {
    const expiry = localStorage.getItem('ssd_expiry');
    if (!this.currentUser || !expiry || new Date() > new Date(expiry)) {
      return false;
    }
    return true;
  }

  getAllUsers() {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data).users : [];
  }

  getUserByEmail(email) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return this.utils.createResponse(false, MESSAGES.USER_NOT_FOUND, null, ERROR_CODES.USER_NOT_FOUND);
    }
    return this.utils.createResponse(true, MESSAGES.USER_FOUND, user);
  }

  #validateCredentials(email, password) {
    const users = this.getAllUsers();
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

  login({ email, password }) {
    const validation = this.#validateCredentials(email, password);
    if (!validation.success) return validation;

    this.currentUser = { ...validation.data };

    localStorage.setItem('ssd', JSON.stringify(this.currentUser));
    localStorage.setItem('ssd_expiry', this.utils.extendDate(new Date(), 2));

    return this.utils.createResponse(true, MESSAGES.LOGIN_SUCCESS, this.currentUser);
  }

  registerNewUser(userDetails) {
    const existing = this.getUserByEmail(userDetails.email);
    if (existing.success) {
      return this.utils.createResponse(false, 'User already exists');
    }

    const allUsers = this.getAllUsers();
    const newUser = this.setDefaultUserDetails(userDetails);

    allUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify({ users: allUsers }));

    return this.utils.createResponse(true, 'User Registered Successfully', newUser);
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('ssd');
    localStorage.removeItem('ssd_expiry');
  }

  // Currently not used this method but will be usefull for future.
  keepCurrUserLoggedIn() {
    const currUser = JSON.parse(localStorage.getItem('ssd'));
    const expiry = localStorage.getItem('ssd_expiry');

    if (!currUser || new Date() > new Date(expiry)) {
      return this.utils.createResponse(false, MESSAGES.SESSION_EXPIRED, null, ERROR_CODES.SESSION_EXPIRED);
    }

    this.currentUser = { ...currUser };
    localStorage.setItem('ssd_expiry', this.utils.extendDate(new Date(), 2));
    return this.utils.createResponse(true, 'Session extended', this.currentUser);
  }

  updateUserToDB(updatedUser) {
    const allUsers = this.getAllUsers();
    const updatedList = allUsers.map(user => user.id === updatedUser.id ? updatedUser : user);

    localStorage.setItem('users', JSON.stringify({ users: updatedList }));
    localStorage.setItem('ssd', JSON.stringify({ ...updatedUser }));
    this.currentUser = { ...updatedUser }
  }

  addOrRemFav(id, flag) {
    const users = JSON.parse(localStorage.getItem('users')).users;
    const index = users.findIndex(user => user.email === this.currentUser.email);

    if (index === -1) return;

    if (flag === 1 && !users[index].favourites.includes(id)) {
      users[index].favourites.push(id);
      this.currentUser.favourites.push(id);
    } else if (flag === 0 && users[index].favourites.includes(id)) {
      users[index].favourites = users[index].favourites.filter(pid => pid !== id);
      this.currentUser.favourites = this.currentUser.favourites.filter(pid => pid !== id);
    }

    localStorage.setItem('users', JSON.stringify({ users }));
    localStorage.setItem('ssd', JSON.stringify(this.currentUser));
    this.currentUser = { ...this.currentUser };
  }
}
