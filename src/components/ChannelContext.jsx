import { AnimatePresence, motion } from "framer-motion";
import { Book, Sparkles, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
const ChannelContext = ({}) => {
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channels, setChannels] = useState([
    {
      id: "1",
      name: "TechTalk AI",
      avatar:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&w=32&h=32&fit=crop&crop=face",
    },
    {
      id: "2",
      name: "Science Daily",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=32&h=32&fit=crop&crop=face",
    },
  ]);
  const handleGenerateEmbeddings = async () => {
    setIsGeneratingEmbeddings(true);
    setTimeout(() => {
      setIsGeneratingEmbeddings(false);
      if (channelName.trim()) {
        const newChannel = {
          id: Date.now().toString(),
          name: channelName,
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=32&h=32&fit=crop&crop=face",
        };
        setChannels((prev) => [...prev, newChannel]);
        setChannelName("");
      }
    }, 3000);
  };
  const removeChannel = (id) => {
    setChannels((prev) => prev.filter((channel) => channel.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-80 bg-slate-800/80 backdrop-blur-md rounded-xl p-8 border border-slate-700 hover:shadow-lg hover:shadow-blue-900/20 transition-shadow duration-300"
    >
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg flex items-center justify-center mr-4">
          <Book className="h-6 w-6 text-gray-200" />
        </div>
        <h2 className="text-2xl font-bold text-gray-200">Channel Notebook</h2>
      </div>
      <p className="text-gray-400 mb-6">
        Transform your channel content into intelligent embeddings for enhanced
        searchability and insights.
      </p>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Channel Name (Optional)
        </label>
        <Input
          type="text"
          placeholder="Enter channel name..."
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          className="w-full bg-slate-900 border-slate-700 text-gray-200 placeholder-gray-500 focus:ring-blue-800 focus:border-blue-800"
          data-testid="input-channel-name"
        />
      </div>
      <Button
        onClick={handleGenerateEmbeddings}
        disabled={isGeneratingEmbeddings}
        className="w-full bg-blue-900 hover:bg-blue-800 text-gray-200 font-medium py-3 flex items-center justify-center space-x-2"
        data-testid="button-generate-embeddings"
      >
        <Sparkles className="h-5 w-5" />
        <span>Generate Embeddings</span>
      </Button>
      <AnimatePresence>
        {isGeneratingEmbeddings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900 rounded-lg p-4 mt-6"
          >
            <div className="flex items-center space-x-3 mb-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-6 h-6 border-2 border-blue-800 border-t-transparent rounded-full"
              />
              <span className="text-sm font-medium text-gray-300">
                Processing embeddings...
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-slate-700 rounded animate-pulse"></div>
              <div className="h-2 bg-slate-700 rounded animate-pulse w-3/4"></div>
              <div className="h-2 bg-slate-700 rounded animate-pulse w-1/2"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-3 mt-6">
        <h3 className="text-sm font-medium text-gray-400">Active Channels</h3>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {channels.map((channel) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-2 bg-slate-900 rounded-full px-3 py-2"
                data-testid={`badge-channel-${channel.id}`}
              >
                <img
                  src={channel.avatar}
                  alt={`${channel.name} Channel`}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium text-gray-300">
                  {channel.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeChannel(channel.id)}
                  className="text-gray-400 hover:text-red-400 duration-200 h-auto p-0"
                  data-testid={`button-remove-channel-${channel.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          💡 Tip: Upload your channel data to generate intelligent embeddings
        </div>
      </div>
    </motion.div>
  );
};

export default ChannelContext;
