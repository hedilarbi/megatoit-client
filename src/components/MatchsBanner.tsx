import React from "react";
import styles from "@/styles/MatchsBanner.module.css"; // Assuming you have a CSS module for styles

const MatchsBanner = () => {
  return (
    <section className={styles.banner}>
      <div>
        <h1 className="font-bebas-neue md:text-5xl text-3xl text-white text-center">
          Calendrier
        </h1>
      </div>
    </section>
  );
};

export default MatchsBanner;
