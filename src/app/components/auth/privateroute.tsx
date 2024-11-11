"use client";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/app/components/auth/auth';
import { useEffect, useContext, ComponentType } from 'react';
import { getAuth } from "firebase/auth";
import { collection, getFirestore, getDocs, query, where } from "firebase/firestore";
import { firebaseConfig } from "@/app/constants/firebaseconstants";
import { initializeApp } from "firebase/app";

const app = initializeApp(firebaseConfig);

const WithPrivateRoute = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const HOC = (props: P) => {
    const router = useRouter();
    const { currentUser, setCurrentUser } = useContext(AuthContext);

    // async function getUserDetailsFromFirebase(userInfo: any) {
    //   const db = getFirestore(app);
    //   const q = query(collection(db, "users"), 
    //     where("email", "==", userInfo.email),
    //   );
    //   const docSnap = await getDocs(q);
    //   if (docSnap.docs.length >= 1) {
    //     docSnap.forEach((doc) => {
    //       let userFromDb = { userId: doc.id, ...doc.data() }
    //       console.log("user from db",userFromDb)
    //       userFromDb
    //       if(userFromDb) {
    //         setCurrentUser(userFromDb);
    //       }
    //     });
    //   } else {
    //     return null;
    //   }
    // }

    // useEffect(() => {
    //   if (!currentUser) {
    //     router.replace('/login'); // Redirect to login if not authenticated
    //   }
    // }, [currentUser, router]);

    useEffect(() => {
      const auth = getAuth();
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (!user) {
          console.log("auth changed- user not present", user)
          router.replace('/login');
        }else {
          setCurrentUser(user)
        }
      });

      // Clean up subscription on unmount
      return unsubscribe;
    }, []);

    // useEffect(() => {
    //   const auth = getAuth();
    //   // Listen for Firebase auth state changes
    //   const unsubscribe = auth.onAuthStateChanged(user => {
    //     if(user){
    //       console.log("auth changed", user)
    //       getUserDetailsFromFirebase(user)
    //     }
    //   });

    //   // Clean up subscription on unmount
    //   return unsubscribe;
    // }, []);

    // Only render the component if the user is authenticated
    if (!currentUser) {
      return null; // Or a loading spinner if you prefer
    }

    return <WrappedComponent {...props} />;
  };

  // Set display name for better debugging
  HOC.displayName = `WithPrivateRoute(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return HOC;
};

export default WithPrivateRoute;
