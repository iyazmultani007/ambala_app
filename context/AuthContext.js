

import React, { useEffect } from 'react';
import {
    onAuthStateChanged,
    getAuth,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import firebase_app from '../utils/firebase.config';
import Loader from '@/components/Loader/Loader';

const auth = getAuth(firebase_app);

export const AuthContext = React.createContext({});

export const useAuthContext = () => React.useContext(AuthContext);

export const AuthContextProvider = ({
    children,
}) => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
        });
        setLoading(false);
        return () => unsubscribe();
      }, []);

    // React.useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, (user) => {
    //         if (user) {
    //             setUser(user);
    //         } else {
    //             setUser(null);
    //         }
    //         setLoading(false);
    //     });

    //     return () => unsubscribe();
    // }, []);

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {loading ? <Loader /> : children}
        </AuthContext.Provider>
    );
};