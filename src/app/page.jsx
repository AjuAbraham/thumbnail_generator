"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Wand2, Upload, Download } from "lucide-react";
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
import PrefrencesDialog from "@/components/PrefrencesDialog";

export default function Home() {
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [channels, setChannels] = useState([]);
  const [generatedImage, setGeneratedImage] = useState({});
  // const [generatedImage, setGeneratedImage] = useState({
  //   filePath:
  //     "/thumbnails/gaming/thumbnail_gaming_1756628967637_0_sw2TnnbC2.png",
  //   originalUrl:
  //     "https://ik.imagekit.io/2kdc1l5yt/thumbnails/gaming/thumbnail_gaming_1756628967637_0_sw2TnnbC2.png",
  //   transformedUrls: [
  //     {
  //       aspectRatio: "16:9",
  //       url: "https://ik.imagekit.io/2kdc1l5yt/tr:w-1280,h-720,ar-16-9,cm-force,q-90/thumbnails/gaming/thumbnail_gaming_1756628967637_0_sw2TnnbC2.png",
  //     },
  //     {
  //       aspectRatio: "4:3",
  //       url: "https://ik.imagekit.io/2kdc1l5yt/tr:w-1024,h-768,ar-4-3,cm-force,q-90/thumbnails/gaming/thumbnail_gaming_1756628967637_0_sw2TnnbC2.png",
  //     },
  //     {
  //       aspectRatio: "1:1",
  //       url: "https://ik.imagekit.io/2kdc1l5yt/tr:w-1080,h-1080,ar-1-1,cm-force,q-90/thumbnails/gaming/thumbnail_gaming_1756628967637_0_sw2TnnbC2.png",
  //     },
  //     {
  //       aspectRatio: "9:16",
  //       url: "https://ik.imagekit.io/2kdc1l5yt/tr:w-720,h-1280,ar-9-16,cm-force,q-90/thumbnails/gaming/thumbnail_gaming_1756628967637_0_sw2TnnbC2.png",
  //     },
  //   ],
  //   metadata: {
  //     genre: "gaming",
  //     textContent: null,
  //     requestedAspectRatio: "all",
  //   },
  // });
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [thumbnailPreferences, setThumbnailPreferences] = useState({
    aspectRatio: "16:9",
    genre: "general",
    includeText: false,
    textContent: "",
  });
  const abortController = new AbortController();
  const isImagesGenerated = Object.keys(generatedImage).length > 0;
  const handleGenerateImage = async () => {
    if (previewUrl && imagePrompt.trim()) {
      setShowPreferencesDialog(true);
    } else {
      alert("Please upload an image and provide a description.");
    }
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
      setPreviewUrl(uploadResponse.url);
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
  const handleDownload = (url, fileName) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <ChannelContext channels={channels} setChannels={setChannels} />

              {/*  Image Lab Card */}

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
                    Image Lab
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
                  disabled={isGeneratingImage}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-gray-200 font-medium py-3 flex items-center justify-center space-x-2"
                  data-testid="button-generate-image"
                >
                  {isGeneratingImage ? (
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full"
                      />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      <span>Generate Image</span>
                    </>
                  )}
                </Button>
                <AnimatePresence>
                  {!isImagesGenerated && isGeneratingImage ? (
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
                  ) : (
                    generatedImage.transformedUrls &&
                    generatedImage.transformedUrls.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6"
                      >
                        <h3 className="text-xl font-bold text-gray-200 mb-4">
                          Generated Images
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {generatedImage.transformedUrls.map((item, index) => (
                            <motion.div
                              key={index}
                              className="relative group bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-900/30 transition-shadow duration-300"
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <div
                                onClick={() =>
                                  handleDownload(
                                    item.url,
                                    `generated_image_${
                                      item.aspectRatio
                                        ? item.aspectRatio.replace(":", "x")
                                        : index
                                    }.jpg`
                                  )
                                }
                                className="block cursor-pointer"
                              >
                                <img
                                  src={item.url}
                                  alt={`Generated image ${index + 1}`}
                                  className="w-full h-48 object-cover rounded-t-lg"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                  <div className="flex flex-col items-center text-white">
                                    <Download className="h-8 w-8 mb-2" />
                                    <span className="text-sm font-medium">
                                      Download {item.aspectRatio}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {item.aspectRatio && (
                                <p className="absolute bottom-2 left-2 text-sm font-medium text-gray-200 bg-slate-900/70 px-2 py-1 rounded">
                                  {item.aspectRatio}
                                </p>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Preferences Dialog */}
        <PrefrencesDialog
          isGeneratingImage={isGeneratingImage}
          setGeneratedImage={setGeneratedImage}
          setIsGeneratingImage={setIsGeneratingImage}
          setShowPreferencesDialog={setShowPreferencesDialog}
          showPreferencesDialog={showPreferencesDialog}
          thumbnailPreferences={thumbnailPreferences}
          setThumbnailPreferences={setThumbnailPreferences}
          previewUrl={previewUrl}
          imagePrompt={imagePrompt}
          channels={channels}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
