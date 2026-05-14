import React from "react";

import "../../styles/shared/skeleton.css";

const SkeletonTable = ({
  rows = 5
}) => {

  return (

    <div className="skeleton-table-wrapper">

      {
        [...Array(rows)].map((_, index) => (

          <div
            key={index}
            className="skeleton-table-row"
          >

            <div className="skeleton shimmer skeleton-cell-sm"></div>

            <div className="skeleton shimmer skeleton-cell-lg"></div>

            <div className="skeleton shimmer skeleton-cell-md"></div>

            <div className="skeleton shimmer skeleton-cell-sm"></div>

          </div>

        ))
      }

    </div>

  );

};

export default SkeletonTable;