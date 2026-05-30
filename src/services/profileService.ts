export interface UserProfile {
  name: string;
  email: string;
  password?: string;
  dob: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthPlace: string;
  latitude: number;
  longitude: number;
  elevation: number;
}

const REGISTERED_USERS_KEY = 'siddhidatri_registered_users';
const ACTIVE_USER_KEY = 'siddhidatri_active_user';

export const profileService = {
  // Get all registered users on this device
  getRegisteredUsers: (): UserProfile[] => {
    const data = localStorage.getItem(REGISTERED_USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Register a new user
  registerUser: (profile: UserProfile): void => {
    const users = profileService.getRegisteredUsers();
    
    // Check if user already exists
    const exists = users.some(u => u.email.toLowerCase() === profile.email.toLowerCase());
    if (exists) {
      throw new Error("A user with this email address already exists.");
    }

    users.push(profile);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    
    // Auto login after registration
    profileService.setActiveUser(profile);
  },

  // Log in a user with email and password
  loginUser: (email: string, password?: string): UserProfile => {
    const users = profileService.getRegisteredUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    profileService.setActiveUser(user);
    return user;
  },

  // Set the active user session
  setActiveUser: (profile: UserProfile): void => {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(profile));
  },

  // Get current active user
  getActiveUser: (): UserProfile | null => {
    const data = localStorage.getItem(ACTIVE_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Log out current user
  logoutUser: (): void => {
    localStorage.removeItem(ACTIVE_USER_KEY);
  }
};
