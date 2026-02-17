import PropTypes from 'prop-types';

const sizeMap = {
  sm: { icon: 16, text: 'text-xs' },
  md: { icon: 20, text: 'text-sm' },
};

const VerificationBadge = ({ isVerified, size = 'sm' }) => {
  if (!isVerified) return null;

  const { icon, text } = sizeMap[size] || sizeMap.sm;

  return (
    <span
      className={`inline-flex items-center gap-1 ${text}`}
      title="KalaSetu Verified Artisan"
    >
      <span
        className="inline-flex items-center justify-center rounded-full bg-green-500"
        style={{ width: icon, height: icon }}
      >
        <svg
          width={icon * 0.6}
          height={icon * 0.6}
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 6L5 9L10 3"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-green-700 font-medium">Verified</span>
    </span>
  );
};

VerificationBadge.propTypes = {
  isVerified: PropTypes.bool.isRequired,
  size: PropTypes.oneOf(['sm', 'md']),
};

export default VerificationBadge;
