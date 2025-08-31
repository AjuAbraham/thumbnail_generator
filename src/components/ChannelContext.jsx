"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Book, Sparkles, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";

const ChannelContext = ({ channels, setChannels }) => {
  const [isFetchingThumbnails, setIsFetchingThumbnails] = useState(false);
  const [channelName, setChannelName] = useState("");

  const handleFetchYoutubeThumbnails = async () => {
    try {
      if (channels.length == 2) {
        alert(
          "Cannot select more than 2 channels right now pricing comming soon!!"
        );
        return;
      }
      setIsFetchingThumbnails(true);
      const response = await fetch("/api/fetch-thumbnails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelName,
        }),
      });
      const result = await response.json();

      if (result.thumbnails.length > 0) {
        const channelDetails = result.thumbnails[0];
        const newChannel = {
          id: channelDetails.channelId,
          name: channelDetails.title,
          avatar: channelDetails.avatar,
          thumbnails: result.thumbnails.slice(0, 2),
        };
        setChannels((prev) => [...prev, newChannel]);
        setChannelName("");
        setIsFetchingThumbnails(false);
      } else {
        alert("No thumbnails or channel ID found for this channel.");
      }
    } catch (error) {
      alert("Failed to fetch thumbnails. Please try again.");
    } finally {
      setIsFetchingThumbnails(false);
    }
  };

  const removeChannel = (id) => {
    setChannels((prev) => prev.filter((channel) => channel.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-80 h-fit bg-slate-800/80 backdrop-blur-md rounded-xl p-8 border border-slate-700 hover:shadow-lg hover:shadow-blue-900/20 transition-shadow duration-300"
    >
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg flex items-center justify-center mr-4">
          <Book className="h-6 w-6 text-gray-200" />
        </div>
        <h2 className="text-2xl font-bold text-gray-200">Channel Notebook</h2>
      </div>
      <p className="text-gray-400 mb-6">
        Fetch reference thumbnails from YouTube channels to inspire your image
        generation.
      </p>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          YouTube Channel Name (Optional)
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
        onClick={handleFetchYoutubeThumbnails}
        disabled={isFetchingThumbnails || channelName.length === 0}
        className="w-full bg-blue-900 hover:bg-blue-800 text-gray-200 font-medium py-3 flex items-center justify-center space-x-2"
        data-testid="button-fetch-thumbnails"
      >
        <Sparkles className="h-5 w-5" />
        <span>Fetch Thumbnails</span>
      </Button>
      <AnimatePresence>
        {isFetchingThumbnails && (
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
                Fetching thumbnails...
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
        <div className="space-y-4">
          <AnimatePresence>
            {channels.map((channel) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-slate-900 rounded-lg p-4"
                data-testid={`card-channel-${channel.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={channel.avatar}
                      alt={`${channel.name} Channel`}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-base font-medium text-gray-200">
                      {channel.name}
                    </span>
                  </div>
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={() => removeChannel(channel.id)}
                    className="text-gray-400  cursor-pointer hover:text-red-400 duration-200 h-auto p-0"
                    data-testid={`button-remove-channel-${channel.id}`}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  Reference thumbnails:
                </p>
                <div className="flex space-x-3">
                  {channel.thumbnails.map((thumb, index) => (
                    <img
                      key={index}
                      src={thumb.thumbnail}
                      alt={`Reference thumbnail ${index + 1}`}
                      className="w-24 h-14 object-cover rounded-md"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          💡 Tip: Add a YouTube channel to fetch reference thumbnails for image
          generation
        </div>
      </div>
    </motion.div>
  );
};

export default ChannelContext;
