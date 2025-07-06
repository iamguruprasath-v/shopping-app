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
  
  @service utils;

  get isAuthenticated() {
    let expiryDate = localStorage.getItem('ssd_expiry');
    if(!this.currentUser || !expiryDate || new Date() > expiryDate) return false;
    else return true;
  }

  async getUserByEmail(email) {
    if (!email?.trim()) {
      return this.utils.createResponse(false, 'Email is required', null, ERROR_CODES.INVALID_CREDENTIALS);
    }

    const usersData = localStorage.getItem('users');
    if (!usersData) {
      return this.utils.createResponse(false, MESSAGES.USER_NOT_FOUND, null, ERROR_CODES.USER_NOT_FOUND);
    }

    const users = JSON.parse(usersData);
    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return this.utils.createResponse(false, MESSAGES.USER_NOT_FOUND, null, ERROR_CODES.USER_NOT_FOUND);
    }

    const { password, ...userWithoutPassword } = user;
    return this.utils.createResponse(true, MESSAGES.USER_FOUND, userWithoutPassword);
  }

  async getAllUsers() {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data).users : [];
  }

  async #validateCredentials(email, password) {
    const users = await this.getAllUsers();
    const user = users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase() && u.password === password
    );

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
      return this.utils.createResponse(false, 'Email and password are required', null, ERROR_CODES.INVALID_CREDENTIALS);
    }

    const validation = await this.#validateCredentials(email, password);
    if (!validation.success) return validation;

    this.currentUser = validation.data;

    localStorage.setItem('ssd', JSON.stringify(this.currentUser));
    localStorage.setItem('ssd_expiry', this.utils.extendDate(new Date(), 2));

    return this.utils.createResponse(true, MESSAGES.LOGIN_SUCCESS, this.currentUser);
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
    this.currentUser = null;
    localStorage.removeItem('ssd');
    localStorage.removeItem('ssd_expiry');
  }

  keepCurrUserLoggedIn() {
    const currUser = JSON.parse(localStorage.getItem('ssd'));
    const expiry = localStorage.getItem('ssd_expiry');

    if (!currUser || new Date() > new Date(expiry)) {
      return this.utils.createResponse(false, MESSAGES.SESSION_EXPIRED, null, ERROR_CODES.SESSION_EXPIRED);
    }

    const newExpiry = this.utils.extendDate(new Date(), 2);
    localStorage.setItem('ssd_expiry', newExpiry);
    this.currentUser = currUser;

    return this.utils.createResponse(true, 'Session extended', currUser);
  }

  async updateUserToDB(updatedUser) {
    const allUsers = await this.getAllUsers();
    const updatedList = allUsers.map((user) => user.id === updatedUser.id ? updatedUser : user);

    localStorage.setItem('users', JSON.stringify({ users: updatedList }));
    localStorage.setItem('ssd', JSON.stringify({...updatedUser}))
    this.currentUser = updatedUser;
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
