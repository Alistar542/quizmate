"use client";
import { useState,useContext, ChangeEvent } from "react";
import { useRouter } from 'next/navigation'
import { Typography, Input, Button } from "@material-tailwind/react";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, addDoc, getFirestore, getDocs, query, where} from "firebase/firestore";
import { AuthContext } from "../components/auth/auth";
import { firebaseConfig} from "@/app/constants/firebaseconstants";

const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();

export default function RegistrationPage() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [username, setUsername] = useState('');
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const togglePasswordVisiblity = () => setPasswordShown((cur) => !cur);
  const router = useRouter()

  const handleChange = (event : ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  async function saveUserDetails(userInfo: any) {
    const db = getFirestore(app);
    console.log("Saving the details")
    console.log(username)
    if(username && username === ""){
      return
    }
    const userDetailsToSave = {
      email: userInfo.email,
      name: userInfo.displayName,
      username: username,
      questionId : 1,
      clueId:1,
      questionTimestamp: Date.now()
    }
    const docRef = await addDoc(collection(db, "users"), userDetailsToSave);
    setCurrentUser(userDetailsToSave);
    router.push("/home")
    
  }

  const registerUserFn = ()=>{
    const auth = getAuth();
    signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential && credential.accessToken;
      const user = result.user;
      saveUserDetails(user)
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
          User does not exist
        </Typography>
        <Typography variant="small" className="mb-2">
          Click register to register the user
        </Typography>
        <form action="#" className="mx-auto max-w-[24rem] text-left">

          <div className="w-full">
            <Input label="Enter your username" onChange={handleChange}/>
          </div>
        
          <Button color="gray" size="lg" 
            className="mt-6 flex h-12 items-center justify-center gap-2"
            fullWidth onClick={registerUserFn}>
          <img
              src={`https://www.material-tailwind.com/logos/logo-google.png`}
              alt="google"
              className="h-6 w-6"
            />{" "}
            Register using google
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