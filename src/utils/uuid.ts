import { v4 as uuidv4 } from "uuid";

export function generateOrderNumber(user_id: string) {
  // Generate a UUID and remove non-numeric characters
  const uuid = uuidv4();
  return uuid;
}

// import { customAlphabet } from 'nanoid';

// export function generateOrderNumber(user_id: string): string {
//   // Create a custom alphabet for the nanoid (excluding similar-looking characters)
//   const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  
//   // Create a nanoid generator with the custom alphabet
//   const nanoid = customAlphabet(alphabet, 8);
  
//   // Get the current timestamp
//   const timestamp = Date.now().toString(36);
  
//   // Take the last 4 characters of the user_id (assuming it's long enough)
//   const userIdSuffix = user_id.slice(-4).padStart(4, '0');
  
//   // Combine all parts
//   return `${timestamp}-${userIdSuffix}-${nanoid()}`;
// }