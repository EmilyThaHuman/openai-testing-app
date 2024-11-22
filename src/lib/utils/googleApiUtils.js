
import { listDriveFiles } from "@api/google-api";

export const getFiles = async (googleAccessToken) => {
  try {
    const driveFiles = await listDriveFiles(googleAccessToken);
    return driveFiles.files;
  } catch (e) {
    useCloudAuthStore.getState().setSyncStatus("unauthenticated");
    useStore.getState().setToastMessage(e.message);
    useStore.getState().setToastShow(true);
    useStore.getState().setToastStatus("error");
    return;
  }
};

export const getFileID = async (googleAccessToken) => {
  const driveFiles = await listDriveFiles(googleAccessToken);
  if (driveFiles.files.length === 0) return null;
  return driveFiles.files[0].id;
};

export const stateToFile = () => {
  const partializedState = createPartializedState(useStore.getState());

  const blob = new Blob([JSON.stringify(partializedState)], {
    type: "application/json",
  });
  const file = new File([blob], "better-chatgpt.json", {
    type: "application/json",
  });

  return file;
};
