import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Room, Moment, Night, Settings } from '../types';

type AppAction = 
  | { type: 'SET_AUTH'; payload: boolean }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'DELETE_ROOM'; payload: string }
  | { type: 'ADD_MOMENT'; payload: Moment }
  | { type: 'UPDATE_MOMENT'; payload: Moment }
  | { type: 'DELETE_MOMENT'; payload: string }
  | { type: 'EXTEND_MOMENT'; payload: { id: string; multiplier: number } }
  | { type: 'ADD_NIGHT'; payload: Night }
  | { type: 'UPDATE_NIGHT'; payload: Night }
  | { type: 'DELETE_NIGHT'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Settings }
  | { type: 'LOAD_DATA'; payload: AppState }
  | { type: 'UPDATE_ROOM_STATUS_AUTO'; payload: { roomId: string; isAvailable: boolean; isClean: boolean } };

const initialState: AppState = {
  rooms: [
    { id: '1', number: '101', isAvailable: true, isClean: true },
    { id: '2', number: '102', isAvailable: true, isClean: true },
    { id: '3', number: '103', isAvailable: false, isClean: false },
  ],
  moments: [],
  nights: [],
  settings: {
    momentPrice: 1500,
    nightPrice: 5000,
    motelName: 'Parapli ROOM'
  },
  isAuthenticated: false
};

// Fonction pour vérifier si une chambre est actuellement occupée
const isRoomCurrentlyOccupied = (roomId: string, moments: Moment[], nights: Night[]): boolean => {
  const now = new Date();
  
  // Vérifier les moments actifs
  const activeMoments = moments.filter(moment => {
    if (moment.roomId !== roomId || moment.status !== 'active') return false;
    
    const startDateTime = new Date(`${moment.date}T${moment.startTime}`);
    const multiplier = moment.multiplier || 1;
    const durationMs = 2 * multiplier * 60 * 60 * 1000; // 2h * multiplicateur
    const endDateTime = new Date(startDateTime.getTime() + durationMs);
    
    return now >= startDateTime && now < endDateTime;
  });
  
  // Vérifier les nuits actives
  const activeNights = nights.filter(night => {
    if (night.roomId !== roomId || night.status !== 'active') return false;
    
    const checkInDate = new Date(night.checkInDate);
    const checkOutDate = new Date(night.checkOutDate);
    checkOutDate.setHours(23, 59, 59, 999); // Fin de journée
    
    return now >= checkInDate && now <= checkOutDate;
  });
  
  return activeMoments.length > 0 || activeNights.length > 0;
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, isAuthenticated: action.payload };
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(room => 
          room.id === action.payload.id ? action.payload : room
        )
      };
    case 'DELETE_ROOM':
      return {
        ...state,
        rooms: state.rooms.filter(room => room.id !== action.payload)
      };
    case 'ADD_MOMENT': {
      const newState = { ...state, moments: [...state.moments, action.payload] };
      
      // Marquer la chambre comme occupée et à nettoyer
      const updatedRooms = newState.rooms.map(room => 
        room.id === action.payload.roomId 
          ? { ...room, isAvailable: false, isClean: false }
          : room
      );
      
      return { ...newState, rooms: updatedRooms };
    }
    case 'UPDATE_MOMENT': {
      const newState = {
        ...state,
        moments: state.moments.map(moment => 
          moment.id === action.payload.id ? action.payload : moment
        )
      };
      
      // Mettre à jour le statut de la chambre en fonction du nouveau statut
      const updatedRooms = newState.rooms.map(room => {
        if (room.id === action.payload.roomId) {
          const isOccupied = isRoomCurrentlyOccupied(room.id, newState.moments, newState.nights);
          return {
            ...room,
            isAvailable: !isOccupied,
            isClean: !isOccupied
          };
        }
        return room;
      });
      
      return { ...newState, rooms: updatedRooms };
    }
    case 'DELETE_MOMENT': {
      const deletedMoment = state.moments.find(m => m.id === action.payload);
      const newState = {
        ...state,
        moments: state.moments.filter(moment => moment.id !== action.payload)
      };
      
      // Mettre à jour le statut de la chambre si nécessaire
      if (deletedMoment) {
        const updatedRooms = newState.rooms.map(room => {
          if (room.id === deletedMoment.roomId) {
            const isOccupied = isRoomCurrentlyOccupied(room.id, newState.moments, newState.nights);
            return {
              ...room,
              isAvailable: !isOccupied,
              isClean: !isOccupied
            };
          }
          return room;
        });
        
        return { ...newState, rooms: updatedRooms };
      }
      
      return newState;
    }
    case 'EXTEND_MOMENT':
      return {
        ...state,
        moments: state.moments.map(moment => {
          if (moment.id === action.payload.id) {
            const startDateTime = new Date(`${moment.date}T${moment.startTime}`);
            const newEndTime = new Date(startDateTime.getTime() + (2 * action.payload.multiplier * 60 * 60 * 1000));
            return {
              ...moment,
              multiplier: action.payload.multiplier,
              actualEndTime: newEndTime.toTimeString().slice(0, 5),
              price: state.settings.momentPrice * action.payload.multiplier
            };
          }
          return moment;
        })
      };
    case 'ADD_NIGHT': {
      const newState = { ...state, nights: [...state.nights, action.payload] };
      
      // Marquer la chambre comme occupée et à nettoyer
      const updatedRooms = newState.rooms.map(room => 
        room.id === action.payload.roomId 
          ? { ...room, isAvailable: false, isClean: false }
          : room
      );
      
      return { ...newState, rooms: updatedRooms };
    }
    case 'UPDATE_NIGHT': {
      const newState = {
        ...state,
        nights: state.nights.map(night => 
          night.id === action.payload.id ? action.payload : night
        )
      };
      
      // Mettre à jour le statut de la chambre en fonction du nouveau statut
      const updatedRooms = newState.rooms.map(room => {
        if (room.id === action.payload.roomId) {
          const isOccupied = isRoomCurrentlyOccupied(room.id, newState.moments, newState.nights);
          return {
            ...room,
            isAvailable: !isOccupied,
            isClean: !isOccupied
          };
        }
        return room;
      });
      
      return { ...newState, rooms: updatedRooms };
    }
    case 'DELETE_NIGHT': {
      const deletedNight = state.nights.find(n => n.id === action.payload);
      const newState = {
        ...state,
        nights: state.nights.filter(night => night.id !== action.payload)
      };
      
      // Mettre à jour le statut de la chambre si nécessaire
      if (deletedNight) {
        const updatedRooms = newState.rooms.map(room => {
          if (room.id === deletedNight.roomId) {
            const isOccupied = isRoomCurrentlyOccupied(room.id, newState.moments, newState.nights);
            return {
              ...room,
              isAvailable: !isOccupied,
              isClean: !isOccupied
            };
          }
          return room;
        });
        
        return { ...newState, rooms: updatedRooms };
      }
      
      return newState;
    }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    case 'LOAD_DATA':
      return action.payload;
    case 'UPDATE_ROOM_STATUS_AUTO':
      return {
        ...state,
        rooms: state.rooms.map(room => 
          room.id === action.payload.roomId 
            ? { ...room, isAvailable: action.payload.isAvailable, isClean: action.payload.isClean }
            : room
        )
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('parapli-room-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: { ...initialState, ...parsedData } });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('parapli-room-data', JSON.stringify(state));
  }, [state]);

  // Vérification automatique du statut des chambres toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      // Vérifier chaque chambre
      state.rooms.forEach(room => {
        const isOccupied = isRoomCurrentlyOccupied(room.id, state.moments, state.nights);
        
        // Si le statut a changé, mettre à jour
        if (room.isAvailable === isOccupied || room.isClean === isOccupied) {
          dispatch({
            type: 'UPDATE_ROOM_STATUS_AUTO',
            payload: {
              roomId: room.id,
              isAvailable: !isOccupied,
              isClean: !isOccupied
            }
          });
        }
      });
    }, 60000); // Vérifier toutes les minutes

    return () => clearInterval(interval);
  }, [state.rooms, state.moments, state.nights]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};