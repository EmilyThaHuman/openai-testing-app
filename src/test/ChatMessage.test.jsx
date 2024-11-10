// src/__tests__/ChatMessage.test.jsx
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "../components/chat/ChatMessage";

describe("ChatMessage", () => {
  it("renders message content correctly", () => {
    const message = {
      role: "user",
      content: "Test message",
      timestamp: new Date().toISOString(),
    };
    render(<ChatMessage message={message} isUser={true} />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });
});
