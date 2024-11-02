import { redirect } from 'next/navigation'

export default function Home() {

  const redirectToLogin = () => {
    // This function will be executed on the server
    redirect('/login');
  };

  // Call the function to trigger the redirection
  redirectToLogin();
  return (
    null
  );
}
