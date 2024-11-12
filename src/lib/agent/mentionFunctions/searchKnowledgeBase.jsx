export const searchKnowledgeBase = async (query, category = 'general') => {
  console.log('Searching knowledge base for:', query, 'in category:', category);
  // Simulated knowledge base search
  const knowledgeBase = {
    technical: [
      {
        id: 1,
        title: 'API Documentation',
        content: 'Technical details about API endpoints...',
      },
      {
        id: 2,
        title: 'Integration Guide',
        content: 'Step-by-step integration instructions...',
      },
    ],
    product: [
      {
        id: 3,
        title: 'Feature Overview',
        content: 'Product features and capabilities...',
      },
      {
        id: 4,
        title: 'Pricing Plans',
        content: 'Available pricing tiers and features...',
      },
    ],
    support: [
      {
        id: 5,
        title: 'FAQ',
        content: 'Frequently asked questions and answers...',
      },
      {
        id: 6,
        title: 'Troubleshooting',
        content: 'Common issues and solutions...',
      },
    ],
    general: [
      {
        id: 7,
        title: 'About Us',
        content: 'Company information and mission...',
      },
      { id: 8, title: 'Contact', content: 'Ways to reach our team...' },
    ],
  };

  return knowledgeBase[category].filter(
    item =>
      item.title.toLowerCase().includes(query?.query?.toLowerCase()) ||
      item.content.toLowerCase().includes(query?.query?.toLowerCase())
  );
};

export default searchKnowledgeBase;
