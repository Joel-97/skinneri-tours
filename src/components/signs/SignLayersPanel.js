import React from "react";

const buttonStyle = {
  border: "none",
  background: "#e5e7eb",

  padding: "4px 8px",

  borderRadius: "6px",

  cursor: "pointer",

  fontSize: "12px",

  fontWeight: 600,
};

const SignLayersPanel = ({
  layers,
  selectedLayerId,
  setSelectedLayerId,

  onDeleteLayer,
  onDuplicateLayer,

  onMoveLayerUp,
  onMoveLayerDown,
}) => {

  return (
    <div
      style={{
        width: "320px",

        background: "#fff",

        borderLeft: "1px solid #ddd",

        padding: "20px",

        display: "flex",

        flexDirection: "column",

        gap: "12px",
      }}
    >

      <div>
        <h3>Capas</h3>
      </div>

      {layers
        .slice()
        .reverse()
        .map((layer, reverseIndex) => {

          const actualIndex =
            layers.length - 1 - reverseIndex;

          const isSelected =
            selectedLayerId === layer.id;

          return (
            <div
              key={layer.id}

              onClick={() =>
                setSelectedLayerId(layer.id)
              }

              style={{
                border: isSelected
                  ? "2px solid #2563eb"
                  : "1px solid #ddd",

                borderRadius: "10px",

                padding: "12px",

                cursor: "pointer",

                background: isSelected
                  ? "#eff6ff"
                  : "#fff",

                display: "flex",

                flexDirection: "column",

                gap: "10px",
              }}
            >

              {/* TITLE */}
              <div
                style={{
                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",
                }}
              >

                <strong>
                    {layer.type === "text" && "T"}

                    {layer.type === "shape" && "S"}

                    {layer.type === "image" && "IMG"}

                    {" "}

                    {layer.type === "text"
                        ? layer.text
                        : layer.type === "shape"
                        ? "Shape"
                        : "Image"}
                </strong>

              </div>

              {/* ACTIONS */}
              <div
                style={{
                  display: "flex",

                  flexWrap: "wrap",

                  gap: "6px",
                }}
              >

                <button
                  style={buttonStyle}

                  onClick={(e) => {
                    e.stopPropagation();

                    onDuplicateLayer(layer);
                  }}
                >
                  Duplicate
                </button>

                <button
                  style={buttonStyle}

                  onClick={(e) => {
                    e.stopPropagation();

                    onDeleteLayer(layer.id);
                  }}
                >
                  Delete
                </button>

                <button
                  style={buttonStyle}

                  onClick={(e) => {
                    e.stopPropagation();

                    onMoveLayerUp(actualIndex);
                  }}
                >
                  ↑
                </button>

                <button
                  style={buttonStyle}

                  onClick={(e) => {
                    e.stopPropagation();

                    onMoveLayerDown(actualIndex);
                  }}
                >
                  ↓
                </button>

              </div>

            </div>
          );
        })}

    </div>
  );
};

export default SignLayersPanel;