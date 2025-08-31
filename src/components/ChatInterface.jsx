const ChatInterface = ({
  imagePrompt,
  generatedImage,
  setImagePrompt,
  handleGenerateImage,
  isGeneratingImage,
}) => {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Welcome! I see you’ve submitted an image prompt. How can I refine it for you?",
    },
  ]);
  const [input, setInput] = useState("");

  const followUpOptions = [
    "Generate in a realistic style",
    "Use a vibrant, colorful palette",
    "Apply a cinematic lighting effect",
    "Create in a cartoonish style",
  ];

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: input },
        {
          role: "ai",
          content: `Got it! I've noted your request: "${input}". Would you like to refine further?`,
        },
      ]);
      setImagePrompt((prev) => (prev ? `${prev}, ${input}` : input));
      setInput("");
    }
  };

  const handleOptionSelect = (option) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: option },
      {
        role: "ai",
        content: `Applying "${option}" to your image. Click "Generate Image" to see the result.`,
      },
    ]);
    setImagePrompt((prev) => (prev ? `${prev}, ${option}` : option));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-800/80 rounded-xl p-6 border border-slate-700">
      <div className="flex-1 overflow-y-auto space-y-4">
        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-lg p-4 mb-4 max-w-md mx-auto"
            data-testid="container-generated-image"
          >
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Generated Image
            </h3>
            <img
              src={generatedImage}
              alt="AI Generated Artwork"
              className="w-full rounded-lg"
              data-testid="img-generated-result"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">1024x1024 • PNG</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-slate-800 text-gray-300 hover:bg-blue-800 text-xs font-medium"
                  data-testid="button-save-image"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-slate-800 text-gray-300 hover:bg-blue-800 text-xs font-medium"
                  data-testid="button-share-image"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-900 text-gray-200"
                  : "bg-slate-900 text-gray-300"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        <div className="flex flex-wrap gap-2 mt-4">
          {followUpOptions.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="bg-slate-800 border-slate-700 text-gray-300 hover:bg-blue-800 hover:text-gray-200"
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Refine your image..."
          className="flex-1 bg-slate-900 border-slate-700 text-gray-200 placeholder-gray-500 focus:ring-blue-800 focus:border-blue-800"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!input.trim() || isGeneratingImage}
          className="bg-blue-900 hover:bg-blue-800 text-gray-200"
        >
          Send
        </Button>
        <Button
          onClick={handleGenerateImage}
          disabled={isGeneratingImage || !imagePrompt.trim()}
          className="bg-blue-900 hover:bg-blue-800 text-gray-200"
          data-testid="button-generate-image"
        >
          Generate Image
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
