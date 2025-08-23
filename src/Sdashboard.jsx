import React, { useState, useEffect } from "react";
import { Calendar, Clock, BookOpen, Lightbulb, GraduationCap, Pencil, Calculator, Globe2, BookOpenCheck, School, Ruler, PenTool } from 'lucide-react';
import "./TDashboard.css";

function SDashboard({ name = "" }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const quotes = [
    {
      text: "Anyone who has never made a mistake has never tried anything new",
      author: " Albert Einstein"
    },
    //  {
    //   text: "Be the teacher you needed as a student",
    //   author: "Zabit Kahlon"
    // },
     {
      text: "Behind every confident student is a teacher who believed first",
      author: "Zabit Kahlon"
    }, 
    {
      text: "It always seems impossible until it's done",
      author: "Nelson Mandela"
    },
    {
      text: "Believe you can and you're halfway there",
      author: "Theodore Roosevelt"
    },
    {
      text: "The only way to do great work is to love what you do",
      author: "Steve Jobs"
    },
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [textAnimation, setTextAnimation] = useState("Tdash-text-visible");

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setTextAnimation("Tdash-text-fade-out");
      
      setTimeout(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        setTextAnimation("Tdash-text-fade-in");
      }, 500);
    }, 5000);

    return () => clearInterval(quoteInterval);
  }, [quotes.length]);

  return (
    <div className="Tdash-container">
      <div className="Tdash-background-doodles">
        <BookOpen className="Tdash-doodle Tdash-book" size={32} />
        <Lightbulb className="Tdash-doodle Tdash-bulb" size={32} />
        <GraduationCap className="Tdash-doodle Tdash-cap" size={32} />
        <Pencil className="Tdash-doodle Tdash-pencil" size={32} />
        <Calculator className="Tdash-doodle Tdash-calc" size={32} />
        <Globe2 className="Tdash-doodle Tdash-globe" size={32} />
        <BookOpenCheck className="Tdash-doodle Tdash-book-check" size={32} />
        <School className="Tdash-doodle Tdash-school" size={32} />
        <Ruler className="Tdash-doodle Tdash-ruler" size={32} />
        <PenTool className="Tdash-doodle Tdash-pen" size={32} />
      </div>
      
      <div className="Tdash-datetime-section">
        <div className="Tdash-time">
          <Clock size={24} />
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>
        <div className="Tdash-date">
          <Calendar size={24} />
          <span>{currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      <div className="Tdash-welcome-section">
        <h1 className="Tdash-welcome-title">!! السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُه</h1>
        
        <div className="Tdash-quote-container">
          <div className="Tdash-quote-carousel">
            <div className="Tdash-quote-card">
              <div className="Tdash-quote-icon">❝</div>
              <div className="Tdash-quote-content">
                <p className={`Tdash-quote-text ${textAnimation}`}>
                  {quotes[currentQuoteIndex].text}
                </p>
                <p className={`Tdash-quote-author ${textAnimation}`}>
                  ― {quotes[currentQuoteIndex].author}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SDashboard;