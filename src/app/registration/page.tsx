"use client";
import { useState, useRef } from "react";
import { useRouter } from 'next/navigation'

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, getFirestore, getDocs, query, where, or } from "firebase/firestore";
import { firebaseConfig } from "@/app/constants/firebaseconstants";
import { useForm, SubmitHandler } from "react-hook-form"
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography, 
  Input, 
  Button
} from "@material-tailwind/react";

const app = initializeApp(firebaseConfig);

type Inputs = {
  username: string
  password: string
  email: string
  repeatPassword: string
}


export default function RegistrationPage() {
  const router = useRouter()
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => setPasswordShown((cur) => !cur);
  const [modalMessage, setModalMessage] = useState('')
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);

  const [openSuccessModal, setopenSuccessModal] = useState(false);
  const handleSuccessOpen = () => {
    setopenSuccessModal(!openSuccessModal);
    router.push('/login')
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm<Inputs>()

  const password = useRef({});
  password.current = watch("password", "");

  const onSubmit: SubmitHandler<Inputs> = async function (data) {
    if (data.password.trim() === data.repeatPassword.trim()) {
      return getUserDetails(data)
        .then((result) => {
          if (result || result === null) {
            const auth = getAuth();
            console.log("user is not present")
            return createUserWithEmailAndPassword(auth, data.email.trim(), data.password.trim())
              .then((userCredential) => {
                const user = userCredential.user;
                // const token = credential && credential.accessToken;
                console.log("user from firebase", user)
                return saveUserToFirebase(data)
                  .then(() => {
                    setModalMessage('User registered successfully')
                    setopenSuccessModal(true)
                    reset()
                  })
              })
              .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage)
                setModalMessage('Error occured while saving user details')
                handleOpen()
              });
          } else {
            console.log("user is present already")
            setModalMessage('A user with the same email or username exists already')
            handleOpen()
          }
        })
    }
  }

  async function getUserDetails(userInfo: any) {
    const db = getFirestore(app);
    const q = query(collection(db, "users"), or(
      where("email", "==", userInfo.email),
      where("username", "==", userInfo.username)
    ));
    const docSnap = await getDocs(q);
    if (docSnap.docs.length >= 1) {
      docSnap.forEach((doc) => {
        let userFromDb = { userId: doc.id, ...doc.data() }
        console.log(userFromDb)
      });
    } else {
      return null;
    }
  }

  async function saveUserToFirebase(userInfo: any) {
    const db = getFirestore(app);
    console.log("Saving the details to firebase")
    const userDetailsToSave = {
      email: userInfo.email,
      username: userInfo.username,
      questionId: 1,
      clueId: 1,
      questionTimestamp: Date.now()
    }
    console.log("user details to save ", userDetailsToSave)
    const docRef = await addDoc(collection(db, "users"), userDetailsToSave);
  }

  return (
    <section className="grid text-center h-screen items-center p-8">
      <div>
        <Typography variant="h3" className="mb-2">
          Click register to sign up
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-[24rem] text-left">

          <div className="w-full">
            <Input label="Username"
              {...register("username",
                {
                  required: "Username is required",
                  maxLength: {
                    value: 8,
                    message: "Maximum 8 characters allowed",
                  },
                  pattern: {
                    value: /^[a-z0-9]+$/gi,
                    message: "Only alphanumeric characters allowed"
                  }
                })} />
            {errors.username && <p role="alert">{errors.username.message}</p>}
          </div>
          <div className="w-full mt-4">
            <Input label="Email" type="email"
              {...register("email",
                {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })} />
            {errors.email && <p role="alert">{errors.email.message}</p>}
          </div>
          <div className="w-full mt-4">
            <Input label="Password"
              type={passwordShown ? "text" : "password"}
              {...register("password",
                {
                  required: "Password is required",
                  pattern: { value: /^\S*$/, message: "Spaces not allowed" },
                  minLength: {
                    value: 8,
                    message: "Must be 8 characters",
                  },
                  maxLength: {
                    value: 12,
                    message: "Maximum 12 characters allowed",
                  },
                  validate: (value) => {
                    return (
                      [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].every((pattern) =>
                        pattern.test(value)
                      ) || "Must include lower, upper, number, and special chars"
                    );
                  },
                })}
              icon={
                <i onClick={togglePasswordVisiblity}>
                  {passwordShown ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5" />
                  )}
                </i>
              } />
            {errors.password && <p role="alert">{errors.password.message}</p>}
          </div>
          <div className="w-full mt-4">
            <Input label="Repeat Password" type="password"
              {...register("repeatPassword",
                {
                  required: "This field is required",
                  pattern: { value: /^\S*$/, message: "Spaces not allowed" },
                  minLength: {
                    value: 8,
                    message: "Must be 8 characters",
                  },
                  maxLength: {
                    value: 12,
                    message: "Maximum 12 characters allowed",
                  },
                  validate: value =>
                    value === password.current || "The passwords do not match"
                })} />
            {errors.repeatPassword && <p role="alert">{errors.repeatPassword.message}</p>}
          </div>

          <Button color="gray" size="lg"
            className="mt-6 flex h-12 items-center justify-center gap-2"
            type="submit"
            disabled={isSubmitting}
            fullWidth>
            {isSubmitting ? "Submitting..." : "Register"}
          </Button>

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

        <Dialog open={openSuccessModal} handler={handleSuccessOpen}>
          <DialogHeader>Message</DialogHeader>
          <DialogBody className="flex justify-center">
            Registration success
          </DialogBody>
          <DialogFooter>
            <Button variant="gradient" color="gray" onClick={handleSuccessOpen}>
              <span>OK</span>
            </Button>
          </DialogFooter>
        </Dialog>

      </div>
    </section>
  );
}