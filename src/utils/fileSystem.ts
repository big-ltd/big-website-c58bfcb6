
// Functions for handling local file system operations
import fs from 'fs-extra';
import path from 'path';

// Define constants
export const SLIDES_FOLDER = 'slides';
export const SLIDES_ORDER_FILE = 'invest_slides.json';

// Ensure directory exists
export const ensureDir = async (dirPath: string): Promise<boolean> => {
  try {
    await fs.ensureDir(dirPath);
    return true;
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    return false;
  }
};

// Save JSON data to file
export const saveJsonToFile = async (filePath: string, data: any): Promise<boolean> => {
  try {
    await fs.writeJson(filePath, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error(`Error saving JSON file ${filePath}:`, error);
    return false;
  }
};

// Read JSON data from file
export const readJsonFromFile = async (filePath: string): Promise<any> => {
  try {
    if (await fs.pathExists(filePath)) {
      return await fs.readJson(filePath);
    }
    return null;
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    return null;
  }
};

// Get full path to slides folder
export const getSlidesFolder = (): string => {
  return path.join(process.cwd(), 'public', SLIDES_FOLDER);
};

// Get full path to slides order file
export const getSlidesOrderFile = (): string => {
  return path.join(process.cwd(), 'public', SLIDES_ORDER_FILE);
};

// Generate a unique filename
export const generateUniqueFileName = (fileExtension: string): string => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 100000);
  return `${timestamp}_${randomId}.${fileExtension}`;
};

// Get public URL for a file
export const getPublicUrl = (filename: string, timestamp: number): string => {
  return `/${SLIDES_FOLDER}/${filename}?t=${timestamp}`;
};

// Save slides order
export const saveSlidesOrder = async (slideNames: string[]): Promise<boolean> => {
  const orderData = {
    slides: slideNames,
    lastUpdated: Date.now()
  };
  
  console.log('Saving slides order:', JSON.stringify(orderData, null, 2));
  const success = await saveJsonToFile(getSlidesOrderFile(), orderData);
  
  if (success) {
    console.log('Slides order saved successfully');
    // Verify the save by reading it back
    const verification = await readJsonFromFile(getSlidesOrderFile());
    console.log('Verification - slides order after save:', verification);
  }
  
  return success;
};

// Get slides order
export const getSlidesOrder = async (): Promise<string[]> => {
  try {
    // Ensure the slides folder exists
    await ensureDir(getSlidesFolder());
    
    const orderFile = getSlidesOrderFile();
    const orderData = await readJsonFromFile(orderFile);
    
    if (orderData && Array.isArray(orderData.slides)) {
      console.log('Retrieved slides order:', orderData.slides);
      return orderData.slides;
    }
    
    console.log('No valid slides order found, returning empty array');
    return [];
  } catch (error) {
    console.error('Error getting slides order:', error);
    return [];
  }
};

// Delete a file
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

// List files in directory
export const listFiles = async (dirPath: string): Promise<string[]> => {
  try {
    if (await fs.pathExists(dirPath)) {
      const files = await fs.readdir(dirPath);
      return files;
    }
    return [];
  } catch (error) {
    console.error(`Error listing files in ${dirPath}:`, error);
    return [];
  }
};

// Save uploaded file
export const saveUploadedFile = async (file: File, filename: string): Promise<boolean> => {
  try {
    const slidesFolder = getSlidesFolder();
    await ensureDir(slidesFolder);
    
    const filePath = path.join(slidesFolder, filename);
    const buffer = await file.arrayBuffer();
    
    await fs.writeFile(filePath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error(`Error saving uploaded file ${filename}:`, error);
    return false;
  }
};
