import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { channelName } = await request.json();
  if (!channelName) {
    return NextResponse.json(
      { error: true, message: "Channel name is required" },
      { status: 400 }
    );
  }
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const channelRes = await axios.get(
    `https://www.googleapis.com/youtube/v3/search`,
    {
      params: {
        part: "snippet",
        type: "channel",
        q: channelName,
        key: API_KEY,
      },
    }
  );

  if (!channelRes.data.items.length) {
    return NextResponse.json(
      { error: true, message: "Channel not found" },
      { status: 404 }
    );
  }
  const channel = channelRes.data.items[0].snippet;
  const channelId = channelRes.data.items[0].snippet.channelId;
  const avatar = channel.thumbnails.high.url;

  // Step 2: Fetch latest 3 videos
  const videosRes = await axios.get(
    `https://www.googleapis.com/youtube/v3/search`,
    {
      params: {
        part: "snippet",
        channelId,
        order: "date",
        maxResults: 10,
        type: "video",
        key: API_KEY,
      },
    }
  );
  const videoIds = videosRes.data.items
    .map((item) => item.id.videoId)
    .join(",");
  // Step 3: Get video details to filter Shorts
  const detailsRes = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos`,
    {
      params: {
        part: "contentDetails,snippet",
        id: videoIds,
        key: API_KEY,
      },
    }
  );

  // Utility to convert ISO 8601 duration → seconds
  function durationToSeconds(duration) {
    const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    const minutes = parseInt(match?.[1] || "0", 10);
    const seconds = parseInt(match?.[2] || "0", 10);
    return minutes * 60 + seconds;
  }

  // Filter out Shorts (< 60 seconds)
  const filteredVideos = detailsRes.data.items
    .filter((item) => durationToSeconds(item.contentDetails.duration) >= 140)
    .slice(0, 2);

  const thumbnails = filteredVideos.map((item) => ({
    title: videosRes.data.items[0].snippet.channelTitle,
    avatar,
    channelId,
    thumbnail: item.snippet.thumbnails.high.url,
    videoId: item.id,
  }));
  return NextResponse.json({
    error: false,
    thumbnails,
  });
}
