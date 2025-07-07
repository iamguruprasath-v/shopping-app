// app/components/location-modal.js
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class LocationModal extends Component {
  @service session;
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
    // Create a destination element for the modal portal
    this.destinationElement = document.body;
  }

  initializeAddress() {
    const userAddress = this.session.currentUser?.address;
    if (userAddress) {
      this.address = { ...userAddress };
    }
  }

  get currentAddress() {
    return this.session.currentUser?.address;
  }

  get displayAddress() {
    if (!this.currentAddress) return 'Add delivery address';
    
    const { address, state, postalCode } = this.currentAddress;
    console.log(address, state, postalCode)
    // Create a shortened display version
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
    console.log('Opening modal...'); // Debug log
    this.isModalOpen = true;
    // If no address exists, start in edit mode
    if (!this.currentAddress) {
      this.isEditing = true;
    }
    console.log('Modal state:', this.isModalOpen, 'Editing:', this.isEditing); // Debug log
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
    // Reset form to current saved values
    const userAddress = this.session.currentUser?.address;
    if (userAddress) {
      this.address = { ...userAddress };
    }
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
  async saveAddress(event) {
    event.preventDefault();
    
    if (!this.isFormValid) {
      this.showError('Please fill in all required fields');
      return;
    }

    this.isSaving = true;
    
    try {
      const updatedUser = {
        ...this.session.currentUser,
        address: { ...this.address }
      };
      
      await this.session.updateUserToDB(updatedUser);
      this.isEditing = false;
      this.showSuccess('Address updated successfully');
      
    } catch (error) {
      console.error('Error saving address:', error);
      this.showError('Failed to save address. Please try again.');
    } finally {
      this.isSaving = false;
    }
  }

  @action
  handleBackdropClick(event) {
    // Close modal when clicking on backdrop
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  showSuccess(message) {
    // You can integrate with your notification service here
    console.log('Success:', message);
    // Example: this.notifications.success(message);
  }

  showError(message) {
    // You can integrate with your notification service here
    console.error('Error:', message);
    // Example: this.notifications.error(message);
  }

  @action
  handleModalMount(modalEl) {
      modalEl?.showModal?.();
  }  
  @action
  stopPropagation(e) {
      e.stopPropagation(); // prevents modal close when clicking inside box
  }
}