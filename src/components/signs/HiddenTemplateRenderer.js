import React,
{
  forwardRef,
} from "react";

import SignCanvas  from "./SignCanvas";

const HiddenTemplateRenderer =
  forwardRef(
    (
      {
        template,
        reservation,
      },
      ref
    ) => {

      if (!template) {
        return null;
      }

      return (
        <div
          style={{
            position: "fixed",

            left: "-99999px",

            top: 0,

            zIndex: -1,
          }}
        >

          <div ref={ref}>

            <SignCanvas
              template={template}

              setTemplate={() => {}}

              signData={reservation}

              selectedLayerId={null}

              setSelectedLayerId={() => {}}
            />

          </div>

        </div>
      );
    }
  );

export default HiddenTemplateRenderer;