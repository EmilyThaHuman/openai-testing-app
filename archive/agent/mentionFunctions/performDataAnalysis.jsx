import {
  analyzeTrends,
  calculateStatistics,
  compareDataSets,
  generatePredictions,
} from './dataAnalysis';

export const performDataAnalysis = async (data, analysisType) => {
  try {
    // Parse the data string into a usable format
    const parsedData = JSON.parse(data);

    switch (analysisType) {
      case 'statistical':
        return calculateStatistics(parsedData);
      case 'trend':
        return analyzeTrends(parsedData);
      case 'comparative':
        return compareDataSets(parsedData);
      case 'predictive':
        return generatePredictions(parsedData);
      default:
        return { error: 'Invalid analysis type' };
    }
  } catch (error) {
    console.error('Data analysis error:', error);
    return { error: 'Failed to analyze data' };
  }
};

export default performDataAnalysis;
