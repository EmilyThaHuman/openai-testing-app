import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useDatabaseQuery(table, query = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: results, error } = await supabase
          .from(table)
          .select('*')
          .match(query);

        if (error) throw error;
        setData(results);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [table, JSON.stringify(query)]);

  return { data, loading, error };
}
