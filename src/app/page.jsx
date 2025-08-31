"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Wand2, Upload } from "lucide-react";
import { authenticator } from "@/lib/imageKitUpload.utility";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import ChatInterface from "@/components/ChatInterface";
import ChannelContext from "@/components/ChannelContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function Home() {
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortController = new AbortController();

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setShowChatInterface(true);
    setTimeout(() => {
      setIsGeneratingImage(false);
      setGeneratedImage(
        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
      );
    }, 3200);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect({ target: { files } });
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    try {
      let authParams = await authenticator();
      const { signature, expire, token, publicKey } = authParams;
      const uploadResponse = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name,
        overwriteFile: true,
        onProgress: (event) => {
          setProgress(Math.round((event.loaded / event.total) * 100));
        },
        abortSignal: abortController.signal,
      });
      setSelectedFile(null);
      setPreviewUrl(uploadResponse.url); // Use uploaded image URL
    } catch (error) {
      if (error instanceof ImageKitAbortError) {
        console.error("Upload aborted:", error.reason);
      } else if (error instanceof ImageKitInvalidRequestError) {
        console.error("Invalid request:", error.message);
      } else if (error instanceof ImageKitUploadNetworkError) {
        console.error("Network error:", error.message);
      } else if (error instanceof ImageKitServerError) {
        console.error("Server error:", error.message);
      } else {
        console.error("Upload error:", error);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200">
      {/* Navbar */}
      <NavBar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-8"
          >
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 bg-clip-text text-transparent">
                AI-Powered Content Studio
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Generate embeddings from your channels and create stunning
                images with our advanced AI tools. Transform your content
                creation workflow today.
              </p>
            </motion.div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 mb-12">
              {/* Channel Notebook Card */}
              <ChannelContext />

              {/* Banana Image Lab Card */}
              {!showChatInterface ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex-1 bg-slate-800/80 backdrop-blur-md rounded-xl p-8 border border-slate-700 hover:shadow-lg hover:shadow-blue-900/20 transition-shadow duration-300"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg flex items-center justify-center mr-4">
                      <Palette className="h-6 w-6 text-gray-200" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-200">
                      Banana Image Lab
                    </h2>
                  </div>
                  <p className="text-gray-400 mb-6">
                    Create stunning AI-generated images from your descriptions.
                    Upload reference images for enhanced results.
                  </p>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Describe your image
                    </label>
                    <div className="relative">
                      <Textarea
                        placeholder="A majestic golden retriever sitting in a field of sunflowers during golden hour..."
                        rows={3}
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        maxLength={500}
                        className="w-full bg-slate-900 border-slate-700 text-gray-200 placeholder-gray-500 focus:ring-blue-800 focus:border-blue-800 resize-none"
                        data-testid="textarea-image-prompt"
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                        <span data-testid="text-prompt-length">
                          {imagePrompt.length}
                        </span>
                        /500
                      </div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reference Image (Optional)
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
                        dragOver
                          ? "border-blue-800 bg-blue-800/10"
                          : "border-slate-700"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() =>
                        document.getElementById("file-input")?.click()
                      }
                      data-testid="dropzone-file-upload"
                    >
                      {previewUrl ? (
                        <div className="relative flex justify-center">
                          <img
                            src={previewUrl}
                            alt="Uploaded preview"
                            className="max-h-48 rounded-lg"
                          />
                          {isUploading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="w-8 h-8 border-2 border-blue-800 border-t-transparent rounded-full"
                              />
                              <span className="text-sm text-gray-200 mt-2">
                                Uploading {progress}%
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-sm font-medium text-gray-300 mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, WEBP up to 10MB
                          </p>
                        </div>
                      )}
                      <input
                        id="file-input"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                        data-testid="input-file-upload"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-gray-200 font-medium py-3 flex items-center justify-center space-x-2"
                    data-testid="button-generate-image"
                  >
                    <Wand2 className="h-5 w-5" />
                    <span>Generate Image</span>
                  </Button>
                  <AnimatePresence>
                    {isGeneratingImage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-900 rounded-lg p-4 mt-6"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                                className="w-2 h-2 bg-blue-800 rounded-full"
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-300">
                            Creating your masterpiece...
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-900 to-blue-800 h-2 rounded-full animate-pulse"></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="chat-interface"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <ChatInterface
                    imagePrompt={imagePrompt}
                    generatedImage={generatedImage}
                    setImagePrompt={setImagePrompt}
                    handleGenerateImage={handleGenerateImage}
                    isGeneratingImage={isGeneratingImage}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
