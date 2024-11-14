import { supabase } from './supabaseClient';

// Enhanced database utility functions
export const databaseUtils = {
  async insert(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) throw error;
    return result;
  },

  async get(table, query = {}) {
    const { data, error } = await supabase.from(table).select('*').match(query);

    if (error) throw error;
    return data;
  },

  async update(table, id, updates) {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  },

  async delete(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) throw error;
    return true;
  },

  // Real-time subscriptions
  subscribeToTable(table, callback) {
    return supabase
      .from(table)
      .on('*', payload => {
        callback(payload);
      })
      .subscribe();
  },
};
