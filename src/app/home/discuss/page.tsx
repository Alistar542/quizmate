"use client";
import {
    Input, Button, Card, Typography
} from "@material-tailwind/react";
import { useState, ChangeEvent, useContext, useEffect} from "react";
import { AuthContext } from "@/app/components/auth/auth";

import { initializeApp } from "firebase/app";
import { firebaseConfig} from "@/app/constants/firebaseconstants";
import { collection, addDoc, getFirestore, onSnapshot ,orderBy, query, limit } from "firebase/firestore";

const app = initializeApp(firebaseConfig);

interface Message {
    id: string;
    message:string;
    userId:string;
    username:string;
    messageTimestamp:Date;
}

export default function DiscussPage() {
    const [message, setMessage] = useState('');
    const [fullMessages, setFullMessages] = useState<Message[]>([]);
    const { currentUser, setCurrentUser } = useContext(AuthContext);

    const handleChange = (event : ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    };

    async function sendMessageFn(){
        const db = getFirestore(app);
        if(message.trim() === ""){
            return
        }
        if(currentUser){

            const messageDetailsToSave = {
                userId: currentUser.userId,
                username: currentUser.username,
                message: message,
                messageTimestamp: Date.now()
            }
            setMessage('')
            const docRef = await addDoc(collection(db, "messages"), messageDetailsToSave);
            console.log("Saved the message")
            console.log(docRef)
        }
    }

    useEffect(() => {
        const db = getFirestore(app);
        const q = query(collection(db, "messages"), orderBy("messageTimestamp"), limit(50));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData: Message[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Message[];
            setFullMessages(messagesData)
        });

      
        // Cleanup listener on component unmount
        return () => unsubscribe();
      }, []);



    return (
        <div className="h-full w-full bg-gray-200">
            <div id="outer_div" className="h-full bg-gray-100 relative shadow-sm overflow-y-auto flex flex-col">
                <div className="flex flex-col h-full justify-between" >
                    <div className="flex flex-col">
                    {fullMessages.map(message => (
                        <Card className="w-96 p-2 m-2" key={message.id}>
                            <Typography variant="h6" color="blue-gray">
                                {message.username}
                            </Typography>
                            <Typography variant="small" color="blue-gray">
                                {new Date(message.messageTimestamp).toLocaleString()}
                            </Typography>
                            {message.message}
                        </Card>
                    ))}
                    </div>
                </div>
            </div>
            <div className="sticky bottom-0 left-0 w-full p-4 border-t border-gray-300 bg-white flex justify-end">
                <div className="relative w-full">
                    <Input label="Type a message" value={message} onChange={handleChange}/>
                    <Button
                        size="sm"
                        color="blue-gray"
                        className="!absolute right-1 top-1 rounded"
                        onClick={sendMessageFn}
                    >
                        Send
                    </Button>
                </div>
            </div>
        </div>
    )
}