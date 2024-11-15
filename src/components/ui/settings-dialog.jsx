import React from 'react';
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';

export function SettingsDialog({ isOpen, onClose }) {
  return (
    <Dialog isOpen={isOpen} onDismiss={onClose} aria-label="Settings">
      <DialogOverlay />
      <DialogContent>
        <button className="close-button" onClick={onClose}>
          <span aria-hidden>×</span>
        </button>
        <h2 className="text-lg font-bold">Settings</h2>
        <p>Settings content goes here.</p>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
