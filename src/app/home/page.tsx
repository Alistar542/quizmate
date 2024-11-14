"use client";
import { useState, useContext, useEffect, ChangeEvent } from "react";
import { useRouter } from 'next/navigation'
import { Typography, Input, Button } from "@material-tailwind/react";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, addDoc, getFirestore, getDocs, query, where, updateDoc, doc, and } from "firebase/firestore";
import { AuthContext } from "@/app/components/auth/auth";
import { firebaseConfig } from "@/app/constants/firebaseconstants";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { useForm, SubmitHandler } from "react-hook-form";

import Image from 'next/image'
import profilePic from '../../../media/avatar.png'
import { getRandomIncorrectAnswerGif, getRandomCorrectAnswerGif, useThemeDetector} from "../utilities/utilities";


const app = initializeApp(firebaseConfig);

type Inputs = {
  answer: string
}

export default function HomePage() {

  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [questionText, setQuestionText] = useState('');
  const [questionDoc, setQuestionDoc] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  const [showResults, setShowResults] = useState(false)

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  
  const [incorrectAnswerOpen, setIncorrectAnswerOpen] = useState(false);
  const handleIncorrectOpen = () => setIncorrectAnswerOpen(!incorrectAnswerOpen);
  const [isLoading, setIsLoading] = useState(false)
  const isDarkTheme = useThemeDetector();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<Inputs>()


  // This function will called only once
  useEffect(() => {
    console.log("inside the current user useffect")
    async function getUserQuestionInformation() {
      setIsLoading(true)
      const db = getFirestore(app);
      const q = query(collection(db, "questions"), where("questionId", "==", currentUser.questionId));
      const docSnap = await getDocs(q);
      if (docSnap.docs.length >= 1) {
        docSnap.forEach((doc) => {
          setQuestionText(doc.data().question);
          setQuestionDoc(doc.data())
          setIsLoading(false)
        });
      }

    }
    if (currentUser.questionId) {
      getUserQuestionInformation();
    }
  }, [currentUser])

  useEffect(() => {
    console.log("inside the main useffect")
    async function getUserDetailsFromFirebase() {
      const db = getFirestore(app);
      console.log(currentUser)
      const q = query(collection(db, "users"), and(
        where("email", "==", currentUser?.email),
        where("uid", "==", currentUser?.uid),
      )
      );
      const docSnap = await getDocs(q);
      if (docSnap.docs.length >= 1) {
        docSnap.forEach((doc) => {
          let userFromDb = { userId: doc.id, ...doc.data() }
          console.log("user from db", userFromDb)
          if (userFromDb) {
            setCurrentUser(userFromDb);
          }
        });
      }
    }
    getUserDetailsFromFirebase();
  }, [])

  async function checkAnswerFn(userAnswerS: string) {
    const db = getFirestore(app);

    const q = query(collection(db, "questions"), where("questionId", "==", currentUser.questionId), where("answer", "==", userAnswerS));
    const docSnap = await getDocs(q);
    if (docSnap.docs.length >= 1) {
      handleOpen()
      // setUserAnswer('')
      const userRef = doc(db, "users", currentUser.userId);
      await updateDoc(userRef, {
        questionId: currentUser.questionId + 1
      })
      setCurrentUser({ ...currentUser, "questionId": currentUser.questionId + 1 })
      return true
    } else {
      console.log("wrong answer")
      return false
    }
  }

  const onSubmit: SubmitHandler<Inputs> = async function (data) {
    return checkAnswerFn(data.answer)
      .then((result) => {
        if(result){
          reset()
        }else {
          handleIncorrectOpen()
          console.log("incorrect")
        }
      })
      .catch((error) => {

      });
  }


  // const hellow = () => {
  //   checkAnswerFn(userAnswer);
  // }

  // const handleUserAnswer = (event: ChangeEvent<HTMLInputElement>) => {
  //   setUserAnswer(event.target.value)
  // }

  return (
    <section className="grid text-center h-full items-center p-8">
      <div>

        {currentUser.questionId != "" && questionText != ""  && !isLoading?
          <Typography variant="h3" className="mb-2">
            Question no. {currentUser && currentUser.questionId}
          </Typography>
          :
          <div className="flex animate-pulse justify-center items-center">
            <Typography variant="h5" className="mb-2 h-8 w-3/6 md:w-1/6 rounded-md bg-gray-300" as="div">
              &nbsp;
            </Typography>
          </div>}

        {currentUser.questionId != "" && questionText != ""  && !isLoading?
          <Typography variant="h5" className="mb-2">
            {questionText} ?
          </Typography>
          :
          <div className="flex animate-pulse justify-center items-center">
            <Typography variant="h5" className="mb-2 h-7 w-3/4 md:w-1/5 rounded-md bg-gray-300" as="div">
              &nbsp;
            </Typography>
          </div>}

        <form action="#" onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-[24rem] text-left">
          <div className="w-full">
            <Input label="Your answer"
              color={isDarkTheme ? "white":"gray"}
              disabled={currentUser.questionId && questionText != "" ? false:true}
              {...register("answer",
                {required: "Answer is required",
                })} />
            {errors.answer && <p role="alert" className="text-sm text-red-400">{errors.answer.message}</p>}
          </div>

          <Button color="gray" size="lg"
            className="mt-6 flex h-12 items-center justify-center gap-2 dark:bg-white dark:text-black"
            fullWidth
            disabled={currentUser.questionId && questionText != "" && !isSubmitting && !isLoading? false:true}
            type="submit">
            {isSubmitting ? "Submitting...":"Check Answer"}
          </Button>
        </form>

        <Dialog open={open} handler={handleOpen}>
          <DialogHeader>Correct answer</DialogHeader>
          <DialogBody className="flex justify-center">
            <img
              src={getRandomCorrectAnswerGif()}
              alt="google"
              className="h-72 w-72"
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="gradient" color="gray" onClick={handleOpen}>
              <span>OK</span>
            </Button>
          </DialogFooter>
        </Dialog>

        <Dialog open={incorrectAnswerOpen} handler={handleIncorrectOpen}>
          <DialogHeader>Wrong answer</DialogHeader>
          <DialogBody className="flex justify-center">
            <img
              src={getRandomIncorrectAnswerGif()}
              alt="google"
              className="h-72 w-72"
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="gradient" color="gray" onClick={handleIncorrectOpen}>
              <span>OK</span>
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </section>
  )
}
