"use client";
import { useState, useContext, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { Typography, Input, Button } from "@material-tailwind/react";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, getFirestore, getDocs, query, where, and } from "firebase/firestore";
import { AuthContext } from "@/app/components/auth/auth";
import { Spinner } from "@material-tailwind/react";
import { firebaseConfig } from "@/app/constants/firebaseconstants";
import Link from 'next/link';
import { useForm, SubmitHandler } from "react-hook-form"
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { useThemeDetector } from "../utilities/utilities";

const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();

type Inputs = {
  email: string
  password: string
}



export default function LoginPage() {
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => setPasswordShown((cur) => !cur);
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  // const [userEmail, setUserEmail] = useState('')
  // const [userPassword, setUserPassword] = useState('')
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter()
  // const {login} = useContext(AuthContext)
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  const [modalMessage, setModalMessage] = useState('')
  const isDarkTheme = useThemeDetector();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<Inputs>()


  useEffect(() => {
    console.log("calling use effect")
    const auth = getAuth();
    console.log(auth)
    if (auth.currentUser) {
      console.log("already authenticated in use effect")
      setCurrentUser(auth.currentUser);
      router.replace("/home");
      return;
    }
    // Listen for Firebase auth state changes
    const unsubscribe= auth.onAuthStateChanged(user => {
      if(user){
        console.log("auth changed in use effect", user)
        setAuthenticated(true);
        setCurrentUser(user)
        router.replace("/home")
        // getUserDetailsFromFirebase(user)
      }
      setLoading(false);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   if (currentUser) {
  //     console.log("The user details are present")
  //     router.push("/home")
  //   }
  // }, [currentUser])


  const onSubmit: SubmitHandler<Inputs> = async function (data) {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        return getUserDetailsFromFirebase(user)
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage)
        setModalMessage("Invalid email or password. Forgot password ? Contact the administrator")
        handleOpen()
      });
  }

  async function getUserDetailsFromFirebase(userInfo: any) {
    const db = getFirestore(app);
    const q = query(collection(db, "users"), and(
      where("email", "==", userInfo.email),where("uid", "==", userInfo.uid),
      )
    );
    const docSnap = await getDocs(q);
    if (docSnap.docs.length >= 1) {
      docSnap.forEach((doc) => {
        let userFromDb = { userId: doc.id, uid:userInfo.uid ,...doc.data() }
        console.log("user from db",userFromDb)
        if(userFromDb) {
          setCurrentUser(userFromDb);
          router.push('/home')
        }
      });
    } else {
      return null;
    }
  }

  // if(loading){
  //   return (
  //     <section className="grid text-center h-screen items-center p-8 justify-center">
  //       <Spinner className="h-14 w-14" />
  //     </section>
  //   )
  // }
  if (authenticated || loading) {
    return (
      <section className="grid text-center h-screen items-center p-8 justify-center">
        <Spinner className="h-14 w-14" />
      </section>
    )
  }

  return (
    
    <section className="grid text-center h-screen items-center p-8">
      <div>
        <Typography variant="h3" className="mb-2">
          Sign In
        </Typography>
        <form action="#" onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-[24rem] text-left">

          <div className="w-full mb-2">
            <Input label="Email" type="email" 
              color={isDarkTheme ? "white":"gray"}
              {...register("email",
                {required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
            />
            {errors.email && <p role="alert" className="text-sm text-red-400">{errors.email.message}</p>}
          </div>
          <div className="w-full mt-4">
            <Input label="Password" 
              color={isDarkTheme ? "white":"gray"}
              type={passwordShown ? "text" : "password"}
              {...register("password",
              {required: "Password is required",
                pattern: { value: /^\S*$/, message: "Spaces not allowed" }
              })}
              icon={
                <i onClick={togglePasswordVisiblity}>
                  {passwordShown ? (
                    <EyeIcon className="h-5 w-5 dark:text-white" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5 dark:text-white" />
                  )}
                </i>
              }/>
            {errors.password && <p role="alert" className="text-sm text-red-400">{errors.password.message}</p>}
          </div>
          <Button color="gray" size="lg"
            className="mt-6 flex h-12 items-center justify-center gap-2 dark:bg-white dark:text-black"
            disabled={isSubmitting}
            fullWidth type="submit">
            {isSubmitting ? "Submitting..." :"Login"}
          </Button>

          {/* <Button color="gray" size="lg"
            className="mt-4 flex h-12 items-center justify-center gap-2"
            fullWidth onClick={signInFn}>
            <img
              src={`https://www.material-tailwind.com/logos/logo-google.png`}
              alt="google"
              className="h-6 w-6"
            />{" "}
            sign in with google
          </Button> */}
          <Typography
            variant="small"
            color="gray"
            className="!mt-4 text-center font-normal dark:text-gray-500"
          >
            Not registered?{" "}
            <Link
              key="register"
              href="/register"
              className="font-medium text-gray-900 dark:text-white"
            >
              Create account
            </Link>
          </Typography>
        </form>
        <Dialog open={open} handler={handleOpen}>
          <DialogHeader>Message</DialogHeader>
          <DialogBody className="flex justify-center">
            {modalMessage}
          </DialogBody>
          <DialogFooter>
            <Button variant="gradient" color="gray" onClick={handleOpen}>
              <span>OK</span>
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </section>
  );
}