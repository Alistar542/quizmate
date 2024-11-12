"use client"
import { useState, useEffect } from 'react';
import {incorrectAnswersGifs, correctAnswerGifs} from '../constants/generalconstants'

export const getRandomIncorrectAnswerGif = () => {
    let totalSize = incorrectAnswersGifs.length
    let x = Math.floor((Math.random() * totalSize));
    return incorrectAnswersGifs[x];
}

export const getRandomCorrectAnswerGif = () => {
    let totalSize = correctAnswerGifs.length
    let x = Math.floor((Math.random() * totalSize));
    return correctAnswerGifs[x];
}

export const useThemeDetector = () => {
    const getCurrentTheme = () => {
        if (typeof window !== "undefined") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return false;
    };
    const [isDarkTheme, setIsDarkTheme] = useState(getCurrentTheme());  
    const mqListener = (e => {
        setIsDarkTheme(e.matches);
    });
    
    useEffect(() => {
        if (typeof window !== "undefined") {
            const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
            darkThemeMq.addListener(mqListener);
            return () => darkThemeMq.removeListener(mqListener);
        }
    }, []);
    return isDarkTheme;
}