// Mock for groq-sdk
const mockChatCompletions = {
  create: jest.fn(),
}

const mockGroq = jest.fn().mockImplementation(() => ({
  chat: {
    completions: mockChatCompletions,
  },
}))

export default mockGroq
export { mockChatCompletions }
