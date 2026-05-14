import React from "react";

import "../../styles/shared/skeleton.css";

const SkeletonChart = ({
  height = 320
}) => {

  return (

    <div
      className="skeleton-chart-wrapper"
      style={{ height }}
    >

      <div className="skeleton shimmer skeleton-chart-area"></div>

    </div>

  );

};

export default SkeletonChart;