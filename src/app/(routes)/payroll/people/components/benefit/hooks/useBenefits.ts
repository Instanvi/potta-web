'use client';
import { useState, useEffect } from 'react';
import axios from 'config/axios.config';

// Define benefit type
interface Benefit {
  uuid: string;
  name: string;
  type: string;
  rate: string;
  provider: string;
}

export const useBenefits = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBenefits = async () => {
      setLoading(true);
      try {
        // Try with POST method instead of GET, and use the correct endpoint
        const response = await axios.post('/benefits/filter', {
          page: 1,
          limit: 50,
          sortBy: ['createdAt:DESC'],
        });

        if (response.data && response.data.data) {
          setBenefits(response.data.data);
        } else {
        }
      } catch (err) {
        console.error('Error fetching benefits:', err);
        setError(
          err instanceof Error ? err : new Error('Failed to fetch benefits')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBenefits();
  }, []);

  return { benefits, loading, error };
};
