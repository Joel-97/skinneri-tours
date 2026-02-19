import "../../style/general/loading.css";

const Loading = ({ fullScreen = false }) => {
  return (
    <div className={fullScreen ? "loading-overlay" : "loading-inline"}>
      <div className="spinner"></div>
    </div>
  );
};

export default Loading;
