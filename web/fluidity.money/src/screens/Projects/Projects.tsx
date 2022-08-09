import React from "react";
import { TextButton } from "../../components/Button";
import ManualCarousel from "../../components/ManualCarousel";
import styles from "./Projects.module.scss";

const Projects = () => {
  /*
  image background top 2/3,
  manual carousel at bottom listing projects 
  */
  return (
    <div
      style={{ display: "flex", flexDirection: "column" }}
      className={styles.container}
    >
      <div>Image Background</div>
      <div>Fluidity Projects</div>
      <TextButton colour="coloured">EXPLORE THE ECOSYSTEM</TextButton>
      <ManualCarousel>
        {items.map((item) => (
          <div
            style={{
              border: "1px solid white",
              height: 200,
              minWidth: 300,
              margin: 20,
              marginBottom: 50,
            }}
          >
            {item.item}
          </div>
        ))}
      </ManualCarousel>
    </div>
  );
};

export default Projects;

const items = [
  { item: "🦍" },
  { item: "🦍" },
  { item: "🦍" },
  { item: "🦍" },
  { item: "🦍" },
  { item: "🦍" },
  { item: "🦍" },
];
