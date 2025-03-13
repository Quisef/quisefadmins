// components/LoadingSpinner.tsx
import Image from 'next/image';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="animate-bounce">
        <Image
          src={"/images/log.png"} // Replace with your actual logo path
          alt="Loading"
          width={264}
          height={264}
          className="object-contain"
          onError={() => console.error('Failed to load logo')}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;