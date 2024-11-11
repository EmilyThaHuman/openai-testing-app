import { debounce } from "lodash";
import { StorageValue } from "zustand/middleware";
import useStore from "@store/store";
import useCloudAuthStore from "@store/cloud-auth-store";
import {
  GoogleTokenInfo,
  GoogleFileResource,
  GoogleFileList,
} from "@type/google-api";
import PersistStorageState from "@type/persist";

import { createMultipartRelatedBody } from "./helper";

export const createDriveFile = async (file, accessToken) => {
  const boundary = "better_chatgpt";
  const metadata = {
    name: file.name,
    mimeType: file.type,
  };
  const requestBody = createMultipartRelatedBody(metadata, file, boundary);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": requestBody.size.toString(),
      },
      body: requestBody,
    }
  );

  if (response.ok) {
    const result = await response.json();
    return result;
  } else {
    throw new Error(
      `Error uploading file: ${response.status} ${response.statusText}`
    );
  }
};

export const getDriveFile = async (fileId, accessToken) => {
  const response = await fetch(
    `https://content.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const result = await response.json();
  return result;
};

export const getDriveFileTyped = async (fileId, accessToken) => {
  return await getDriveFile(fileId, accessToken);
};

export const listDriveFiles = async (accessToken) => {
  const response = await fetch(
    "https://www.googleapis.com/drive/v3/files?orderBy=createdTime desc",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error listing google drive files: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();
  return result;
};

export const updateDriveFile = async (file, fileId, accessToken) => {
  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: file,
    }
  );
  if (response.ok) {
    const result = await response.json();
    return result;
  } else {
    throw new Error(
      `Error uploading file: ${response.status} ${response.statusText}`
    );
  }
};

export const updateDriveFileName = async (fileName, fileId, accessToken) => {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name: fileName }),
    }
  );
  if (response.ok) {
    const result = await response.json();
    return result;
  } else {
    throw new Error(
      `Error updating file name: ${response.status} ${response.statusText}`
    );
  }
};

export const deleteDriveFile = async (fileId, accessToken) => {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.ok) {
    return true;
  } else {
    throw new Error(
      `Error deleting file name: ${response.status} ${response.statusText}`
    );
  }
};

export const validateGoogleOath2AccessToken = async (accessToken) => {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`
  );
  if (!response.ok) return false;
  const result = await response.json();
  return result;
};

export const updateDriveFileDebounced = debounce(
  async (file, fileId, accessToken) => {
    try {
      const result = await updateDriveFile(file, fileId, accessToken);
      useCloudAuthStore.getState().setSyncStatus("synced");
      return result;
    } catch (e) {
      useStore.getState().setToastMessage(e.message);
      useStore.getState().setToastShow(true);
      useStore.getState().setToastStatus("error");
      useCloudAuthStore.getState().setSyncStatus("unauthenticated");
    }
  },
  5000
);
