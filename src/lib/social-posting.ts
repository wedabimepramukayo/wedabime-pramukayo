/**
 * Social Media Auto-Posting — Wedabime Pramukayo CMS
 *
 * Core posting logic for cross-platform blog post distribution.
 * Each platform function generates appropriate content and posts via its API.
 *
 * Platform APIs:
 * - Facebook: Graph API v18.0
 * - Threads: Threads API (via Instagram Graph API)
 * - Instagram: Instagram Graph API (via Facebook)
 * - Blogger: Blogger API v3
 * - Medium: Medium REST API
 * - Reddit: Reddit API (OAuth2)
 *
 * All functions are Edge-compatible (fetch-based, no Node.js APIs).
 */

import { db } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────

interface SocialAccountData {
  id: string;
  platform: string;
  accessToken: string | null;
  refreshToken: string | null;
  accountId: string | null;
  accountName: string | null;
  isActive: boolean;
}

interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  tags: string | null;
}

interface PostResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
  content?: string;
}

// ─── Helpers ──────────────────────────────────────────────────

const SITE_URL = () => {
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    throw new Error("NEXT_PUBLIC_SITE_URL environment variable is required for social posting");
  }
  return process.env.NEXT_PUBLIC_SITE_URL;
};

/** Generate a short excerpt from HTML content */
function extractExcerpt(content: string, maxLength = 200): string {
  const text = content
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

/** Parse tags from JSON string */
function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Generate hashtags from blog post tags */
function generateHashtags(tags: string[], platform: string): string {
  if (tags.length === 0) return "";

  const limit = platform === "twitter" || platform === "threads" ? 5 : 10;
  const selected = tags.slice(0, limit);

  // Convert to hashtag format (remove spaces, special chars)
  return selected
    .map((tag) =>
      "#" +
      tag
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "")
        .trim()
    )
    .filter((t) => t.length > 1)
    .join(" ");
}

/** Create the blog post URL */
function blogPostUrl(slug: string): string {
  return `${SITE_URL()}/blog/${slug}`;
}

// ─── Platform Post Functions ──────────────────────────────────

/**
 * Post to Facebook Page using Graph API
 * Posts a link with message to the connected Facebook Page
 */
export async function postToFacebook(
  account: SocialAccountData,
  blogPost: BlogPostData
): Promise<PostResult> {
  if (!account.accessToken || !account.accountId) {
    return { success: false, error: "Missing access token or page ID" };
  }

  const excerpt = blogPost.excerpt || extractExcerpt(blogPost.content);
  const hashtags = generateHashtags(parseTags(blogPost.tags), "facebook");
  const link = blogPostUrl(blogPost.slug);

  const message = `${blogPost.title}\n\n${excerpt}\n\n${link}${hashtags ? "\n\n" + hashtags : ""}`;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${account.accountId}/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          link,
          access_token: account.accessToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || `Facebook API error: ${response.status}`,
        content: message,
      };
    }

    return {
      success: true,
      platformPostId: data.id,
      content: message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Facebook post failed",
      content: message,
    };
  }
}

/**
 * Post to Threads using Threads API
 * Threads uses the Instagram Graph API under the hood
 */
export async function postToThreads(
  account: SocialAccountData,
  blogPost: BlogPostData
): Promise<PostResult> {
  if (!account.accessToken || !account.accountId) {
    return { success: false, error: "Missing access token or account ID" };
  }

  const excerpt = blogPost.excerpt || extractExcerpt(blogPost.content, 150);
  const hashtags = generateHashtags(parseTags(blogPost.tags), "threads");
  const link = blogPostUrl(blogPost.slug);

  // Threads has a 500 char limit for text posts
  const text = `${blogPost.title}\n\n${excerpt}\n\n${link}${hashtags ? "\n\n" + hashtags : ""}`.slice(0, 499);

  try {
    // Step 1: Create Threads media container
    const createResponse = await fetch(
      `https://graph.threads.net/v1.0/${account.accountId}/threads`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "TEXT",
          text,
          access_token: account.accessToken,
        }),
      }
    );

    const createData = await createResponse.json();

    if (!createResponse.ok || createData.error) {
      return {
        success: false,
        error: createData.error?.message || `Threads API error: ${createResponse.status}`,
        content: text,
      };
    }

    // Step 2: Publish the container
    const publishResponse = await fetch(
      `https://graph.threads.net/v1.0/${account.accountId}/threads_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: createData.id,
          access_token: account.accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (!publishResponse.ok || publishData.error) {
      return {
        success: false,
        error: publishData.error?.message || "Threads publish failed",
        content: text,
      };
    }

    return {
      success: true,
      platformPostId: publishData.id,
      content: text,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Threads post failed",
    };
  }
}

/**
 * Post to Instagram using Instagram Graph API (via Facebook)
 * Instagram requires an image; we use the cover image or a default
 */
export async function postToInstagram(
  account: SocialAccountData,
  blogPost: BlogPostData
): Promise<PostResult> {
  if (!account.accessToken || !account.accountId) {
    return { success: false, error: "Missing access token or account ID" };
  }

  if (!blogPost.coverImageUrl) {
    return { success: false, error: "Instagram requires a cover image for blog posts" };
  }

  const excerpt = blogPost.excerpt || extractExcerpt(blogPost.content, 150);
  const hashtags = generateHashtags(parseTags(blogPost.tags), "instagram");

  // Instagram caption limit: 2200 chars
  const caption = `${blogPost.title}\n\n${excerpt}\n\n${blogPostUrl(blogPost.slug)}${hashtags ? "\n\n" + hashtags : ""}`.slice(0, 2199);

  try {
    // Step 1: Create Instagram media container
    const createResponse = await fetch(
      `https://graph.facebook.com/v18.0/${account.accountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: blogPost.coverImageUrl,
          caption,
          access_token: account.accessToken,
        }),
      }
    );

    const createData = await createResponse.json();

    if (!createResponse.ok || createData.error) {
      return {
        success: false,
        error: createData.error?.message || `Instagram API error: ${createResponse.status}`,
        content: caption,
      };
    }

    // Step 2: Publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${account.accountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: createData.id,
          access_token: account.accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (!publishResponse.ok || publishData.error) {
      return {
        success: false,
        error: publishData.error?.message || "Instagram publish failed",
        content: caption,
      };
    }

    return {
      success: true,
      platformPostId: publishData.id,
      content: caption,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Instagram post failed",
    };
  }
}

/**
 * Post to Blogger using Blogger API v3
 * Creates a new blog post on the connected Blogger blog
 */
export async function postToBlogger(
  account: SocialAccountData,
  blogPost: BlogPostData
): Promise<PostResult> {
  if (!account.accessToken || !account.accountId) {
    return { success: false, error: "Missing access token or blog ID" };
  }

  const link = blogPostUrl(blogPost.slug);
  const content = `${blogPost.content}\n\n<p><a href="${link}">Read more on Wedabime Pramukayo</a></p>`;

  try {
    const response = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${account.accountId}/posts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${account.accessToken}`,
        },
        body: JSON.stringify({
          kind: "blogger#post",
          title: blogPost.title,
          content,
          labels: parseTags(blogPost.tags),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || `Blogger API error: ${response.status}`,
        content,
      };
    }

    return {
      success: true,
      platformPostId: data.id,
      content,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Blogger post failed",
    };
  }
}

/**
 * Post to Medium using Medium REST API
 * Creates a new post on the connected Medium account
 */
export async function postToMedium(
  account: SocialAccountData,
  blogPost: BlogPostData
): Promise<PostResult> {
  if (!account.accessToken) {
    return { success: false, error: "Missing access token" };
  }

  const link = blogPostUrl(blogPost.slug);
  const excerpt = blogPost.excerpt || extractExcerpt(blogPost.content);
  const content = `<h1>${blogPost.title}</h1>\n\n${blogPost.content}\n\n<p><em>Originally published on <a href="${link}">Wedabime Pramukayo</a></em></p>`;

  try {
    // First get the user's author ID
    const meResponse = await fetch("https://api.medium.com/v1/me", {
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const meData = await meResponse.json();

    if (!meResponse.ok || meData.errors) {
      return {
        success: false,
        error: meData.errors?.[0]?.message || "Failed to get Medium user info",
      };
    }

    const authorId = meData.data.id;

    // Create the post
    const response = await fetch(
      `https://api.medium.com/v1/publications/${authorId}/posts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${account.accessToken}`,
        },
        body: JSON.stringify({
          title: blogPost.title,
          contentFormat: "html",
          content,
          tags: parseTags(blogPost.tags),
          canonicalUrl: link,
          publishStatus: "draft", // Publish as draft for review
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.errors) {
      return {
        success: false,
        error: data.errors?.[0]?.message || `Medium API error: ${response.status}`,
        content,
      };
    }

    return {
      success: true,
      platformPostId: data.data?.id,
      content,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Medium post failed",
    };
  }
}

/**
 * Post to Reddit using Reddit API (OAuth2)
 * Creates a link post in the specified subreddit
 */
export async function postToReddit(
  account: SocialAccountData,
  blogPost: BlogPostData
): Promise<PostResult> {
  if (!account.accessToken || !account.accountId) {
    return { success: false, error: "Missing access token or subreddit" };
  }

  const link = blogPostUrl(blogPost.slug);
  const excerpt = blogPost.excerpt || extractExcerpt(blogPost.content);
  const subreddit = account.accountId; // Using accountId as subreddit name

  try {
    const response = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${account.accessToken}`,
        "User-Agent": "CMS-SocialPoster/1.0",
      },
      body: new URLSearchParams({
        sr: subreddit,
        kind: "link",
        title: blogPost.title,
        url: link,
        resubmit: "true",
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok || data.json?.errors?.length > 0) {
      const errorMsg = data.json?.errors?.[0]?.[1] || `Reddit API error: ${response.status}`;
      return {
        success: false,
        error: errorMsg,
        content: `${blogPost.title} - ${link}`,
      };
    }

    return {
      success: true,
      platformPostId: data.json?.data?.name,
      content: `${blogPost.title} - ${link}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Reddit post failed",
    };
  }
}

// ─── Orchestrator ─────────────────────────────────────────────

/** Map platform name to its posting function */
const platformPosters: Record<string, (account: SocialAccountData, blogPost: BlogPostData) => Promise<PostResult>> = {
  facebook: postToFacebook,
  threads: postToThreads,
  instagram: postToInstagram,
  blogger: postToBlogger,
  medium: postToMedium,
  reddit: postToReddit,
};

/**
 * Publish a blog post to all active social media accounts
 * Returns results for each platform attempt
 */
export async function publishToAllPlatforms(
  blogPost: BlogPostData,
  selectedPlatforms?: string[]
): Promise<Array<{ platform: string; accountName: string | null; result: PostResult }>> {
  // Get all active social accounts
  const where: any = { isActive: true };
  if (selectedPlatforms && selectedPlatforms.length > 0) {
    where.platform = { in: selectedPlatforms };
  }

  const accounts = await db.socialAccount.findMany({ where });

  if (accounts.length === 0) {
    return [];
  }

  const results: Array<{ platform: string; accountName: string | null; result: PostResult }> = [];

  for (const account of accounts) {
    const poster = platformPosters[account.platform];
    if (!poster) {
      results.push({
        platform: account.platform,
        accountName: account.accountName,
        result: { success: false, error: `Unsupported platform: ${account.platform}` },
      });
      continue;
    }

    try {
      const result = await poster(account as SocialAccountData, blogPost);

      // Save result to SocialPost record
      await db.socialPost.create({
        data: {
          blogPostId: blogPost.id,
          platform: account.platform,
          platformPostId: result.platformPostId,
          status: result.success ? "published" : "failed",
          content: result.content,
          error: result.error,
          publishedAt: result.success ? new Date() : null,
          socialAccountId: account.id,
        },
      });

      // Update lastUsedAt on the account
      if (result.success) {
        await db.socialAccount.update({
          where: { id: account.id },
          data: { lastUsedAt: new Date() },
        });
      }

      results.push({
        platform: account.platform,
        accountName: account.accountName,
        result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      results.push({
        platform: account.platform,
        accountName: account.accountName,
        result: { success: false, error: errorMsg },
      });

      // Save failure record
      await db.socialPost.create({
        data: {
          blogPostId: blogPost.id,
          platform: account.platform,
          status: "failed",
          error: errorMsg,
          socialAccountId: account.id,
        },
      });
    }
  }

  return results;
}

/**
 * Publish a blog post to a specific social account
 */
export async function publishToPlatform(
  accountId: string,
  blogPost: BlogPostData
): Promise<PostResult> {
  const account = await db.socialAccount.findUnique({ where: { id: accountId } });
  if (!account) {
    return { success: false, error: "Social account not found" };
  }

  if (!account.isActive) {
    return { success: false, error: "Social account is inactive" };
  }

  const poster = platformPosters[account.platform];
  if (!poster) {
    return { success: false, error: `Unsupported platform: ${account.platform}` };
  }

  const result = await poster(account as SocialAccountData, blogPost);

  // Save result
  await db.socialPost.create({
    data: {
      blogPostId: blogPost.id,
      platform: account.platform,
      platformPostId: result.platformPostId,
      status: result.success ? "published" : "failed",
      content: result.content,
      error: result.error,
      publishedAt: result.success ? new Date() : null,
      socialAccountId: account.id,
    },
  });

  if (result.success) {
    await db.socialAccount.update({
      where: { id: account.id },
      data: { lastUsedAt: new Date() },
    });
  }

  return result;
}
