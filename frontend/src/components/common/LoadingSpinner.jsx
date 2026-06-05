import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = false, size = 40, text = '' }) => {
  const spinner = (
    <div className="spinner-container" data-fullscreen={fullScreen}>
      <div
        className="spinner"
        style={{ width: size, height: size }}
      />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );

  return spinner;
};

export default LoadingSpinner;
