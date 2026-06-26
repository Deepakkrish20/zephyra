

export const Skeleton = ({
  variant = 'text', // 'text' | 'rect' | 'circle'
  width,
  height,
  className = '',
  ...props
}) => {
  const baseClass = 'bg-app-bg-secondary dark:bg-zinc-800/60 animate-pulse rounded-lg';

  const variants = {
    text: 'h-4 w-full my-1.5',
    rect: 'w-full h-24',
    circle: 'rounded-full',
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseClass} ${variants[variant]} ${className}`}
      style={style}
      {...props}
    />
  );
};

export const TableSkeleton = ({ rows = 4, cols = 4 }) => {
  return (
    <div className="w-full space-y-4 py-4 animate-fadeIn">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex space-x-4 items-center justify-between">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} variant="text" className="h-5" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="border border-app-border rounded-xl p-5 bg-app-bg-primary space-y-4 shadow-sm animate-fadeIn">
      <Skeleton variant="rect" className="h-44 rounded-lg" />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-3/4 h-5" />
        <Skeleton variant="text" className="w-1/2 h-4" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" className="w-1/4 h-5" />
        <Skeleton variant="circle" className="w-8 h-8" />
      </div>
    </div>
  );
};

export default Skeleton;
