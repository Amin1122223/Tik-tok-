import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Search, Pin, LogOut, Plus, X, Camera, CheckCircle, AlertCircle } from 'lucide-react';

// --- Firebase Initialization ---
// These variables will be automatically provided in the runtime environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
// Get Auth and Firestore instances
const auth = getAuth(app);
const db = getFirestore(app);

// --- Notification Component ---
// A simple component to display toast-like notifications
const Notification = ({ message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const Icon = type === 'success' ? CheckCircle : AlertCircle;

    return (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 space-x-reverse z-50 animate-fade-in-up`}>
            <Icon size={20} />
            <span className="mr-2">{message}</span>
            <button onClick={onClose} className="ml-2 text-white opacity-75 hover:opacity-100">
                <X size={18} />
            </button>
        </div>
    );
};

// --- Pin Component ---
// Displays an individual Pinterest pin with image, title, and user info
const PinComponent = ({ pin }) => (
    <div className="break-inside-avoid mb-4 group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        <img 
            src={pin.imageUrl} 
            alt={pin.title} 
            className="w-full rounded-lg" // Tailwind's rounded-lg on img itself
            onError={(e) => { 
                // Fallback image if the provided URL fails to load
                e.target.onerror = null; 
                e.target.src=`https://placehold.co/400x400/e2e8f0/4a5568?text=Image+Not+Found`; 
            }}
        />
        {/* Overlay for title and user info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-black bg-opacity-60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg">
            <p className="text-sm font-bold truncate">{pin.title}</p>
            <div className="flex items-center mt-1">
                <img src={pin.userPhoto || `https://placehold.co/24x24/e2e8f0/4a5568?text=U`} alt={pin.userName} className="w-6 h-6 rounded-full mr-2 border border-gray-300"/>
                <span className="text-xs">{pin.userName || 'مستخدم مجهول'}</span>
            </div>
        </div>
    </div>
);

// --- Upload Modal Component ---
// A modal for users to create and upload new pins
const UploadModal = ({ setShowModal, user, showNotification }) => {
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const modalRef = useRef();

    // Handle the pin upload process
    const handleUpload = async (e) => {
        e.preventDefault();
        // Basic client-side validation
        if (!title.trim() || !imageUrl.trim()) {
            setError('الرجاء ملء كل من العنوان ورابط الصورة.');
            return;
        }
        if (!user) {
            setError('يجب عليك تسجيل الدخول أولاً.');
            return;
        }
        
        setIsUploading(true);
        setError(''); // Clear previous errors

        try {
            // Define the Firestore collection path for public pins
            const pinsCollectionPath = `/artifacts/${appId}/public/data/pins`;
            await addDoc(collection(db, pinsCollectionPath), {
                title: title,
                imageUrl: imageUrl,
                userId: user.uid,
                userName: user.displayName || 'مستخدم مجهول', // Fallback for display name
                userPhoto: user.photoURL || '', // Fallback for photo URL
                createdAt: serverTimestamp() // Use server timestamp for consistent ordering
            });
            setShowModal(false); // Close modal on success
            setTitle(''); // Clear form fields
            setImageUrl('');
            showNotification('تم إضافة Pin بنجاح!', 'success'); // Show success notification
        } catch (err) {
            console.error("Error adding document: ", err);
            setError('حدث خطأ أثناء تحميل الصورة. الرجاء المحاولة مرة أخرى.');
            showNotification('فشل إضافة Pin. الرجاء المحاولة مرة أخرى.', 'error'); // Show error notification
        } finally {
            setIsUploading(false); // Reset uploading state
        }
    };
    
    // Effect to close the modal when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowModal(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setShowModal]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl transform transition-all scale-100 opacity-100 animate-fade-in" dir="rtl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">إنشاء Pin جديد</h2>
                    <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={28} />
                    </button>
                </div>
                <form onSubmit={handleUpload}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">العنوان</label>
                        <input 
                            type="text" 
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="أضف عنوانًا جذابًا..."
                            className="shadow-inner appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="imageUrl" className="block text-gray-700 text-sm font-bold mb-2">رابط الصورة (URL)</label>
                        <input 
                            type="url" // Use type="url" for better browser validation
                            id="imageUrl"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="shadow-inner appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}
                    <div className="flex items-center justify-end">
                        <button 
                            type="submit"
                            disabled={isUploading}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isUploading ? 'جاري التحميل...' : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Login Screen Component ---
// Displays the login screen with Google Sign-In option
const LoginScreen = ({ handleLogin }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4" dir="rtl">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md w-full animate-fade-in">
            <div className="flex justify-center items-center mb-6">
                 <Pin size={48} className="text-red-600" />
                 <h1 className="text-5xl font-bold text-gray-800 ml-3">Pinterest Clone</h1>
            </div>
            <p className="text-gray-600 mb-8 text-lg">اكتشف الإلهام وشاركه مع العالم</p>
            <button 
                onClick={handleLogin}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full"
            >
                {/* Google Icon SVG */}
                <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                تسجيل الدخول باستخدام Google
            </button>
        </div>
    </div>
);

// --- Main Application Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [pins, setPins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // State for search input
    const [notification, setNotification] = useState(null); // State for notifications

    // Callback function to show a notification
    const showNotification = useCallback((message, type) => {
        setNotification({ message, type });
        // Automatically hide notification after 3 seconds
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    }, []);

    // Effect to handle initial authentication (custom token or anonymous) and observe auth state
    useEffect(() => {
        const handleInitialAuth = async () => {
            let unsubscribeAuthObserver;
            try {
                // Attempt to sign in with custom token if provided by Canvas
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                    console.log("Signed in with custom token provided by Canvas.");
                } else {
                    // Fallback to anonymous sign-in if no custom token
                    await signInAnonymously(auth);
                    console.log("Signed in anonymously.");
                }
            } catch (error) {
                console.error("Initial authentication failed:", error);
                // If initial auth fails, still set up the observer to catch subsequent logins
            } finally {
                // Set up the auth state observer AFTER attempting initial sign-in
                // This ensures `setUser` and `setLoading` are updated based on the actual auth state
                unsubscribeAuthObserver = onAuthStateChanged(auth, (currentUser) => {
                    setUser(currentUser);
                    setLoading(false); // Set loading to false once auth state is determined
                    console.log("Auth state changed. Current user:", currentUser ? currentUser.uid : "No user");
                });
            }
            // Return the unsubscribe function for cleanup
            return unsubscribeAuthObserver;
        };

        let unsubscribeAuthCleanup;
        handleInitialAuth().then((unsub) => {
            if (unsub) {
                unsubscribeAuthCleanup = unsub;
            }
        });

        // Cleanup function for the effect: unsubscribe from auth state changes
        return () => {
            if (unsubscribeAuthCleanup) {
                unsubscribeAuthCleanup();
                console.log("Auth state observer unsubscribed.");
            }
        };
    }, []); // Empty dependency array to run only once on mount for initial auth

    // Effect to fetch pins from Firestore in real-time
    useEffect(() => {
        // Only attempt to fetch pins if authentication loading is complete
        // and a user object (even anonymous) is available.
        if (loading || !user) {
            console.log("Waiting for auth to complete before fetching pins. Loading:", loading, "User:", user);
            return; 
        }

        const pinsCollectionPath = `/artifacts/${appId}/public/data/pins`;
        const q = query(collection(db, pinsCollectionPath));
        
        console.log("Attempting to fetch pins from:", pinsCollectionPath);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const pinsData = [];
            querySnapshot.forEach((doc) => {
                pinsData.push({ id: doc.id, ...doc.data() });
            });
            // Sort pins by creation date (newest first)
            pinsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setPins(pinsData);
            console.log("Pins fetched successfully. Total pins:", pinsData.length);
        }, (error) => {
            console.error("Error fetching pins: ", error);
            showNotification('فشل تحميل Pins. الرجاء التحقق من اتصالك.', 'error');
        });

        return () => {
            unsubscribe(); // Cleanup subscription on unmount
            console.log("Firestore pins observer unsubscribed.");
        };
    }, [appId, loading, user, showNotification]); // Depend on appId, loading, and user state

    // Handle Google Sign-In
    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            showNotification('تم تسجيل الدخول بنجاح!', 'success');
            console.log("Google sign-in successful.");
        } catch (error) {
            console.error("Authentication failed: ", error);
            showNotification('فشل تسجيل الدخول. الرجاء المحاولة مرة أخرى.', 'error');
        }
    };

    // Handle user logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            showNotification('تم تسجيل الخروج بنجاح!', 'success');
            console.log("User logged out successfully.");
        } catch (error) {
            console.error("Sign out failed: ", error);
            showNotification('فشل تسجيل الخروج. الرجاء المحاولة مرة أخرى.', 'error');
        }
    };

    // Filter pins based on the search term
    const filteredPins = pins.filter(pin => 
        pin.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Show a loading spinner while authentication state is being determined
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-red-600"></div>
            </div>
        );
    }

    // If no user is logged in, show the login screen
    if (!user) {
        return <LoginScreen handleLogin={handleLogin} />;
    }

    // Main application UI
    return (
        <div className="bg-white min-h-screen font-sans" dir="rtl">
            {/* Navigation Header */}
            <header className="sticky top-0 z-40 bg-white shadow-sm p-4 flex items-center border-b border-gray-100">
                <a href="#" className="flex items-center text-red-600 mr-4">
                    <Pin size={28} className="transform rotate-45" />
                    <span className="font-bold text-xl hidden sm:block">Pinterest</span>
                </a>
                
                {/* Search Bar */}
                <div className="flex-grow mx-2 sm:mx-4">
                    <div className="relative">
                        <Search className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="بحث..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 rounded-full py-2 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        />
                    </div>
                </div>

                {/* User Actions (Create, Profile, Logout) */}
                <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
                    <button 
                        onClick={() => setShowUploadModal(true)} 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full flex items-center shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                    >
                        <Plus size={20} className="ml-1" />
                        <span className="hidden sm:inline">إنشاء</span>
                    </button>
                    
                    {/* User Profile Dropdown */}
                    <div className="group relative">
                        <img 
                            src={user.photoURL || `https://placehold.co/40x40/e2e8f0/4a5568?text=${user.displayName ? user.displayName.charAt(0) : 'U'}`} 
                            alt={user.displayName || 'User'} 
                            className="w-10 h-10 rounded-full cursor-pointer border-2 border-transparent hover:border-red-500 transition-all duration-200" 
                        />
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out">
                            <div className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                                <div className="font-medium truncate">{user.displayName || 'مستخدم مجهول'}</div>
                                <div className="text-gray-500 truncate">{user.email}</div>
                            </div>
                            <button 
                                onClick={handleLogout} 
                                className="w-full text-right block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md flex items-center justify-end"
                            >
                                تسجيل الخروج <LogOut size={16} className="mr-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Grid of Pins */}
            <main className="p-4">
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4">
                    {filteredPins.length > 0 ? (
                        filteredPins.map(pin => (
                            <PinComponent key={pin.id} pin={pin} />
                        ))
                    ) : (
                        // Empty state or no search results message
                       <div className="col-span-full text-center py-10 text-gray-500 w-full">
                           <Camera size={48} className="mx-auto mb-4" />
                           <h3 className="text-xl font-semibold">
                               {searchTerm ? 'لا توجد نتائج بحث لـ' : 'لا توجد أي Pins بعد'}
                               {searchTerm && <span className="text-red-600"> "{searchTerm}"</span>}
                           </h3>
                           <p>{searchTerm ? 'حاول البحث عن شيء آخر.' : 'كن أول من يضيف صورة!'}</p>
                       </div>
                    )}
                </div>
            </main>

            {/* Upload Modal */}
            {showUploadModal && <UploadModal setShowModal={setShowUploadModal} user={user} showNotification={showNotification} />}

            {/* Notification Display */}
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

            {/* Custom Tailwind CSS Animations (added for fade-in/up effects) */}
            {/* Removed 'jsx' attribute as it's not standard React and causes warnings */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
