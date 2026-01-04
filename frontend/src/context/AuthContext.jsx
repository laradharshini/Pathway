import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    getIdToken,
    updateProfile
} from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const idToken = await getIdToken(firebaseUser);
                    setToken(idToken);
                    localStorage.setItem('token', idToken);

                    // Synce with backend/Fetch profile
                    const res = await fetch('/api/auth/firebase-sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${idToken}`
                        },
                        body: JSON.stringify({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName
                        })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data.access_token) {
                            setToken(data.access_token);
                            localStorage.setItem('token', data.access_token);
                        }
                        setUser({ ...data.user, firebaseUid: firebaseUser.uid });
                    } else {
                        console.error("Backend sync failed");
                        // If backend fails but firebase succeeded, we might still have a partial session
                        // or we might want to force logout. For hackathon, we'll try to keep the user object minimal.
                        setUser({ email: firebaseUser.email, uid: firebaseUser.uid });
                    }
                } catch (err) {
                    console.error("Auth sync error:", err);
                }
            } else {
                setUser(null);
                setToken(null);
                localStorage.removeItem('token');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email, password, name) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
            await updateProfile(result.user, { displayName: name });
        }
        return result;
    };

    const logout = () => {
        return signOut(auth);
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
