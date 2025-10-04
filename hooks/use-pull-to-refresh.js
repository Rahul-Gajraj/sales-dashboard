'use client';

import { useState, useRef, useCallback } from 'react';

const PULL_THRESHOLD = 80;
const RESISTANCE_FACTOR = 2.5;

export function usePullToRefresh(onRefresh) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (containerRef.current?.scrollTop > 0 || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;

    if (deltaY > 0) {
      e.preventDefault();
      const distance = deltaY / RESISTANCE_FACTOR;
      setPullDistance(distance);
      setIsPulling(distance > 10);
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        await onRefresh?.();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
        }, 500);
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  const refreshIndicatorStyle = {
    transform: `translateY(${Math.min(pullDistance, PULL_THRESHOLD)}px)`,
    opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
  };

  const containerStyle = {
    transform: `translateY(${Math.min(pullDistance, PULL_THRESHOLD)}px)`,
  };

  return {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    refreshIndicatorStyle,
    containerStyle,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove, 
      onTouchEnd: handleTouchEnd,
    },
  };
}