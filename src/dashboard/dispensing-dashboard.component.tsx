import React from "react";
import Overlay from "../forms/overlay/overlay.component";
import { PharmacyHeader } from "../pharmacy-header/pharmacy-header.component";
import PrescriptionTabLists from "../prescriptions/prescription-tab-lists.component";

export default function DispensingDashboard() {
  return (
    <div className={`omrs-main-content`}>
      <PharmacyHeader />
      {/* <DispensingTiles /> */}
      <PrescriptionTabLists />
      <Overlay />
    </div>
  );
}
