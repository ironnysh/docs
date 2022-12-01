
  import { defineConfig } from "tinacms";
  
  // Your hosting provider likely exposes this as an environment variable
  const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";
  
  export default defineConfig({
    branch,
    clientId: "98e3dafb-cf28-42f1-b7ba-1ee5d04fa093",   // Get this from tina.io
    token: "44895078ba34d46ca73c767d1e59b2ea27de6d72",      // Get this from tina.io
    build: {
      outputFolder: "admin",
      publicFolder: "public",
    },
    media: {
      tina: {
        mediaRoot: "uploads",
        publicFolder: "public",
      },
    },
    schema: {
      collections: [
        {
          name: "post",
          label: "Posts",
          path: "content/posts",
          fields: [
            {
              type: "string",
              name: "title",
              label: "Title",
              isTitle: true,
              required: true,
            },
            {
              type: "rich-text",
              name: "body",
              label: "Body",
              isBody: true,
            },
          ],
        },
      ],
    },
  });
  