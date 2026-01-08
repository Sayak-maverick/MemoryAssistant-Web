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

import React, { useState, useEffect, useRef } from 'react';
import { Item } from '../../types/item.types';
import { addItem, updateItem, deleteItem, getItemById } from '../../database/db';
import { detectLabels, suggestItemName } from '../../services/visionService';
import { AudioRecorder, transcribeAudio } from '../../services/audioService';
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
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);  // Image data URL
  const [imageFile, setImageFile] = useState<File | null>(null);  // Selected file
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDetectingLabels, setIsDetectingLabels] = useState(false);  // AI detection in progress
  const [suggestedLabels, setSuggestedLabels] = useState<string[]>([]);  // AI-detected labels
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);  // Recorded audio data URL
  const [audioTranscription, setAudioTranscription] = useState('');  // Transcribed text
  const [isRecording, setIsRecording] = useState(false);  // Currently recording
  const [isTranscribing, setIsTranscribing] = useState(false);  // Transcribing audio
  const audioRecorderRef = useRef<AudioRecorder | null>(null);  // Audio recorder instance

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
          setImageUrl(item.imageUrl);
          setAudioUrl(item.audioUrl);
          setAudioTranscription(item.audioTranscription || '');
        }
      });
    } else if (isOpen && !itemId) {
      // Reset form for add mode
      setName('');
      setDescription('');
      setLabels('');
      setImageUrl(undefined);
      setImageFile(null);
      setAudioUrl(undefined);
      setAudioTranscription('');
      setSuggestedLabels([]);
    }
  }, [isOpen, itemId]);

  /**
   * Handle image file selection
   * Now with AI object detection!
   */
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      // Convert to data URL for preview
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setImageUrl(dataUrl);

        // Detect labels using Google Vision API
        setIsDetectingLabels(true);
        try {
          const detectedLabels = await detectLabels(dataUrl);
          setSuggestedLabels(detectedLabels);

          // Auto-suggest item name if empty
          if (!name && detectedLabels.length > 0) {
            setName(suggestItemName(detectedLabels));
          }

          // Auto-fill labels if empty
          if (!labels && detectedLabels.length > 0) {
            setLabels(detectedLabels.join(', '));
          }
        } catch (error) {
          console.error('Failed to detect labels:', error);
        } finally {
          setIsDetectingLabels(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Start recording audio
   */
  const startRecording = async () => {
    try {
      if (!audioRecorderRef.current) {
        audioRecorderRef.current = new AudioRecorder();
      }
      await audioRecorderRef.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please allow microphone access.');
    }
  };

  /**
   * Stop recording and transcribe audio
   */
  const stopRecording = async () => {
    try {
      if (!audioRecorderRef.current) return;

      const dataUrl = await audioRecorderRef.current.stopRecording();
      setAudioUrl(dataUrl);
      setIsRecording(false);

      // Transcribe audio using Speech-to-Text
      setIsTranscribing(true);
      const transcription = await transcribeAudio(dataUrl);
      setAudioTranscription(transcription);
      setIsTranscribing(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      setIsTranscribing(false);
    }
  };

  /**
   * Delete audio recording
   */
  const deleteAudio = () => {
    setAudioUrl(undefined);
    setAudioTranscription('');
    if (audioRecorderRef.current) {
      audioRecorderRef.current.cancelRecording();
    }
  };

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
            imageUrl: imageUrl,  // Include image
            audioUrl: audioUrl,  // Include audio
            audioTranscription: audioTranscription || undefined,  // Include transcription
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
          imageUrl: imageUrl,  // Include image
          audioUrl: audioUrl,  // Include audio
          audioTranscription: audioTranscription || undefined,  // Include transcription
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

            {/* Image upload */}
            <div className="form-group">
              <label htmlFor="image">Photo (optional)</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="file-input"
              />

              {/* AI Detection indicator */}
              {isDetectingLabels && (
                <small style={{ color: '#2196F3', marginTop: '8px', display: 'block' }}>
                  🤖 AI is analyzing your image...
                </small>
              )}

              {/* Suggested labels */}
              {suggestedLabels.length > 0 && !isDetectingLabels && (
                <small style={{ color: '#4CAF50', marginTop: '8px', display: 'block' }}>
                  ✨ AI detected: {suggestedLabels.join(', ')}
                </small>
              )}

              {imageUrl && (
                <div className="image-preview">
                  <img src={imageUrl} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={() => {
                      setImageUrl(undefined);
                      setImageFile(null);
                      setSuggestedLabels([]);
                    }}
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Voice Note section */}
            <div className="form-group">
              <label>Voice Note (optional)</label>

              {/* Recording controls */}
              {!audioUrl && (
                <button
                  type="button"
                  className={isRecording ? "stop-recording-button" : "start-recording-button"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading || isTranscribing}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isRecording ? '#F44336' : '#2196F3',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    width: '100%',
                    marginTop: '8px',
                  }}
                >
                  {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
                </button>
              )}

              {/* Transcribing indicator */}
              {isTranscribing && (
                <small style={{ color: '#2196F3', marginTop: '8px', display: 'block' }}>
                  🤖 Transcribing audio...
                </small>
              )}

              {/* Audio player and transcription */}
              {audioUrl && (
                <div style={{ marginTop: '12px' }}>
                  <audio controls src={audioUrl} style={{ width: '100%', marginBottom: '8px' }} />

                  {audioTranscription && (
                    <div style={{
                      padding: '12px',
                      background: '#F5F5F5',
                      borderRadius: '8px',
                      marginBottom: '8px',
                    }}>
                      <strong style={{ fontSize: '12px', color: '#666' }}>Transcription:</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{audioTranscription}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={deleteAudio}
                    disabled={isLoading}
                    style={{
                      padding: '6px 12px',
                      background: '#F44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Remove Audio
                  </button>
                </div>
              )}
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
