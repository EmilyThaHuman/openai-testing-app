import { listDriveFiles } from '@api/google-api';
import { useStore } from '@/store/store';
import { useCloudAuthStore } from '@/store/cloudAuthStore';

export const getFiles = async googleAccessToken => {
  if (!googleAccessToken) {
    useStore.getState().setToastMessage('Missing access token');
    useStore.getState().setToastShow(true);
    useStore.getState().setToastStatus('error');
    return null;
  }

  try {
    const driveFiles = await listDriveFiles(googleAccessToken);
    return driveFiles.files;
  } catch (err) {
    useCloudAuthStore.getState().setSyncStatus('unauthenticated');
    useStore.getState().setToastMessage(err.message);
    useStore.getState().setToastShow(true);
    useStore.getState().setToastStatus('error');
    return null;
  }
};

export const getFileID = async googleAccessToken => {
  if (!googleAccessToken) return null;

  try {
    const driveFiles = await listDriveFiles(googleAccessToken);
    return driveFiles.files.length ? driveFiles.files[0].id : null;
  } catch (err) {
    useStore.getState().setToastMessage(err.message);
    useStore.getState().setToastShow(true);
    useStore.getState().setToastStatus('error');
    return null;
  }
};

export const stateToFile = () => {
  try {
    const partializedState = useStore.getState();
    const blob = new Blob([JSON.stringify(partializedState)], {
      type: 'application/json',
    });
    return new File([blob], 'better-chatgpt.json', {
      type: 'application/json',
    });
  } catch (err) {
    useStore.getState().setToastMessage('Failed to create state file');
    useStore.getState().setToastShow(true);
    useStore.getState().setToastStatus('error');
    return null;
  }
};
