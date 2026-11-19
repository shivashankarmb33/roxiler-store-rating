import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  rating = 0,
  maxStars = 5,
  interactive = false,
  onChange = () => {},
  size = 'md',
  showScore = false,
  totalReviews = null
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const currentDisplay = hoverRating || rating;

  return (
    <div className="flex items-center gap-1.5 select-none">
      <div className="flex items-center">
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= currentDisplay;
          const isPartiallyFilled = !isFilled && starValue - 0.5 <= currentDisplay;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`p-0.5 transition-all duration-150 ${
                interactive
                  ? 'cursor-pointer hover:scale-110 active:scale-95 focus:outline-none'
                  : 'cursor-default'
              }`}
              title={interactive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : `${rating} out of ${maxStars}`}
            >
              <Star
                className={`${starSizes[size]} transition-colors duration-150 ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isPartiallyFilled
                    ? 'fill-amber-200 text-amber-400'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-sm font-semibold text-slate-700 ml-1">
          {rating ? Number(rating).toFixed(1) : '0.0'}
        </span>
      )}

      {totalReviews !== null && (
        <span className="text-xs text-slate-500 font-normal">
          ({totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  );
};

