export class ValidationUtils {
  static validateFileSize(file, maxSize) {
    return file.size <= maxSize;
  }

  static validateFileType(file, allowedTypes) {
    return allowedTypes.some(type => 
      type.endsWith('*') 
        ? file.type.startsWith(type.slice(0, -1))
        : file.type === type
    );
  }

  static validateApiKey(key) {
    return /^[a-zA-Z0-9-_]{32,}$/.test(key);
  }

  static validateInput(input, schema) {
    try {
      schema.parse(input);
      return { valid: true, errors: null };
    } catch (error) {
      return { valid: false, errors: error.errors };
    }
  }
}
