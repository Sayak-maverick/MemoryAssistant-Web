/**
 * AddEditItemModal.tsx - Modal dialog for adding/editing items
 *
 * This is the WEB VERSION of AddEditItemScreen.kt from Android
 *
 * Key concepts:
 * - Modal dialog (overlay that blocks interaction with background)
 * - Form handling with controlled inputs
 * - Add vs Edit mode
 * - Delete confirmation
 */

import React, { useState, useEffect } from 'react';
import { Item } from '../../types/item.types';
import { addItem, updateItem, deleteItem, getItemById } from '../../database/db';
import './AddEditItemModal.css';

/**
 * Props for AddEditItemModal
 */
interface AddEditItemModalProps {
  isOpen: boolean;                    // Whether modal is visible
  itemId?: string;                    // If provided, edit this item. If not, add new item
  onClose: () => void;                // Callback when modal is closed
  onSaved: () => void;                // Callback when item is saved
}

/**
 * AddEditItemModal component
 */
const AddEditItemModal: React.FC<AddEditItemModalProps> = ({
  isOpen,
  itemId,
  onClose,
  onSaved,
}) => {
  /**
   * STATE MANAGEMENT
   */
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [labels, setLabels] = useState('');  // Comma-separated string
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /**
   * Track if we're in edit mode
   */
  const isEditMode = !!itemId;

  /**
   * Load existing item data if in edit mode
   */
  useEffect(() => {
    if (isOpen && itemId) {
      // Load item from database
      getItemById(itemId).then((item) => {
        if (item) {
          setName(item.name);
          setDescription(item.description || '');
          setLabels(item.labels.join(', '));  // Convert array to string
        }
      });
    } else if (isOpen && !itemId) {
      // Reset form for add mode
      setName('');
      setDescription('');
      setLabels('');
    }
  }, [isOpen, itemId]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!name.trim()) {
      alert('Please enter an item name');
      return;
    }

    setIsLoading(true);

    try {
      // Parse labels (split by comma, trim whitespace)
      const labelsList = labels
        ? labels.split(',').map((l) => l.trim()).filter((l) => l)
        : [];

      if (isEditMode && itemId) {
        /**
         * EDIT MODE - Update existing item
         */
        const existingItem = await getItemById(itemId);
        if (existingItem) {
          const updatedItem: Item = {
            ...existingItem,
            name: name.trim(),
            description: description.trim() || undefined,
            labels: labelsList,
          };
          await updateItem(updatedItem);
        }
      } else {
        /**
         * ADD MODE - Create new item
         */
        const newItem: Item = {
          id: crypto.randomUUID(),
          name: name.trim(),
          description: description.trim() || undefined,
          createdAt: Date.now(),
          labels: labelsList,
        };
        await addItem(newItem);
      }

      // Success!
      setIsLoading(false);
      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
      setIsLoading(false);
      alert('Failed to save item');
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async () => {
    if (!itemId) return;

    setIsLoading(true);
    try {
      await deleteItem(itemId);
      setIsLoading(false);
      setShowDeleteDialog(false);
      onSaved();
      onClose();
    } catch (error) {
      console.error('Error deleting item:', error);
      setIsLoading(false);
      alert('Failed to delete item');
    }
  };

  /**
   * Don't render anything if not open
   */
  if (!isOpen) return null;

  return (
    <>
      {/* Modal overlay - darkens background */}
      <div className="modal-overlay" onClick={onClose}>
        {/* Modal content - stop propagation so clicking inside doesn't close */}
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <h2>{isEditMode ? 'Edit Item' : 'Add Item'}</h2>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="modal-form">
            {/* Name field */}
            <div className="form-group">
              <label htmlFor="name">Item Name *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Car Keys, Wallet"
                required
                disabled={isLoading}
              />
            </div>

            {/* Description field */}
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about this item..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Labels field */}
            <div className="form-group">
              <label htmlFor="labels">Labels</label>
              <input
                type="text"
                id="labels"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                placeholder="e.g., important, daily, work"
                disabled={isLoading}
              />
              <small>Separate multiple labels with commas</small>
            </div>

            {/* Buttons */}
            <div className="modal-actions">
              {isEditMode && (
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isLoading}
                >
                  Delete
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-button"
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div className="modal-overlay" onClick={() => setShowDeleteDialog(false)}>
          <div className="modal-content delete-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Item?</h3>
            <p>
              Are you sure you want to delete "{name}"? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="delete-button"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddEditItemModal;
