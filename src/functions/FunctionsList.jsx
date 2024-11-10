import { Code } from "lucide-react";
import PropTypes from 'prop-types';

export const FunctionsList = ({ functions }) => {
  if (functions.length === 0) return null;

  return (
    <div className="space-y-2">
      {functions.map((func) => (
        <div key={func} className="flex items-center gap-2 bg-gray-100 rounded p-2">
          <Code className="h-4 w-4" />
          <span className="text-sm font-mono">{func}</span>
        </div>
      ))}
    </div>
  );
};

FunctionsList.propTypes = {
  functions: PropTypes.arrayOf(PropTypes.string).isRequired
};