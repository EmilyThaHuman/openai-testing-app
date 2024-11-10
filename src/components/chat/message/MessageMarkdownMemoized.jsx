import { memo } from "react";
import ReactMarkdown from "react-markdown";
import PropTypes from "prop-types";

// Create memoized version of ReactMarkdown that only updates when content or className changes
export const MessageMarkdownMemoized = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);

// Optional: Add PropTypes for runtime validation
MessageMarkdownMemoized.propTypes = {
  children: PropTypes.string,
  className: PropTypes.string,
  // You can add other ReactMarkdown props here if needed
  remarkPlugins: PropTypes.arrayOf(PropTypes.func),
  rehypePlugins: PropTypes.arrayOf(PropTypes.func),
  components: PropTypes.object,
};

export default { MessageMarkdownMemoized };
