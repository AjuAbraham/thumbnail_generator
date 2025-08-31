import { enhanceQueryPrompt } from "@/lib/systemPrompt";
import ImageKit from "imagekit";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT,
});
export async function POST(request) {
  try {
    const {
      imageUrl,
      userQuery,
      aspectRatio,
      genre,
      channels,
      includeText,
      textContent,
    } = await request.json();
    if (!userQuery) {
      return NextResponse.json(
        {
          error: true,
          message: "Incomplete Payload both user query is required",
        },
        { status: 500 }
      );
    }

    const validAspectRatios = ["16:9", "4:3", "1:1", "9:16"];
    const validGenres = [
      "general",
      "gaming",
      "education",
      "lifestyle",
      "tech",
      "entertainment",
    ];

    // Determine aspect ratios to use
    const aspectRatios =
      aspectRatio === "all" ? validAspectRatios : [aspectRatio];

    // Validate aspect ratio
    if (aspectRatio !== "all" && !validAspectRatios.includes(aspectRatio)) {
      return NextResponse.json(
        {
          error: true,
          message: `Invalid aspect ratio: ${aspectRatio}. Must be one of: ${validAspectRatios.join(
            ", "
          )} or "all"`,
        },
        { status: 400 }
      );
    }

    if (!validGenres.includes(genre)) {
      return NextResponse.json(
        {
          error: true,
          message: `Invalid genre. Must be one of: ${validGenres.join(", ")}`,
        },
        { status: 400 }
      );
    }
    const formattedPrompt = enhanceQueryPrompt({
      genre,
      includeText,
      textContent: textContent || "Generate relevant text if needed",
    });
    const client = new OpenAI();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: formattedPrompt,
        },
        {
          role: "user",
          content: userQuery,
        },
      ],
    });
    const enhancedQuery = response.choices[0].message.content;
    // const thumbnailGenerationClient = new OpenAI({
    //   apiKey: process.env.GEMINI_API_KEY,
    //   baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    // });
    const thumbnailGenerationClient = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
    const referenceThumbnailsText =
      channels && channels.length > 0
        ? `Use the following YouTube thumbnail images as style references:\n${channels
            .map((url, index) => `- Reference ${index + 1}: ${url}`)
            .join("\n")}`
        : "No reference thumbnails provided.";
    const generatedResponse =
      await thumbnailGenerationClient.chat.completions.create({
        model: "google/gemini-2.5-flash-image-preview:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${userQuery}\n\n${referenceThumbnailsText}`,
              },
              ...(imageUrl
                ? [
                    {
                      type: "image_url",
                      image_url: { url: imageUrl },
                    },
                  ]
                : []),
              // ...(channels || []).map((url) => ({
              //   type: "image_url",
              //   image_url: { url },
              // })),
            ],
          },
        ],
      });
    const aspectRatioMap = {
      "16:9": { width: 1280, height: 720 },
      "4:3": { width: 1080, height: 1350 },
      "1:1": { width: 1080, height: 1080 },
      "9:16": { width: 720, height: 1280 },
    };
    const uploadedImages = await Promise.all(
      (generatedResponse.choices[0].message.images || []).map(
        async (img, idx) => {
          const base64Data = img.image_url.url.split(",")[1];
          const fileName = `thumbnail_${genre}_${Date.now()}_${idx}.png`;

          // Upload to ImageKit
          const upload = await imagekit.upload({
            file: base64Data,
            fileName,
            folder: `/thumbnails/${genre}`,
          });

          // Generate transformed URLs only for requested aspect ratios
          const transformedUrls = aspectRatios.map((ratio) => {
            const { width, height } = aspectRatioMap[ratio];
            return {
              aspectRatio: ratio,
              url: imagekit.url({
                path: upload.filePath,
                transformation: [
                  {
                    width,
                    height,
                    cropMode: "force",
                    quality: 90,
                  },
                ],
              }),
            };
          });

          return {
            filePath: upload.filePath,
            originalUrl: upload.url,
            transformedUrls,
            metadata: {
              genre,
              textContent: includeText ? textContent : null,
              requestedAspectRatio: aspectRatio,
            },
          };
        }
      )
    );

    return NextResponse.json(
      {
        uploadedImages,
        error: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.dir(error, 2);
    return NextResponse.json(
      { error: true, message: error || "Unable to generate thumbnail" },
      { status: 500 }
    );
  }
}
