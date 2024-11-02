"use client";
import { useState, useContext, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { Typography, Input, Button } from "@material-tailwind/react";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, addDoc, getFirestore, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../components/auth/auth";
import { firebaseConfig} from "@/app/constants/firebaseconstants";


const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();

export default function HomePage() {

  const { currentUser } = useContext(AuthContext);
  const [questionText, setQuestionText] = useState('');
  const [ questionDoc, setQuestionDoc ] = useState({});

  async function getUserQuestionInformation() {
    const db = getFirestore(app);
    const q = query(collection(db, "questions"), where("questionId", "==", currentUser.questionId));
    const docSnap = await getDocs(q);
    if(docSnap.docs.length >= 1){
      docSnap.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        setQuestionText(doc.data().question);
        setQuestionDoc(doc.data())
      });
    }
    
  }

  const loadDataOnlyOnce = () => {
    getUserQuestionInformation()
    // setQuestionText(null)
  }

  // This function will called only once
  useEffect(() => {
      loadDataOnlyOnce();
  }, [])

  return (
    <section className="grid text-center h-screen items-center p-8">
      <div>
        <Typography variant="h3" className="mb-2">
          Question no. {currentUser.questionId}
        </Typography>

        <Typography variant="h5" className="mb-2">
          {questionText} ?
        </Typography>

        <form action="#" className="mx-auto max-w-[24rem] text-left">
          <div className="w-full">
            <Input label="Your answer" />
          </div>

          <Button color="gray" size="lg"
            className="mt-6 flex h-12 items-center justify-center gap-2"
            fullWidth >
            Check Answer
          </Button>
        </form>
      </div>
    </section>
  )
}
