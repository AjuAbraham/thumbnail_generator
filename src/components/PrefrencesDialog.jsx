import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
const PrefrencesDialog = ({
  showPreferencesDialog,
  setShowPreferencesDialog,
  thumbnailPreferences,
  isGeneratingImage,
  setThumbnailPreferences,
  setIsGeneratingImage,
  setGeneratedImage,
  previewUrl,
  imagePrompt,
  channels = [],
}) => {
  const submitPreferences = async () => {
    try {
      setShowPreferencesDialog(false);
      setIsGeneratingImage(true);
      let thumbnailUrls = [];
      if (channels.length > 0) {
        thumbnailUrls = channels.flatMap((ch) =>
          ch.thumbnails.map((t) => t.thumbnail)
        );
      }
      const response = await fetch("/api/thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: previewUrl,
          userQuery: imagePrompt,
          channels: thumbnailUrls,
          ...thumbnailPreferences,
        }),
      });
      const result = await response.json();

      const uploadedImages = result.uploadedImages;
      if (uploadedImages?.length > 0) {
        setGeneratedImage(uploadedImages[0]);
        setIsGeneratingImage(false);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };
  // Handle changes in the preferences form
  const handlePreferencesChange = (name, value) => {
    setThumbnailPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <Dialog
      open={showPreferencesDialog}
      onOpenChange={setShowPreferencesDialog}
    >
      <DialogContent className="sm:max-w-[425px] bg-slate-800 text-gray-200 border-slate-700">
        <DialogHeader>
          <DialogTitle>Thumbnail Preferences</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-300">
              Thumbnail Aspect Ratio
            </label>
            <Select
              name="aspectRatio"
              value={thumbnailPreferences.aspectRatio}
              onValueChange={(value) =>
                handlePreferencesChange("aspectRatio", value)
              }
            >
              <SelectTrigger className="bg-slate-900 border-slate-700 text-gray-200">
                <SelectValue placeholder="Select aspect ratio" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-gray-200">
                <SelectItem value="all">All (All available ratios)</SelectItem>
                <SelectItem value="16:9">16:9 (Standard Widescreen)</SelectItem>
                <SelectItem value="4:3">4:3 (Traditional)</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-300">
              Genre of Content
            </label>
            <Select
              name="genre"
              value={thumbnailPreferences.genre}
              onValueChange={(value) => handlePreferencesChange("genre", value)}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700 text-gray-200">
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-gray-200">
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeText"
                name="includeText"
                checked={thumbnailPreferences.includeText}
                onCheckedChange={(checked) =>
                  handlePreferencesChange("includeText", checked)
                }
                className="border-slate-700 data-[state=checked]:bg-blue-800"
              />
              <label
                htmlFor="includeText"
                className="text-sm font-medium text-gray-300"
              >
                Include Text in Thumbnail
              </label>
            </div>
            {thumbnailPreferences.includeText && (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Text Content
                </label>
                <Input
                  name="textContent"
                  value={thumbnailPreferences.textContent}
                  onChange={(e) =>
                    handlePreferencesChange("textContent", e.target.value)
                  }
                  placeholder="Enter thumbnail text..."
                  className="bg-slate-900 border-slate-700 text-gray-200 placeholder-gray-500"
                />
              </div>
            )}
          </div> */}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowPreferencesDialog(false)}
            className="bg-slate-700 hover:bg-slate-600 text-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={submitPreferences}
            disabled={isGeneratingImage}
            className="bg-blue-900 hover:bg-blue-800 text-gray-200"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrefrencesDialog;
