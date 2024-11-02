"use client";
import { useState, useContext, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { Typography, Input, Button } from "@material-tailwind/react";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, addDoc, getFirestore, getDocs, query, where} from "firebase/firestore";
import { AuthContext } from "@/app/components/auth/auth";
import { firebaseConfig} from "@/app/constants/firebaseconstants";

const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();


export default function LoginPage() {
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => setPasswordShown((cur) => !cur);
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const router = useRouter()

  async function getUserDetails(userInfo: any) {
    const db = getFirestore(app);
    const q = query(collection(db, "users"), where("email", "==", userInfo.email));
    const docSnap = await getDocs(q);
    if(docSnap.docs.length >= 1){
      docSnap.forEach((doc) => {
        console.log(doc.data())
        setCurrentUser(doc.data());
      });
      // router.push("/home")
    }else {
      router.push("/registration")
    }
    
  }

  useEffect(() => {
    if(currentUser){
      console.log("The user details are present herer")
      console.log(currentUser)
      router.push("/home")
    }
  },[currentUser])


  const signInFn = ()=>{
    const auth = getAuth();
    signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential && credential.accessToken;
      const user = result.user;
      getUserDetails(user)
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
    });
  }

  return (
    <section className="grid text-center h-screen items-center p-8">
      <div>
        <Typography variant="h3" className="mb-2">
          Sign In
        </Typography>
        <form action="#" className="mx-auto max-w-[24rem] text-left">
        
          <Button color="gray" size="lg" 
            className="mt-6 flex h-12 items-center justify-center gap-2"
            fullWidth onClick={signInFn}>
          <img
              src={`https://www.material-tailwind.com/logos/logo-google.png`}
              alt="google"
              className="h-6 w-6"
            />{" "}
            sign in with google
          </Button>
          <Typography
            variant="small"
            color="gray"
            className="!mt-4 text-center font-normal"
          >
            Not registered?{" "}
            <a href="#" className="font-medium text-gray-900">
              Create account
            </a>
          </Typography>
        </form>
      </div>
    </section>
  );
}