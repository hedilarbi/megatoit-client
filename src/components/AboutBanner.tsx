import React from "react";
import styles from "@/styles/MatchsBanner.module.css"; // Assuming you have a CSS module for styles

const AboutBanner = () => {
  return (
    <section className={styles.banner}>
      <div>
        <h1 className="font-bebas-neue md:text-6xl text-3xl text-white text-center">
          Notre mission
        </h1>
      </div>
    </section>
  );
};

export default AboutBanner;
