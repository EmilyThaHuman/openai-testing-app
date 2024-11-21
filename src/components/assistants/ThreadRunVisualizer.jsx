import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

const ThreadRunVisualizer = () => {
  const [events, setEvents] = useState([]);
  const [messageContent, setMessageContent] = useState('');

  // Function to handle incoming SSE events
  const handleStreamEvent = event => {
    try {
      if (event === '[DONE]') {
        // Handle stream completion
        return;
      }

      const data = JSON.parse(event);
      setEvents(prev => [...prev, data]);

      // Handle message deltas
      if (data.object === 'thread.message.delta') {
        setMessageContent(
          prev => prev + (data.delta.content[0]?.text?.value || '')
        );
      }
    } catch (error) {
      console.error('Error parsing event:', error);
    }
  };

  const getEventIcon = status => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" />;
      case 'in_progress':
        return <Clock className="text-blue-500 animate-spin" />;
      case 'queued':
        return <Clock className="text-gray-500" />;
      default:
        return <AlertCircle className="text-yellow-500" />;
    }
  };

  const getEventColor = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 border-blue-200';
      case 'queued':
        return 'bg-gray-100 border-gray-200';
      default:
        return 'bg-yellow-100 border-yellow-200';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="space-y-4">
        {/* Timeline */}
        <div className="relative">
          {events.map((event, index) => (
            <div key={index} className="flex items-start mb-4">
              <div className="flex-shrink-0 w-8">
                {getEventIcon(event.status)}
              </div>
              <div
                className={`flex-grow ml-4 p-4 rounded-lg border ${getEventColor(event.status)}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">{event.object}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(event.created_at * 1000).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-2">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(event, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Content Preview */}
        {messageContent && (
          <div className="mt-6 p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2">Assistant Message</h3>
            <div className="prose max-w-none">{messageContent}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadRunVisualizer;
