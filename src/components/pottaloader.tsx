import React from 'react';

// Define available sizes as a type
type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

interface PottaFadingLoaderProps {
  // Size prop with predefined options
  size?: LoaderSize;
  // Custom class for additional styling or custom sizing
  className?: string;
}

const PottaLoader: React.FC<PottaFadingLoaderProps> = ({
  size = 'md',
  className = '',
}) => {
  // Map sizes to tailwind classes
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    custom: '', // No default classes for custom, rely on className prop
  };

  // Combine size classes with any additional classes
  const combinedClasses = `${
    size !== 'custom' ? sizeClasses[size] : ''
  } ${className}`.trim();

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* SVG Loader with dynamic sizing */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 26"
        className={combinedClasses} // Apply combined classes
      >
        <style>{`
          @keyframes fadePetal {
            0%, 16.67%, 100% { opacity: 0.2; }
            8.33% { opacity: 1; }
          }

          .petal {
            opacity: 0.2;
            animation-name: fadePetal;
            animation-duration: 1.5s;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
          }

          /* Delays based on CLOCKWISE visual order */
          #petal-3 { animation-delay: 0s; }
          #petal-4 { animation-delay: 0.25s; }
          #petal-6 { animation-delay: 0.5s; }
          #petal-5 { animation-delay: 0.75s; }
          #petal-1 { animation-delay: 1.0s; }
          #petal-2 { animation-delay: 1.25s; }
        `}</style>
        <g>
          {/* Paths with IDs and class */}
          <path
            id="petal-1"
            className="petal"
            fill="url(#paint0_linear_4145_1313_loader)"
            d="M2.19391 12.6003H12.3157C11.9047 13.4847 10.3656 16.2077 6.19608 18.4599C6.19608 18.479 1.52575 20.8389 0.0982461 16.7278C0.134988 16.7278 -0.746823 13.7809 2.15581 12.6016L2.19391 12.6003Z"
          ></path>
          <path
            id="petal-2"
            className="petal"
            fill="url(#paint1_linear_4145_1313_loader)"
            d="M2.19391 12.6014H12.3157C11.9047 11.717 10.3656 8.99396 6.19608 6.74185C6.19608 6.72274 1.52575 4.36281 0.0982461 8.47393C0.134988 8.47393 -0.746823 11.4208 2.15581 12.6001L2.19391 12.6014Z"
          ></path>
          <path
            id="petal-3"
            className="petal"
            fill="url(#paint2_linear_4145_1313_loader)"
            d="M16.9247 3.70434L12.4762 12.7169C11.8707 11.9648 10.1261 9.40695 9.95599 4.71165C9.93966 4.70346 9.89339 -0.484575 14.1759 0.0368222C14.1596 0.0695801 17.1683 0.570503 16.9411 3.66749L16.9247 3.70434Z"
          ></path>
          <path
            id="petal-4"
            className="petal"
            fill="url(#paint3_linear_4145_1313_loader)"
            d="M16.9245 3.70438L12.476 12.7169C13.4436 12.736 16.5408 12.5531 20.3756 9.82192C20.3919 9.83011 24.5438 6.70036 21.5159 3.63749C21.4996 3.67025 19.2665 1.59968 16.9422 3.67025L16.9245 3.70438Z"
          ></path>
          <path
            id="petal-5"
            className="petal"
            fill="url(#paint4_linear_4145_1313_loader)"
            d="M18.906 20.5665L12.4216 12.7715C12.008 13.6559 10.9098 16.5837 11.8569 21.238C11.8433 21.2503 13.0286 26.3592 17.0893 24.825C17.0661 24.7964 19.8871 23.5871 18.9304 20.5979L18.906 20.5665Z"
          ></path>
          <path
            id="petal-6"
            className="petal"
            fill="url(#paint5_linear_4145_1313_loader)"
            d="M18.9061 20.5664L12.4218 12.7714C13.3635 12.5216 16.4322 11.9634 20.8276 13.731C20.8412 13.7187 25.6408 15.8043 23.4077 19.5373C23.3846 19.5086 21.6931 22.076 18.9306 20.5965L18.9061 20.5664Z"
          ></path>
        </g>
        <defs>
          {/* Added suffix to IDs to avoid potential conflicts if multiple SVGs are on a page */}
          <linearGradient
            gradientUnits="userSpaceOnUse"
            y2="11.3511"
            x2="4.22915"
            y1="17.535"
            x1="7.81016"
            id="paint0_linear_4145_1313_loader"
          >
            <stop stopColor="#A179FC" offset="0.0011606"></stop>
            <stop stopColor="#9F7DFC" offset="0.2096"></stop>
            <stop stopColor="#9889FD" offset="0.4197"></stop>
            <stop stopColor="#8C9DFD" offset="0.6306"></stop>
            <stop stopColor="#7BB9FE" offset="0.8409"></stop>
            <stop stopColor="#6CD4FF" offset="1"></stop>
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            y2="6.05171"
            x2="6.15821"
            y1="12.6017"
            x1="6.15821"
            id="paint1_linear_4145_1313_loader"
          >
            <stop stopColor="#A179FC" offset="0.0011606"></stop>
            <stop stopColor="#9F7DFC" offset="0.2096"></stop>
            <stop stopColor="#9889FD" offset="0.4197"></stop>
            <stop stopColor="#8C9DFD" offset="0.6306"></stop>
            <stop stopColor="#7BB9FE" offset="0.8409"></stop>
            <stop stopColor="#6CD4FF" offset="1"></stop>
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            y2="6.35937"
            x2="16.9532"
            y1="6.35937"
            x1="9.95384"
            id="paint2_linear_4145_1313_loader"
          >
            <stop stopColor="#FF600A" offset="0.0011606"></stop>
            <stop stopColor="#FDB805" offset="1"></stop>
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            y2="7.73397"
            x2="22.621"
            y1="7.73397"
            x1="12.476"
            id="paint3_linear_4145_1313_loader"
          >
            <stop stopColor="#FF600A" offset="0.0011606"></stop>
            <stop stopColor="#FDB805" offset="1"></stop>
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            y2="18.9416"
            x2="19.1282"
            y1="18.9416"
            x1="11.4825"
            id="paint4_linear_4145_1313_loader"
          >
            <stop stopColor="#269E3C" offset="0.0011606"></stop>
            <stop stopColor="#2FA23B" offset="0.1223"></stop>
            <stop stopColor="#49AD37" offset="0.3235"></stop>
            <stop stopColor="#72BE31" offset="0.5798"></stop>
            <stop stopColor="#ABD529" offset="0.8783"></stop>
            <stop stopColor="#C4E025" offset="1"></stop>
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            y2="16.7709"
            x2="24.0007"
            y1="16.7709"
            x1="12.4221"
            id="paint5_linear_4145_1313_loader"
          >
            <stop stopColor="#269E3C" offset="0.0011606"></stop>
            <stop stopColor="#2FA23B" offset="0.1223"></stop>
            <stop stopColor="#49AD37" offset="0.3235"></stop>
            <stop stopColor="#72BE31" offset="0.5798"></stop>
            <stop stopColor="#ABD529" offset="0.8783"></stop>
            <stop stopColor="#C4E025" offset="1"></stop>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default PottaLoader;
