/*
==========================================================
CLIENT PREVIEW
==========================================================
*/

import { useEffect, useState } from "react";

import "./ClientPreview.css";

import ClientPreviewHeader from "./sections/ClientPreviewHeader";
import ClientInfoCard from "./sections/ClientInfoCard";
import ClientServicesCard from "./sections/ClientServicesCard";
import ClientStatsCard from "./sections/ClientStatsCard";
import ClientActivityModal from "../ClientActivityModal/ClientActivityModal";

const ClientPreview = ({

  profile,

  onClose

}) => {

  /*
  ==========================================================
  CONTENT ANIMATION
  ==========================================================

  Controls the transition when the selected
  client changes.

  The panel remains fixed and only the content
  is animated.
  */

  const [

    animate,

    setAnimate

  ] = useState(false);

  /*
  ==========================================================
  ACTIVITY MODAL
  ==========================================================
  */

  const [

    showActivityModal,

    setShowActivityModal

  ] = useState(false);

  /*
  ==========================================================
  PROFILE
  ==========================================================

  The preview now works with a complete
  client profile instead of only the client
  document.

  This allows the CRM to progressively
  incorporate activity, statistics,
  financial summaries and any future
  information without changing the
  component architecture.
  */

  const client = profile?.client;

  const activity = profile?.activity || [];

  const stats = profile?.stats;

  const financialSummary = profile?.financialSummary || [];

  /*
  ==========================================================
  CLIENT CHANGE
  ==========================================================

  Every time the selected client changes,
  play a short animation.

  Later this logic will evolve into a
  fade-out → change content → fade-in
  transition.
  */

  useEffect(() => {

    if (!client) return;

    setAnimate(true);

    const timer = setTimeout(() => {

      setAnimate(false);

    }, 180);

    return () => clearTimeout(timer);

  }, [client]);

  /*
  ==========================================================
  ACTIVITY MODAL
  ==========================================================
  */

  const handleOpenActivityModal = () => {

    setShowActivityModal(true);

  };

  const handleCloseActivityModal = () => {

    setShowActivityModal(false);

  };

  /*
  ==========================================================
  NO CLIENT SELECTED
  ==========================================================
  */

  if (!profile || !client) {

    return null;

  }

  return (

    <aside className="client-preview">

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div
        className={`client-preview-content ${
          animate ? "changing" : ""
        }`}
      >

        {/* ======================================================
            HEADER
        ====================================================== */}

        <ClientPreviewHeader

          client={client}

          onClose={onClose}

        />

        {/* ======================================================
            CLIENT INFORMATION
        ====================================================== */}

        <ClientInfoCard

          client={client}

        />

        {/* ======================================================
            RECENT ACTIVITY
        ====================================================== */}

        <ClientServicesCard

          activity={activity}

          onViewHistory={handleOpenActivityModal}

        />

        {/* ======================================================
            STATISTICS
        ====================================================== */}

        {/* <ClientStatsCard

          client={client}

          stats={stats}

          financialSummary={financialSummary}

        /> */}

        {/* ======================================================
            ACTIVITY MODAL
        ====================================================== */}

        <ClientActivityModal

          isOpen={showActivityModal}

          profile={profile}

          onClose={handleCloseActivityModal}

        />

      </div>

    </aside>

  );

};

export default ClientPreview;