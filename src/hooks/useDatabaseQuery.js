import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

export function useDatabaseQuery(table, query = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial data fetch
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

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setData(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => item.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => prev.map(item => 
            item.id === payload.new.id ? payload.new : item
          ));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);

  return { data, loading, error };
}
