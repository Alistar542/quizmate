"use client";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/app/components/auth/auth';
import { useEffect, useContext, ComponentType } from 'react';

const WithPrivateRoute = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const HOC = (props:P) => {
    const router = useRouter();
    const { currentUser } = useContext(AuthContext);

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

  // Set display name for better debugging
  HOC.displayName = `WithPrivateRoute(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return HOC;
};

export default WithPrivateRoute;
