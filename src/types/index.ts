export interface Room {
  id: string;
  number: string;
  isAvailable: boolean;
  isClean: boolean;
}

export interface Person {
  fullName: string;
  idNumber: string;
  address: string;
  phone?: string;
  age: number;
}

export interface Moment {
  id: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  person1: Person;
  person2: Person;
  price: number;
  status: 'active' | 'completed' | 'cancelled';
  multiplier?: number; // Pour doubler, tripler, etc.
  actualEndTime?: string; // Heure de fin réelle si prolongé
}

export interface Night {
  id: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  person1: Person;
  person2: Person;
  price: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Settings {
  momentPrice: number;
  nightPrice: number;
  motelName: string;
}

export interface AppState {
  rooms: Room[];
  moments: Moment[];
  nights: Night[];
  settings: Settings;
  isAuthenticated: boolean;
}