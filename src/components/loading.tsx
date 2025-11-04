import "./Loading.css";

type LoadingProps = {
  text?: string;
  children?: React.ReactNode;
  size?: number;
  className?: string;
};

const Loading = ({ text, children, size, className }: LoadingProps) => {
  return (
    <div
      className={`flex items-center justify-center flex-col w-full h-full ${
        className || ""
      }`}>
      <div className={`showbox scale-${size ? size * 10 : 50}`}>
        <div className="loader">
          <svg className="circular" viewBox="25 25 50 50">
            <circle
              className="path"
              cx="50"
              cy="50"
              r="20"
              fill="none"
              strokeWidth="2"
              strokeMiterlimit="10"
            />
          </svg>
        </div>
      </div>
      <p className="text-lg font-bold">Loading...</p>
      <p className="text-sm text-muted-foreground mb-4">{text}</p>
      <div>{children}</div>
    </div>
  );
};

export default Loading;
