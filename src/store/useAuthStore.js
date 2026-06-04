import { create } from 'zustand';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const useAuthStore = create((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  init: () => {
    onAuthStateChanged(auth, async (user) => {
      let isAdmin = false;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            isAdmin = true;
          }
        } catch (e) {
          console.error("Error fetching user role:", e);
        }
      }
      
      set({ 
        user, 
        isAdmin,
        loading: false 
      });
    });
  },
  logout: async () => {
    await signOut(auth);
    set({ user: null, isAdmin: false });
  }
}));

export default useAuthStore;
