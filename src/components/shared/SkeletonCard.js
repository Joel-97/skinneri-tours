import React from "react";

import "../../styles/shared/skeleton.css";

const SkeletonCard = ({
  height = 180
}) => {

  return (

    <div
      className="skeleton-card"
      style={{ height }}
    >

      <div className="skeleton shimmer skeleton-line-sm"></div>

      <div className="skeleton shimmer skeleton-line-lg"></div>

      <div className="skeleton shimmer skeleton-line-md"></div>

    </div>

  );

};

export default SkeletonCard;