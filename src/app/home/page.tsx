"use client";
import { useState, useContext, useEffect,ChangeEvent } from "react";
import { useRouter } from 'next/navigation'
import { Typography, Input, Button } from "@material-tailwind/react";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, addDoc, getFirestore, getDocs, query, where,updateDoc, doc } from "firebase/firestore";
import { AuthContext } from "@/app/components/auth/auth";
import { firebaseConfig} from "@/app/constants/firebaseconstants";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import Image from 'next/image'
import profilePic from '../../../media/avatar.png'


const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();

export default function HomePage() {

  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [questionText, setQuestionText] = useState('');
  const [ questionDoc, setQuestionDoc ] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  const [showResults, setShowResults] = useState(false)

  const [open, setOpen] = useState(false);
 
  const handleOpen = () => setOpen(!open);



  // const loadDataOnlyOnce = () => {
  //   getUserQuestionInformation()
  //   // setQuestionText(null)
  // }

  // This function will called only once
  useEffect(() => {
    console.log("inside the current user useffect")
    async function getUserQuestionInformation() {
      const db = getFirestore(app);
      const q = query(collection(db, "questions"), where("questionId", "==", currentUser.questionId));
      const docSnap = await getDocs(q);
      if(docSnap.docs.length >= 1){
        docSnap.forEach((doc) => {
          setQuestionText(doc.data().question);
          setQuestionDoc(doc.data())
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
      const q = query(collection(db, "users"), 
        where("email", "==", currentUser?.email),
      );
      const docSnap = await getDocs(q);
      if (docSnap.docs.length >= 1) {
        docSnap.forEach((doc) => {
          let userFromDb = { userId: doc.id, ...doc.data() }
          console.log("user from db",userFromDb)
          if(userFromDb) {
            setCurrentUser(userFromDb);
          }
        });
      }
    }
    getUserDetailsFromFirebase();
  }, [])

  async function checkAnswerFn (userAnswerS : string){
    const db = getFirestore(app);

      const q = query(collection(db, "questions"), where("questionId", "==", currentUser.questionId), where("answer", "==", userAnswerS));
      const docSnap = await getDocs(q);
      if(docSnap.docs.length >= 1){
        docSnap.forEach((doc) => {
          // setQuestionText(doc.data().question);
          // setQuestionDoc(doc.data())

        });
        // setShowResults(true)
        handleOpen()
        setUserAnswer('')

        const userRef = doc(db, "users", currentUser.userId);

        await updateDoc(userRef, {
          questionId: currentUser.questionId +1
        })

        setCurrentUser({...currentUser, "questionId":currentUser.questionId+1})


      }else {
        console.log("wrong answer")
        // setShowResults(false)
      }
  }

 
  const hellow = () => {
    checkAnswerFn(userAnswer);
  }

  const handleUserAnswer= (event : ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(event.target.value)
  }

  return (
    <section className="grid text-center h-full items-center p-8">
      <div>
        <Typography variant="h3" className="mb-2">
          Question no. {currentUser && currentUser.questionId}
        </Typography>

        {/* <Image
          src={profilePic}
          width={500}
          height={500}
          alt="Picture of the author"
        /> */}
        
        <Typography variant="h5" className="mb-2">
          {questionText} ?
        </Typography>

        <form action="#" className="mx-auto max-w-[24rem] text-left">
          <div className="w-full">
            <Input label="Your answer" onChange={handleUserAnswer}/>
          </div>

          <Button color="gray" size="lg"
            className="mt-6 flex h-12 items-center justify-center gap-2"
            fullWidth 
            onClick={hellow}>
            Check Answer
          </Button>
        </form>

        <Dialog open={open} handler={handleOpen}>
        <DialogHeader>Correct answer</DialogHeader>
        <DialogBody className="flex justify-center">
          <img
              src={`https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExejRhNTV1bmw5MmJzenJlZjE0ODZwNnhxZ3FmYzdrcm8zaXlqNXcwciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/efNqSO4TuhKlYHyUa2/giphy.gif`}
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
      </div>
    </section>
  )
}
