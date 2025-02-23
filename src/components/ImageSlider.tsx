import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "FIRE SOULS",
    subtitle: "PREPARE TO CRY",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&h=900&fit=crop"
  },
  {
    id: 2,
    title: "CYBER REALM",
    subtitle: "ENTER THE MATRIX",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&h=900&fit=crop"
  },
  {
    id: 3,
    title: "NEON WARRIORS",
    subtitle: "FIGHT FOR GLORY",
    image: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=1600&h=900&fit=crop"
  }
];

const ImageSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isAnimating, setIsAnimating] = useState(false);

  const getSlideClassName = (index: number) => {
    if (index === currentSlide) return 'slider-slide slide-active';
    if (direction === 'right') {
      return index === (currentSlide + 1) % slides.length
        ? 'slider-slide slide-next'
        : 'slider-slide slide-prev';
    }
    return index === (currentSlide - 1 + slides.length) % slides.length
      ? 'slider-slide slide-prev'
      : 'slider-slide slide-next';
  };

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('right');
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('left');
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="slider-container">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={getSlideClassName(index)}
          style={{
            transform: `translateX(${index === currentSlide ? '0%' : 
              direction === 'right' ? '100%' : '-100%'})`
          }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="slide-image"
            style={{
              transform: `scale(${index === currentSlide ? '1.05' : '1'})`,
              transition: 'transform 7s ease-out'
            }}
          />
          <div className="slide-overlay" />
          <div className="slide-content">
            <h2 className="slide-title">{slide.title}</h2>
            <p className="slide-subtitle">{slide.subtitle}</p>
          </div>
        </div>
      ))}
      
      <div className="slider-controls">
        <button
          onClick={prevSlide}
          className="slider-button"
          disabled={isAnimating}
        >
          <ChevronLeft size={24} />
        </button>
        <div className="slider-dots">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`slider-dot ${index === currentSlide ? 'dot-active' : ''}`}
              onClick={() => {
                if (isAnimating || index === currentSlide) return;
                setIsAnimating(true);
                setDirection(index > currentSlide ? 'right' : 'left');
                setCurrentSlide(index);
                setTimeout(() => setIsAnimating(false), 700);
              }}
            />
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="slider-button"
          disabled={isAnimating}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default ImageSlider;