// components/withPrivateRoute.js
"use client"
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/app/components/auth/auth';
import { useEffect, useContext } from 'react';

export default function withPrivateRoute(WrappedComponent) {
  return (props) => {
    const { currentUser } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
      if (!currentUser) {
        router.replace('/login'); // Redirect to login if not authenticated
      }
    }, [currentUser, router]);

    // Only render the component if the user is authenticated
    if (!currentUser) {
      return null; // Or a loading spinner if you prefer
    }

    return <WrappedComponent {...props} />;
  };
};