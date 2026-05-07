import React from "react";

import "../../style/settings/template/templatesList.css";

const TemplatesList = ({
  templates,

  onSelectTemplate,
}) => {

  return (
    <div className="templates-list">

      <div className="templates-list-title">
        Plantillas Guardadas
      </div>

      <div className="templates-list-items">

        {templates.map((template) => (

          <button
            key={template.id}

            className="templates-list-item"

            onClick={() =>
              onSelectTemplate(template)
            }
          >
            {template.name}
          </button>

        ))}

      </div>

    </div>
  );
};

export default TemplatesList;