import React from "react";

import "../../style/general/toolbar.css";

const Toolbar = ({

  left,

  right,

  className = ""

}) => {

  return (

    <div className={`toolbar ${className}`}>

      <div className="toolbar-left">

        {left}

      </div>

      <div className="toolbar-right">

        {right}

      </div>

    </div>

  );

};

export default Toolbar;