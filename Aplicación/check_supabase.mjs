import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://koxiobqhwvfkomiqxbor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveGlvYnFod3Zma29taXF4Ym9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTY5OTMsImV4cCI6MjA5MjM3Mjk5M30.SDobTZQ7EaRlNHPpEO5XjTP-QDSKMeEhgrTxCTo0-dw';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkData() {
  console.log("Consultando Supabase...");
  
  // 1. Obtener la cantidad total de filas
  const { count, error: countError } = await supabase
    .from('mediciones')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error("Error contando filas:", countError);
    return;
  }
  
  console.log(`Total de filas en la tabla 'mediciones': ${count}`);
  
  // 2. Obtener el registro más antiguo
  const { data: oldest, error: oldError } = await supabase
    .from('mediciones')
    .select('fecha_rtc')
    .order('fecha_rtc', { ascending: true })
    .limit(1);
    
  // 3. Obtener el registro más nuevo
  const { data: newest, error: newError } = await supabase
    .from('mediciones')
    .select('fecha_rtc')
    .order('fecha_rtc', { ascending: false })
    .limit(1);
    
  if (oldest && oldest.length > 0) {
    console.log(`Registro más antiguo: ${oldest[0].fecha_rtc}`);
  }
  if (newest && newest.length > 0) {
    console.log(`Registro más reciente: ${newest[0].fecha_rtc}`);
  }
}

checkData();
