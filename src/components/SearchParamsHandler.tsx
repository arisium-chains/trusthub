'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchParamsHandlerProps {
  onSearchQueryChange: (query: string) => void;
}

export function SearchParamsHandler({ onSearchQueryChange }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      const query = searchParams.get('q') || '';
      onSearchQueryChange(query);
    }
  }, [searchParams, onSearchQueryChange]);

  return null;
}