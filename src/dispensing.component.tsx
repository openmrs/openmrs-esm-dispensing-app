import React from "react";
import styles from "./dispensing.scss";
import { PharmacyHeader } from "./pharmacy-header/pharmacy-header.component";
import DispensingTiles from "./dispensing-tiles/dispensing-tiles.component";
import PrescriptionTabLists from "./prescriptions/prescription-tab-lists.component";

export default function Dispensing() {
  return (
    <div className={`omrs-main-content ${styles.dispensingContainer}`}>
      <PharmacyHeader />
      <DispensingTiles />
      <PrescriptionTabLists />
    </div>
  );
}
