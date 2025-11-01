import React from "react";
import "./main.css"; 

export default function Home() {
  return (
    <main className="landing-page">
      <section className="home">
        <h1 className="title">SESAP</h1>
        <h3>List of planned features for our project</h3>
        
        <ul>
          <li>
            <h2>Structures Analysis Generation</h2>
            <p>Features include Life Timeline points, which will include event descriptions and timeframe/sentiment classifications.</p>
            <p>Main Themes Identification such as titles, themes, and predefined categories</p>
            <p>Notable quotes/areas of improvement</p>
          </li>
            <h2>Human Review Interface</h2>
            <p>This will mostly encompass user interactions in our app, such as management of submissions, editing, and status actions</p>
          <li>
          </li>
            <h2>Transcriptions Analysis Pipeline</h2>
            <p>LLM review with text embeddings to create a highly digestible, parsable, and searchable archive of student experiences. </p>
          <li>
          </li>
        </ul>

      </section>

      <section className="about">
        <h2>About our site</h2>
        <p>
          The EECS Student Experience Story Archive Project (SESAP) collects the narrative statements of students from underserved and marginalized communities. 
          Video testimonies are recorded and submitted by students in order to document their experiences in EECS programs. These are then analyzed in order to 
          highlight ways in which university and industry leaders can better support engineering students from underserved communities.
        </p>
      </section>
    </main>
  );
}
