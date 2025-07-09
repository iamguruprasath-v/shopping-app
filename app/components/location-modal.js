import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class LocationModal extends Component {
  @service session;
  @service toast;
  @tracked isModalOpen = false;
  @tracked isEditing = false;
  @tracked isSaving = false;
  @tracked address = {
    address: '',
    state: '',
    postalCode: ''
  };

  constructor() {
    super(...arguments);
    this.initializeAddress();
  }

  initializeAddress() {
    const userAddress = this.session.currentUser?.address;
    if (userAddress) {
      this.address = { ...userAddress };
    }
  }

  get currentAddress() {
    return this.address;
  }

  get displayAddress() {
    if (!this.currentAddress) return 'Add delivery address';
    
    const { address, state, postalCode } = this.currentAddress;
    const shortAddress = address.length > 25 ? `${address.substring(0, 25)}...` : address;
    return `${shortAddress}, ${state} ${postalCode}`;
  }

  get isFormValid() {
    return this.address.address.trim() && 
           this.address.state.trim() && 
           this.address.postalCode.trim();
  }

  @action
  openModal() {
    this.isModalOpen = true;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
    this.isEditing = false;
    this.initializeAddress();
  }

  @action
  enableEdit() {
    this.isEditing = true;
  }

  @action
  cancelEdit() {
    this.isEditing = false;
    this.initializeAddress();
  }

  @action
  handleChange(event) {
    const { name, value } = event.target;
    this.address = { 
      ...this.address, 
      [name]: value.trim() 
    };
  }

  @action
  saveAddress(event) {
    event.preventDefault();
    
    if (!this.isFormValid) {
      this.showError('Please fill in all required fields');
      return;
    }

    this.isSaving = true;
    
    setTimeout(() => {
      try {
        const updatedUser = {
          ...this.session.currentUser,
          address: { ...this.address }
        };
        
        this.session.updateUserToDB(updatedUser);
        this.isEditing = false;
        this.showSuccess('Address updated successfully');
        
      } catch (error) {
        console.error('Error saving address:', error);
        this.showError('Failed to save address. Please try again.');
      } finally {
        this.isSaving = false;
      }
    }, 5000)
  }

  @action
  handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  showSuccess(message) {
    this.toast.show(message)
  }

  showError(message) {
    this.toast.show(message)
  }

  @action
  handleModalMount(modalEl) {
    console.dir(modalEl.showModal)
      modalEl?.showModal?.();
  }
}