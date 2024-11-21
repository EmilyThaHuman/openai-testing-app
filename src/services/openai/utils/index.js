export const logOpenAIEvent = async (event, data) => {
  const timestamp = new Date().toISOString();
  console.log('\n-----------------------------------');
  console.log(`${timestamp} | ${event}`);
  console.log('-----------------------------------');
  console.log(JSON.stringify(data, null, 2));
  console.log('-----------------------------------\n');
};
