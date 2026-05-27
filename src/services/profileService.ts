export interface UserProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthLocation: {
    name: string;
    lat: number;
    lon: number;
  };
}

const PROFILE_KEY = 'siddhidatri_user_profile';

export const profileService = {
  getProfile: (): UserProfile | null => {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveProfile: (profile: UserProfile): void => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  clearProfile: (): void => {
    localStorage.removeItem(PROFILE_KEY);
  }
};
